// Carga en Supabase un archivo del banco ya revisado.
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//   npm run banco:cargar -- banco/generado/prohibido/es-peliculas-facil.json
//
// Las tarjetas entran aprobadas; los misterios entran pendientes hasta tener
// su audio e imágenes. Lo que ya existe (misma huella) se ignora.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const archivo = process.argv[2];
if (!archivo) {
  console.error("Uso: npm run banco:cargar -- <archivo.json>");
  process.exit(1);
}

const juego = basename(archivo.replace(/\/[^/]+$/, ""));
const [idioma, ...resto] = basename(archivo, ".json").split("-");
const dificultad = resto.pop();
const tematica = resto.join("-");

const entradas: { huella: string; payload: unknown }[] = JSON.parse(
  readFileSync(archivo, "utf8"),
);

const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const { error, count } = await db.from("contenidos").upsert(
  entradas.map((e) => ({
    juego,
    tematica,
    dificultad,
    idioma,
    edad_min: dificultad === "facil" ? 6 : 10,
    payload: e.payload,
    huella: e.huella,
    origen: "precargado",
    estado: juego === "misterio" ? "pendiente" : "aprobado",
  })),
  { onConflict: "juego,idioma,huella", ignoreDuplicates: true, count: "exact" },
);
if (error) throw error;
console.log(`${archivo}: ${count ?? 0} contenidos nuevos cargados.`);
