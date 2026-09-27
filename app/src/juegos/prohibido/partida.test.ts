import assert from "node:assert/strict";
import { test } from "node:test";
import { validarTarjeta } from "../../../../supabase/functions/_shared/motor/validacion.ts";
import { crearMazo, TARJETAS_DEMO } from "../../datos/banco-demo.ts";
import { ganadores, nuevaPartida, type Partida, partidaReducer } from "./partida.ts";

const t = { palabra: "x", prohibidas: [] };

function turno(p: Partida, aciertos: number, faltas: number): Partida {
  p = partidaReducer(p, { tipo: "iniciarTurno", tarjeta: t });
  for (let i = 0; i < aciertos; i++) p = partidaReducer(p, { tipo: "correcta", siguiente: t });
  for (let i = 0; i < faltas; i++) p = partidaReducer(p, { tipo: "falta", siguiente: t });
  p = partidaReducer(p, { tipo: "pasar", siguiente: t });
  p = partidaReducer(p, { tipo: "finTurno" });
  return partidaReducer(p, { tipo: "siguienteTurno" });
}

test("una partida de 2 equipos y 2 rondas termina tras 4 turnos con los puntos correctos", () => {
  let p = nuevaPartida(["A", "B"], 2);
  p = turno(p, 3, 1); // A: +2
  assert.equal(p.equipoActual, 1);
  p = turno(p, 1, 0); // B: +1
  assert.equal(p.rondaActual, 2);
  p = turno(p, 2, 0); // A: +2
  assert.equal(p.fase, "previa");
  p = turno(p, 0, 2); // B: −2
  assert.equal(p.fase, "final");
  assert.deepEqual(p.equipos.map((e) => e.puntos), [4, -1]);
  assert.deepEqual(ganadores(p).map((e) => e.nombre), ["A"]);
});

test("las acciones fuera de fase se ignoran", () => {
  const p = nuevaPartida(["A", "B"], 1);
  assert.equal(partidaReducer(p, { tipo: "correcta", siguiente: t }), p);
  assert.equal(partidaReducer(p, { tipo: "finTurno" }), p);
});

test("el banco demo cumple las reglas del motor de contenido", () => {
  for (const tarjeta of TARJETAS_DEMO) {
    assert.deepEqual(validarTarjeta(tarjeta), { ok: true }, tarjeta.palabra);
  }
});

test("el mazo no repite hasta agotar todas las tarjetas", () => {
  const siguiente = crearMazo();
  const vistas = new Set(TARJETAS_DEMO.map(() => siguiente().palabra));
  assert.equal(vistas.size, TARJETAS_DEMO.length);
});
