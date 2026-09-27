// Configuración de la partida: cantidad de equipos, rondas y segundos por turno.
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "../../i18n";
import { Boton } from "../../ui/Boton";
import { colores, estilos } from "../../ui/tema";

function Selector<T extends number>(props: {
  titulo: string;
  opciones: T[];
  valor: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={s.grupo}>
      <Text style={estilos.texto}>{props.titulo}</Text>
      <View style={s.opciones}>
        {props.opciones.map((o) => (
          <Pressable
            key={o}
            accessibilityRole="button"
            accessibilityState={{ selected: o === props.valor }}
            onPress={() => props.onChange(o)}
            style={[s.opcion, o === props.valor && s.elegida]}
          >
            <Text style={[s.textoOpcion, o === props.valor && s.textoElegida]}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function ConfigProhibido() {
  const [equipos, setEquipos] = useState(2);
  const [rondas, setRondas] = useState(3);
  const [segundos, setSegundos] = useState(60);

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.titulo}>🤐 {t("prohibido_nombre")}</Text>
      <Text style={estilos.subtitulo}>{t("prohibido_desc")}</Text>
      <Selector titulo={t("config_equipos")} opciones={[2, 3, 4]} valor={equipos} onChange={setEquipos} />
      <Selector titulo={t("config_rondas")} opciones={[1, 2, 3, 5]} valor={rondas} onChange={setRondas} />
      <Selector titulo={t("config_segundos")} opciones={[45, 60, 90]} valor={segundos} onChange={setSegundos} />
      <View style={{ flex: 1 }} />
      <Boton
        grande
        texto={t("empezar")}
        onPress={() =>
          router.push({
            pathname: "/prohibido/jugar",
            params: { equipos, rondas, segundos },
          })
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  grupo: { gap: 8 },
  opciones: { flexDirection: "row", gap: 10 },
  opcion: {
    minWidth: 56,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colores.tarjeta,
    alignItems: "center",
  },
  elegida: { backgroundColor: colores.primario },
  textoOpcion: { color: colores.texto, fontSize: 18, fontWeight: "700" },
  textoElegida: { color: colores.fondo },
});
