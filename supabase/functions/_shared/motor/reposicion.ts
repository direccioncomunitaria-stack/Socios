// Reposición del banco: decide cuándo hace falta contenido nuevo y lo genera.
import type Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  HUELLAS_A_EVITAR,
  MINIMO_SIN_JUGAR,
  PAUSA_ENTRE_REPOSICIONES_MIN,
  UMBRAL_REPOSICION,
} from "./config.ts";
import type { JuegoId, Parametros } from "./esquemas.ts";
import { generarLote } from "./generador.ts";

/** ¿Al grupo le queda poco contenido sin jugar para esta combinación? */
export function hayQueReponer(
  juego: JuegoId,
  sinJugar: number,
  total: number,
): boolean {
  if (total === 0) return true;
  return sinJugar / total < UMBRAL_REPOSICION || sinJugar < MINIMO_SIN_JUGAR[juego];
}

/**
 * Genera un lote y lo guarda en el banco. Debe llamarse con un cliente de
 * service role. No hace nada si hubo una generación reciente para la misma
 * combinación, ni si hay una en curso (lo garantiza el índice único
 * `generaciones_en_curso_idx`).
 */
export async function reponer(
  db: SupabaseClient,
  ia: Anthropic,
  p: Parametros,
): Promise<void> {
  const combinacion = {
    juego: p.juego,
    tematica: p.tematica,
    dificultad: p.dificultad,
    idioma: p.idioma,
  };

  const desde = new Date(Date.now() - PAUSA_ENTRE_REPOSICIONES_MIN * 60_000);
  const { count, error: errReciente } = await db
    .from("generaciones")
    .select("id", { count: "exact", head: true })
    .match(combinacion)
    .gte("iniciada_en", desde.toISOString());
  if (errReciente) throw errReciente;
  if (count) return;

  const { data: gen, error: errInicio } = await db
    .from("generaciones")
    .insert(combinacion)
    .select("id")
    .single();
  if (errInicio) {
    if (errInicio.code === "23505") return; // ya hay una en curso
    throw errInicio;
  }

  try {
    const { data: existentes, error } = await db
      .from("contenidos")
      .select("huella")
      .eq("juego", p.juego)
      .eq("idioma", p.idioma)
      .eq("tematica", p.tematica)
      .order("creado_en", { ascending: false })
      .limit(HUELLAS_A_EVITAR);
    if (error) throw error;

    const r = await generarLote(ia, p, existentes.map((e) => e.huella));

    if (r.aceptados.length > 0) {
      const { error: errInsert } = await db.from("contenidos").upsert(
        r.aceptados.map((a) => ({
          ...combinacion,
          edad_min: p.edadMin,
          payload: a.payload,
          huella: a.huella,
          origen: "ia",
          // Los misterios esperan su audio e imágenes antes de publicarse.
          estado: p.juego === "misterio" ? "pendiente" : "aprobado",
        })),
        { onConflict: "juego,idioma,huella", ignoreDuplicates: true },
      );
      if (errInsert) throw errInsert;
    }

    await db
      .from("generaciones")
      .update({
        modelo: r.modelo,
        tokens_entrada: r.tokensEntrada,
        tokens_salida: r.tokensSalida,
        aceptados: r.aceptados.length,
        rechazados: r.rechazados.length,
        terminada_en: new Date().toISOString(),
      })
      .eq("id", gen.id);
  } catch (e) {
    await db
      .from("generaciones")
      .update({ error: String(e), terminada_en: new Date().toISOString() })
      .eq("id", gen.id);
    throw e;
  }
}
