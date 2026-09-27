// Generador de contenido: pide un lote a Claude, lo valida y devuelve solo lo
// que puede entrar al banco. Se usa igual desde las Edge Functions (Deno) y
// desde los scripts de carga inicial (Node).
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { CONFIG_JUEGOS } from "./config.ts";
import { LoteMisterio, LoteProhibido, type Parametros } from "./esquemas.ts";
import { mensajeUsuario, SISTEMA } from "./prompts.ts";
import {
  huellaCaso,
  huellaTarjeta,
  type Resultado,
  validarCaso,
  validarTarjeta,
} from "./validacion.ts";

export interface ContenidoNuevo {
  payload: unknown;
  huella: string;
}

export interface ResultadoGeneracion {
  aceptados: ContenidoNuevo[];
  rechazados: { huella: string; motivo: string }[];
  modelo: string;
  tokensEntrada: number;
  tokensSalida: number;
}

export class GeneracionRechazada extends Error {}

export async function generarLote(
  cliente: Anthropic,
  params: Parametros,
  evitar: string[] = [],
): Promise<ResultadoGeneracion> {
  const cfg = CONFIG_JUEGOS[params.juego];
  const formato =
    params.juego === "prohibido"
      ? betaZodOutputFormat(LoteProhibido)
      : betaZodOutputFormat(LoteMisterio);

  const respuesta = await cliente.beta.messages.parse({
    model: cfg.modelo,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: cfg.esfuerzo, format: formato },
    // Si el modelo declina (poco probable en contenido familiar), la API
    // reintenta con el modelo alternativo recomendado sin otra llamada.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SISTEMA[params.juego],
    messages: [
      { role: "user", content: mensajeUsuario(params, cfg.tamanoLote, evitar) },
    ],
  });

  if (respuesta.stop_reason === "refusal") {
    throw new GeneracionRechazada(
      respuesta.stop_details?.explanation ?? "la IA declinó generar el contenido",
    );
  }
  if (respuesta.stop_reason === "max_tokens" || !respuesta.parsed_output) {
    throw new Error(`salida incompleta (stop_reason=${respuesta.stop_reason})`);
  }

  const items =
    "tarjetas" in respuesta.parsed_output
      ? respuesta.parsed_output.tarjetas.map((t) => ({
          payload: t,
          huella: huellaTarjeta(t),
          resultado: validarTarjeta(t),
        }))
      : respuesta.parsed_output.casos.map((c) => ({
          payload: c,
          huella: huellaCaso(c),
          resultado: validarCaso(c),
        }));

  return {
    ...filtrar(items, evitar),
    modelo: respuesta.model,
    tokensEntrada: respuesta.usage.input_tokens,
    tokensSalida: respuesta.usage.output_tokens,
  };
}

/** Descarta inválidos, repetidos contra el banco y repetidos dentro del lote. */
export function filtrar(
  items: { payload: unknown; huella: string; resultado: Resultado }[],
  evitar: string[],
): Pick<ResultadoGeneracion, "aceptados" | "rechazados"> {
  const vistas = new Set(evitar);
  const aceptados: ContenidoNuevo[] = [];
  const rechazados: { huella: string; motivo: string }[] = [];

  for (const { payload, huella, resultado } of items) {
    if (!resultado.ok) {
      rechazados.push({ huella, motivo: resultado.motivo });
    } else if (vistas.has(huella)) {
      rechazados.push({ huella, motivo: "repetido" });
    } else {
      vistas.add(huella);
      aceptados.push({ payload, huella });
    }
  }
  return { aceptados, rechazados };
}
