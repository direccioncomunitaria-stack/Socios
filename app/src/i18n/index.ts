// Textos de la app por idioma. Español al lanzamiento, portugués como segundo
// idioma (D9). Toda cadena visible pasa por `t()`.
import { getLocales } from "expo-localization";

const es = {
  inicio_titulo: "¿A qué jugamos hoy?",
  inicio_subtitulo: "Juegos para familia y amigos, siempre con contenido nuevo",
  proximamente: "Próximamente",
  prohibido_nombre: "Prohibido decirlo",
  prohibido_desc: "Hacé que tu equipo adivine la palabra sin decir las prohibidas.",
  misterio_nombre: "Misterio: ¿quién fue?",
  misterio_desc: "Escuchen la historia, sigan las pistas y descubran al culpable.",
  config_equipos: "Equipos",
  config_rondas: "Rondas",
  config_segundos: "Segundos por turno",
  empezar: "Empezar",
  turno_de: "Turno de",
  ronda: "Ronda",
  pasale_telefono: "Pasale el teléfono a quien va a explicar. ¡Que el resto no mire la pantalla!",
  listo: "¡Listo!",
  no_digas: "No digas",
  correcta: "¡Adivinaron!",
  pasar: "Pasar",
  falta: "Dije una prohibida",
  tiempo: "¡Tiempo!",
  aciertos: "Aciertos",
  faltas: "Prohibidas dichas",
  pasadas: "Pasadas",
  puntos_turno: "Puntos del turno",
  siguiente_turno: "Siguiente turno",
  ver_resultado: "Ver resultado",
  resultado: "Resultado final",
  gano: "¡Ganó",
  empate: "¡Empate!",
  jugar_otra: "Jugar otra vez",
  volver_inicio: "Volver al inicio",
  equipo: "Equipo",
};

type Clave = keyof typeof es;

const pt: Record<Clave, string> = {
  inicio_titulo: "Do que vamos jogar hoje?",
  inicio_subtitulo: "Jogos para família e amigos, sempre com conteúdo novo",
  proximamente: "Em breve",
  prohibido_nombre: "Proibido falar",
  prohibido_desc: "Faça sua equipe adivinhar a palavra sem dizer as proibidas.",
  misterio_nombre: "Mistério: quem foi?",
  misterio_desc: "Ouçam a história, sigam as pistas e descubram o culpado.",
  config_equipos: "Equipes",
  config_rondas: "Rodadas",
  config_segundos: "Segundos por vez",
  empezar: "Começar",
  turno_de: "Vez da",
  ronda: "Rodada",
  pasale_telefono: "Passe o celular para quem vai explicar. O resto não pode olhar a tela!",
  listo: "Pronto!",
  no_digas: "Não diga",
  correcta: "Acertaram!",
  pasar: "Pular",
  falta: "Falei uma proibida",
  tiempo: "Tempo!",
  aciertos: "Acertos",
  faltas: "Proibidas ditas",
  pasadas: "Puladas",
  puntos_turno: "Pontos da vez",
  siguiente_turno: "Próxima vez",
  ver_resultado: "Ver resultado",
  resultado: "Resultado final",
  gano: "Venceu",
  empate: "Empate!",
  jugar_otra: "Jogar de novo",
  volver_inicio: "Voltar ao início",
  equipo: "Equipe",
};

const idioma = getLocales()[0]?.languageCode === "pt" ? "pt" : "es";
const textos = idioma === "pt" ? pt : es;

export function t(clave: Clave): string {
  return textos[clave];
}

export { idioma };
