import assert from "node:assert/strict";
import { test } from "node:test";
import type { CasoMisterio } from "./esquemas.ts";
import { filtrar } from "./generador.ts";
import {
  huellaTarjeta,
  normalizar,
  validarCaso,
  validarTarjeta,
} from "./validacion.ts";

test("normalizar quita acentos, mayúsculas y signos", () => {
  assert.equal(normalizar("  ¡Canción  Pingüino! "), "cancion pinguino");
});

test("tarjeta válida", () => {
  const r = validarTarjeta({
    palabra: "Playa",
    prohibidas: ["arena", "mar", "sol", "verano", "vacaciones"],
  });
  assert.deepEqual(r, { ok: true });
});

test("tarjeta con una prohibida que contiene la palabra es inválida", () => {
  const r = validarTarjeta({
    palabra: "Sol",
    prohibidas: ["solcito", "calor", "cielo", "día", "amarillo"],
  });
  assert.equal(r.ok, false);
});

test("tarjeta con prohibidas repetidas (ignorando acentos) es inválida", () => {
  const r = validarTarjeta({
    palabra: "Tren",
    prohibidas: ["vía", "via", "vagón", "estación", "locomotora"],
  });
  assert.equal(r.ok, false);
});

const caso: CasoMisterio = {
  titulo: "El pastel desaparecido",
  ambientacion: "Cumpleaños en la casa de la abuela",
  personajes: ["Ana", "Beto", "Carla"].map((nombre) => ({
    nombre,
    rol: "invitado",
    descripcion: "",
    coartada: "",
    retrato: "",
  })),
  escenas: [
    { titulo: "1", narracion: "...", imagen: "..." },
    { titulo: "2", narracion: "...", imagen: "..." },
  ],
  pistas: [1, 1, 2, 3].map((ronda) => ({ ronda, texto: "..." })),
  culpable: "Beto",
  motivo: "Tenía hambre",
  solucion: "...",
};

test("caso válido", () => {
  assert.deepEqual(validarCaso(caso), { ok: true });
});

test("caso cuyo culpable no es un personaje es inválido", () => {
  assert.equal(validarCaso({ ...caso, culpable: "El mayordomo" }).ok, false);
});

test("filtrar descarta inválidos y repetidos contra el banco y el lote", () => {
  const t = (palabra: string) => ({
    payload: { palabra },
    huella: huellaTarjeta({ palabra, prohibidas: [] }),
    resultado: { ok: true } as const,
  });
  const { aceptados, rechazados } = filtrar(
    [
      t("Playa"),
      t("Montaña"),
      t("montana"),
      { ...t("Río"), resultado: { ok: false, motivo: "x" } },
    ],
    ["playa"],
  );
  assert.deepEqual(aceptados.map((a) => a.huella), ["montana"]);
  assert.deepEqual(rechazados.map((r) => r.motivo), ["repetido", "repetido", "x"]);
});
