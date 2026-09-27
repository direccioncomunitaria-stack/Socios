// Formato de cada tipo de contenido. La IA devuelve exactamente estas formas
// (salida estructurada) y la app sabe mostrarlas.
import { z } from "zod";

export const JUEGOS = ["prohibido", "misterio"] as const;
export type JuegoId = (typeof JUEGOS)[number];

export const DIFICULTADES = ["facil", "media", "dificil"] as const;
export type Dificultad = (typeof DIFICULTADES)[number];

export const IDIOMAS = ["es", "pt"] as const;
export type Idioma = (typeof IDIOMAS)[number];

/**
 * Catálogo cerrado de temáticas: solo se genera contenido para estas, así
 * nadie puede usar la app para pedirle a la IA temas arbitrarios.
 */
export const TEMATICAS: Record<JuegoId, readonly string[]> = {
  prohibido: [
    "general", "peliculas", "series", "animales", "comida", "deportes",
    "musica", "paises-y-ciudades", "profesiones", "objetos-de-la-casa",
  ],
  misterio: [
    "mansion", "crucero", "escuela", "circo", "museo", "campamento",
  ],
};

export interface Parametros {
  juego: JuegoId;
  tematica: string;
  dificultad: Dificultad;
  idioma: Idioma;
  /** Edad mínima de los jugadores; condiciona vocabulario y contenido. */
  edadMin: number;
}

// --- Prohibido decirlo (mecánica tipo tabú) ---

export const TarjetaProhibido = z.object({
  palabra: z.string().describe("Palabra o expresión a adivinar"),
  prohibidas: z
    .array(z.string())
    .describe("Exactamente 5 palabras que el jugador NO puede decir"),
});
export type TarjetaProhibido = z.infer<typeof TarjetaProhibido>;

export const LoteProhibido = z.object({
  tarjetas: z.array(TarjetaProhibido),
});

// --- Misterio: ¿quién fue? ---

export const Personaje = z.object({
  nombre: z.string(),
  rol: z.string().describe("Relación con la historia, ej. 'la cocinera'"),
  descripcion: z.string(),
  coartada: z.string(),
  retrato: z
    .string()
    .describe("Descripción visual del personaje para generar su retrato"),
});

export const Escena = z.object({
  titulo: z.string(),
  narracion: z
    .string()
    .describe("Texto para leer en voz alta (se convierte en audio)"),
  imagen: z.string().describe("Descripción visual de la escena para ilustrarla"),
});

export const Pista = z.object({
  ronda: z.number().int().describe("Ronda en la que se revela, desde 1"),
  texto: z.string(),
});

export const CasoMisterio = z.object({
  titulo: z.string(),
  ambientacion: z.string(),
  personajes: z.array(Personaje),
  escenas: z.array(Escena),
  pistas: z.array(Pista),
  culpable: z.string().describe("Nombre exacto de uno de los personajes"),
  motivo: z.string(),
  solucion: z
    .string()
    .describe("Explicación que conecta las pistas con el culpable"),
});
export type CasoMisterio = z.infer<typeof CasoMisterio>;

export const LoteMisterio = z.object({
  casos: z.array(CasoMisterio),
});
