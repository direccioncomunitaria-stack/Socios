// POST /functions/v1/siguiente-contenido
// Body: { grupoId, juego, tematica, dificultad, idioma?, edadMin? }
//
// Sirve la próxima unidad de contenido para el grupo y, si le queda poco sin
// jugar, repone el banco en segundo plano (el grupo no espera a la IA).
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { DIFICULTADES, IDIOMAS, JUEGOS, TEMATICAS } from "../_shared/motor/esquemas.ts";
import { hayQueReponer, reponer } from "../_shared/motor/reposicion.ts";

const Pedido = z.object({
  grupoId: z.uuid(),
  juego: z.enum(JUEGOS),
  tematica: z.string().min(1).max(60),
  dificultad: z.enum(DIFICULTADES),
  idioma: z.enum(IDIOMAS).default("es"),
  edadMin: z.number().int().min(4).max(99).default(8),
}).refine((p) => TEMATICAS[p.juego].includes(p.tematica), {
  message: "temática fuera del catálogo",
});

const url = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// ANTHROPIC_API_KEY desde los secrets del proyecto. Se crea solo al reponer,
// así servir contenido del banco funciona aunque falte la clave.
let ia: Anthropic | undefined;

Deno.serve(async (req) => {
  const pedido = Pedido.safeParse(await req.json().catch(() => null));
  if (!pedido.success) {
    return Response.json({ error: "pedido inválido" }, { status: 400 });
  }
  const p = pedido.data;

  // Cliente con el JWT del usuario: servir_contenido verifica que el grupo sea suyo.
  const usuario = createClient(url, anonKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data, error } = await usuario.rpc("servir_contenido", {
    p_grupo: p.grupoId,
    p_juego: p.juego,
    p_tematica: p.tematica,
    p_dificultad: p.dificultad,
    p_idioma: p.idioma,
  });
  if (error) {
    const status = error.code === "42501" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
  const fila = data?.[0];

  if (fila && hayQueReponer(p.juego, fila.sin_jugar, fila.total)) {
    const admin = createClient(url, serviceKey);
    EdgeRuntime.waitUntil(
      reponer(admin, (ia ??= new Anthropic()), p).catch((e) =>
        console.error("reposición falló", e)
      ),
    );
  }

  if (!fila?.contenido_id) {
    // Banco vacío para esta combinación: la reposición ya arrancó.
    return Response.json({ contenido: null, generando: true }, { status: 202 });
  }
  return Response.json({
    contenido: {
      id: fila.contenido_id,
      payload: fila.payload,
      multimedia: fila.multimedia,
      repetido: fila.repetido,
    },
  });
});
