import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { t } from "../i18n";
import { colores, estilos } from "../ui/tema";

interface Juego {
  nombre: string;
  descripcion: string;
  emoji: string;
  ruta?: "/prohibido";
}

const JUEGOS: Juego[] = [
  { nombre: t("prohibido_nombre"), descripcion: t("prohibido_desc"), emoji: "🤐", ruta: "/prohibido" },
  { nombre: t("misterio_nombre"), descripcion: t("misterio_desc"), emoji: "🕵️" },
];

export default function Inicio() {
  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Text style={estilos.titulo}>{t("inicio_titulo")}</Text>
      <Text style={estilos.subtitulo}>{t("inicio_subtitulo")}</Text>
      {JUEGOS.map((j) => (
        <Pressable
          key={j.nombre}
          accessibilityRole="button"
          disabled={!j.ruta}
          onPress={() => j.ruta && router.push(j.ruta)}
          style={[s.tarjeta, !j.ruta && s.deshabilitada]}
        >
          <Text style={s.emoji}>{j.emoji}</Text>
          <View style={s.info}>
            <Text style={s.nombre}>{j.nombre}</Text>
            <Text style={estilos.subtitulo}>{j.descripcion}</Text>
            {!j.ruta && <Text style={s.pronto}>{t("proximamente")}</Text>}
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    gap: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: colores.tarjeta,
    alignItems: "center",
  },
  deshabilitada: { opacity: 0.55 },
  emoji: { fontSize: 44 },
  info: { flex: 1, gap: 4 },
  nombre: { color: colores.texto, fontSize: 20, fontWeight: "700" },
  pronto: { color: colores.primario, fontWeight: "700", marginTop: 4 },
});
