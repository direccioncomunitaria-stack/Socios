import { StyleSheet } from "react-native";

export const colores = {
  fondo: "#1B1537",
  tarjeta: "#2A2250",
  texto: "#FFFFFF",
  textoSuave: "#B9B3D9",
  primario: "#FFC83D",
  exito: "#3DDC97",
  peligro: "#FF5A6E",
  neutro: "#6C63A8",
};

export const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 20, gap: 16 },
  titulo: { color: colores.texto, fontSize: 30, fontWeight: "800" },
  subtitulo: { color: colores.textoSuave, fontSize: 16 },
  texto: { color: colores.texto, fontSize: 18 },
  centro: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
});
