import type { Dificultad, Idioma, JuegoId, Parametros } from "./esquemas.ts";

const NOMBRE_IDIOMA: Record<Idioma, string> = {
  es: "español latinoamericano neutro",
  pt: "portugués de Brasil",
};

const DIFICULTAD: Record<Dificultad, string> = {
  facil: "fácil: palabras muy conocidas, aptas para chicos",
  media: "media: palabras conocidas por la mayoría de los adultos",
  dificil: "difícil: palabras menos obvias o conceptos abstractos",
};

const BASE = `Creás contenido para una app de juegos para familias y grupos de amigos
que se juega en persona. Todo el contenido debe ser apto para toda la familia:
sin violencia gráfica, sin contenido sexual, sin lenguaje ofensivo, sin
estereotipos. No uses marcas registradas como nombre de juego. El contenido
tiene que ser original y variado: los jugadores pagan una suscripción porque
el contenido no se repite.`;

// El prompt de sistema es fijo por juego; todo lo que varía (temática,
// dificultad, huellas a evitar) va en el mensaje del usuario.
export const SISTEMA: Record<JuegoId, string> = {
  prohibido: `${BASE}

Juego: "Prohibido decirlo". Un jugador ve una tarjeta con una palabra y tiene
que hacer que su equipo la adivine sin decir la palabra ni ninguna de las 5
palabras prohibidas. Buenas tarjetas:
- La palabra pertenece claramente a la temática pedida.
- Las 5 prohibidas son las pistas más obvias que alguien usaría para
  describirla (eso es lo que hace desafiante el juego).
- Ninguna prohibida contiene la palabra ni es una forma de ella.
- No hay dos tarjetas con la misma palabra.`,

  misterio: `${BASE}

Juego: "Misterio: ¿quién fue?". El grupo escucha una historia narrada en
escenas, recibe pistas por rondas y debe deducir quién es el culpable.
Aunque el juego se llama "misterio", el "crimen" debe ser apto para la edad
indicada (para chicos: un robo, una desaparición, una travesura; para
adultos puede ser un asesinato sin detalles gráficos).
Requisitos de un buen caso:
- Entre 3 y 6 personajes, cada uno con motivo aparente y coartada.
- Exactamente un culpable, deducible de forma lógica y única a partir de las
  pistas. Ningún otro personaje puede ser compatible con todas las pistas.
- Al menos 4 pistas repartidas en rondas, de menor a mayor revelación, con
  al menos una pista falsa (que apunte a un inocente) y que se descarte con otra.
- Entre 2 y 4 escenas. La narración de cada escena está escrita para leerse
  en voz alta: frases claras, ritmo de relato, entre 80 y 180 palabras.
- Para cada escena y cada personaje, una descripción visual breve (estilo
  ilustración, sin texto en la imagen) para generar la imagen después.
- El culpable debe figurar con el nombre exacto de uno de los personajes.`,
};

export function mensajeUsuario(
  p: Parametros,
  cantidad: number,
  evitar: string[],
): string {
  const unidad = p.juego === "prohibido" ? `${cantidad} tarjetas` : `${cantidad} caso(s)`;
  const lineas = [
    `Generá ${unidad}.`,
    `Idioma: ${NOMBRE_IDIOMA[p.idioma]}.`,
    `Temática: ${p.tematica}.`,
    `Dificultad: ${DIFICULTAD[p.dificultad]}.`,
    `Edad mínima de los jugadores: ${p.edadMin} años.`,
  ];
  if (evitar.length > 0) {
    lineas.push(
      "",
      "Ya existen estos contenidos; no los repitas ni hagas variantes cercanas:",
      ...evitar.map((h) => `- ${h}`),
    );
  }
  return lineas.join("\n");
}
