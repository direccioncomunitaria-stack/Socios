import type { JuegoId } from "./esquemas.ts";

type Esfuerzo = "low" | "medium" | "high";

export interface ConfigJuego {
  modelo: string;
  /** Profundidad de razonamiento: las tarjetas son simples, los misterios no. */
  esfuerzo: Esfuerzo;
  /** Cuántas unidades se piden en cada llamada a la IA. */
  tamanoLote: number;
}

export const CONFIG_JUEGOS: Record<JuegoId, ConfigJuego> = {
  prohibido: { modelo: "claude-opus-5", esfuerzo: "low", tamanoLote: 30 },
  misterio: { modelo: "claude-opus-5", esfuerzo: "high", tamanoLote: 1 },
};

/**
 * Cuando a un grupo le queda menos de esta fracción del banco sin jugar
 * (para una combinación juego/temática/dificultad/idioma), se repone en
 * segundo plano.
 */
export const UMBRAL_REPOSICION = 0.2;

/** Mínimo absoluto sin jugar por debajo del cual también se repone. */
export const MINIMO_SIN_JUGAR: Record<JuegoId, number> = {
  prohibido: 40,
  misterio: 3,
};

/** Cuántas huellas recientes se le pasan a la IA para que no repita. */
export const HUELLAS_A_EVITAR = 300;

/**
 * Pausa mínima entre dos reposiciones de la misma combinación: un grupo que
 * juega mucho no puede disparar generaciones en cadena.
 */
export const PAUSA_ENTRE_REPOSICIONES_MIN = 10;
