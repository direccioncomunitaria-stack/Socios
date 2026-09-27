// Lógica de una partida de "Prohibido decirlo" en modo "pasar el teléfono".
// Es un reducer puro: no sabe de pantallas ni de dónde salen las tarjetas.

export interface Tarjeta {
  palabra: string;
  prohibidas: string[];
}

export interface Equipo {
  nombre: string;
  puntos: number;
}

export interface Turno {
  correctas: number;
  pasadas: number;
  faltas: number;
}

export type Fase = "previa" | "turno" | "resumen" | "final";

export interface Partida {
  fase: Fase;
  equipos: Equipo[];
  equipoActual: number;
  rondaActual: number;
  rondasTotales: number;
  tarjeta: Tarjeta | null;
  turno: Turno;
}

export type Accion =
  | { tipo: "iniciarTurno"; tarjeta: Tarjeta }
  | { tipo: "correcta"; siguiente: Tarjeta }
  | { tipo: "pasar"; siguiente: Tarjeta }
  | { tipo: "falta"; siguiente: Tarjeta }
  | { tipo: "finTurno" }
  | { tipo: "siguienteTurno" };

const TURNO_VACIO: Turno = { correctas: 0, pasadas: 0, faltas: 0 };

export function nuevaPartida(nombresEquipos: string[], rondas: number): Partida {
  return {
    fase: "previa",
    equipos: nombresEquipos.map((nombre) => ({ nombre, puntos: 0 })),
    equipoActual: 0,
    rondaActual: 1,
    rondasTotales: rondas,
    tarjeta: null,
    turno: TURNO_VACIO,
  };
}

/** Puntos del turno: +1 por acierto, −1 por decir una palabra prohibida. */
export function puntosTurno(t: Turno): number {
  return t.correctas - t.faltas;
}

export function partidaReducer(p: Partida, a: Accion): Partida {
  switch (a.tipo) {
    case "iniciarTurno":
      if (p.fase !== "previa") return p;
      return { ...p, fase: "turno", tarjeta: a.tarjeta, turno: TURNO_VACIO };

    case "correcta":
    case "pasar":
    case "falta": {
      if (p.fase !== "turno") return p;
      const campo = a.tipo === "correcta" ? "correctas" : a.tipo === "pasar" ? "pasadas" : "faltas";
      return {
        ...p,
        tarjeta: a.siguiente,
        turno: { ...p.turno, [campo]: p.turno[campo] + 1 },
      };
    }

    case "finTurno": {
      if (p.fase !== "turno") return p;
      const equipos = p.equipos.map((e, i) =>
        i === p.equipoActual ? { ...e, puntos: e.puntos + puntosTurno(p.turno) } : e,
      );
      return { ...p, fase: "resumen", equipos, tarjeta: null };
    }

    case "siguienteTurno": {
      if (p.fase !== "resumen") return p;
      const ultimoEquipo = p.equipoActual === p.equipos.length - 1;
      if (ultimoEquipo && p.rondaActual === p.rondasTotales) {
        return { ...p, fase: "final" };
      }
      return {
        ...p,
        fase: "previa",
        equipoActual: ultimoEquipo ? 0 : p.equipoActual + 1,
        rondaActual: ultimoEquipo ? p.rondaActual + 1 : p.rondaActual,
      };
    }
  }
}

/** Equipos ordenados por puntaje; en caso de empate, todos los empatados ganan. */
export function ganadores(p: Partida): Equipo[] {
  const max = Math.max(...p.equipos.map((e) => e.puntos));
  return p.equipos.filter((e) => e.puntos === max);
}
