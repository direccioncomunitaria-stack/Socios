// Reglas de cada juego que la salida estructurada no puede garantizar por sí sola.
// Todo contenido (precargado o generado) pasa por acá antes de entrar al banco.
import type { CasoMisterio, TarjetaProhibido } from "./esquemas.ts";

/** Minúsculas, sin acentos ni signos: base para comparar y deduplicar. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type Resultado = { ok: true } | { ok: false; motivo: string };

export function validarTarjeta(t: TarjetaProhibido): Resultado {
  const palabra = normalizar(t.palabra);
  if (!palabra) return { ok: false, motivo: "palabra vacía" };

  const prohibidas = t.prohibidas.map(normalizar);
  if (prohibidas.length !== 5) {
    return { ok: false, motivo: `se esperaban 5 prohibidas, hay ${prohibidas.length}` };
  }
  if (new Set(prohibidas).size !== 5 || prohibidas.some((p) => !p)) {
    return { ok: false, motivo: "prohibidas repetidas o vacías" };
  }
  // Si una prohibida contiene la palabra (o al revés) la tarjeta es trivial.
  for (const p of prohibidas) {
    if (p.includes(palabra) || palabra.includes(p)) {
      return { ok: false, motivo: `la prohibida "${p}" contiene la palabra` };
    }
  }
  return { ok: true };
}

export function validarCaso(c: CasoMisterio): Resultado {
  const nombres = c.personajes.map((p) => normalizar(p.nombre));
  if (c.personajes.length < 3 || c.personajes.length > 6) {
    return { ok: false, motivo: "se esperan entre 3 y 6 personajes" };
  }
  if (new Set(nombres).size !== nombres.length) {
    return { ok: false, motivo: "personajes con nombres repetidos" };
  }
  if (!nombres.includes(normalizar(c.culpable))) {
    return { ok: false, motivo: "el culpable no es uno de los personajes" };
  }
  if (c.escenas.length < 2) {
    return { ok: false, motivo: "se esperan al menos 2 escenas" };
  }
  if (c.pistas.length < 4) {
    return { ok: false, motivo: "se esperan al menos 4 pistas" };
  }
  if (c.pistas.some((p) => p.ronda < 1)) {
    return { ok: false, motivo: "rondas de pista inválidas" };
  }
  return { ok: true };
}

/**
 * Huella para la anti-repetición: dos contenidos con la misma huella se
 * consideran el mismo aunque cambie la redacción.
 */
export function huellaTarjeta(t: TarjetaProhibido): string {
  return normalizar(t.palabra);
}

export function huellaCaso(c: CasoMisterio): string {
  return `${normalizar(c.culpable)} | ${normalizar(c.ambientacion)}`;
}
