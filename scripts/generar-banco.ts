// Genera el banco inicial en archivos JSON para revisión humana antes de cargarlo.
//
//   npm run banco:generar -- prohibido peliculas facil [lotes] [idioma]
//
// Escribe en banco/generado/<juego>/<idioma>-<tematica>-<dificultad>.json y,
// si el archivo ya existe, agrega sin repetir lo que ya contiene.
import Anthropic from "@anthropic-ai/sdk";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  DIFICULTADES,
  type Dificultad,
  IDIOMAS,
  type Idioma,
  JUEGOS,
  type JuegoId,
  TEMATICAS,
} from "../supabase/functions/_shared/motor/esquemas.ts";
import { generarLote } from "../supabase/functions/_shared/motor/generador.ts";

const [juego, tematica, dificultad, lotesArg = "1", idioma = "es"] = process.argv.slice(2);

function uso(motivo: string): never {
  console.error(`${motivo}
Uso: npm run banco:generar -- <juego> <tematica> <dificultad> [lotes] [idioma]
  juego:      ${JUEGOS.join(" | ")}
  dificultad: ${DIFICULTADES.join(" | ")}
  idioma:     ${IDIOMAS.join(" | ")}`);
  process.exit(1);
}

if (!JUEGOS.includes(juego as JuegoId)) uso("juego inválido");
if (!TEMATICAS[juego as JuegoId].includes(tematica)) {
  uso(`temática inválida; opciones: ${TEMATICAS[juego as JuegoId].join(", ")}`);
}
if (!DIFICULTADES.includes(dificultad as Dificultad)) uso("dificultad inválida");
if (!IDIOMAS.includes(idioma as Idioma)) uso("idioma inválido");

const params = {
  juego: juego as JuegoId,
  tematica,
  dificultad: dificultad as Dificultad,
  idioma: idioma as Idioma,
  edadMin: dificultad === "facil" ? 6 : 10,
};
const archivo = `banco/generado/${juego}/${idioma}-${tematica}-${dificultad}.json`;

type Entrada = { huella: string; payload: unknown };
const banco: Entrada[] = existsSync(archivo)
  ? JSON.parse(readFileSync(archivo, "utf8"))
  : [];

const ia = new Anthropic();
for (let i = 1; i <= Number(lotesArg); i++) {
  const r = await generarLote(ia, params, banco.map((e) => e.huella));
  banco.push(...r.aceptados);
  console.log(
    `lote ${i}: +${r.aceptados.length} aceptados, ${r.rechazados.length} rechazados` +
      ` (tokens ${r.tokensEntrada} in / ${r.tokensSalida} out) → total ${banco.length}`,
  );
  for (const x of r.rechazados) console.log(`  ✗ ${x.huella}: ${x.motivo}`);
}

mkdirSync(dirname(archivo), { recursive: true });
writeFileSync(archivo, JSON.stringify(banco, null, 2) + "\n");
console.log(`Guardado en ${archivo}`);
