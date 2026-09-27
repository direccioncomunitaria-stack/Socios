// Partida en modo "pasar el teléfono": un solo dispositivo que va rotando
// entre quien explica en cada equipo.
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useReducer, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { crearMazo } from "../../datos/banco-demo";
import { t } from "../../i18n";
import {
  ganadores,
  nuevaPartida,
  partidaReducer,
  puntosTurno,
} from "../../juegos/prohibido/partida";
import { Boton } from "../../ui/Boton";
import { colores, estilos } from "../../ui/tema";

export default function Jugar() {
  const params = useLocalSearchParams<{ equipos: string; rondas: string; segundos: string }>();
  const cantidadEquipos = Number(params.equipos ?? 2);
  const segundosTurno = Number(params.segundos ?? 60);

  const siguienteTarjeta = useRef(crearMazo()).current;
  const [p, dispatch] = useReducer(
    partidaReducer,
    nuevaPartida(
      Array.from({ length: cantidadEquipos }, (_, i) => `${t("equipo")} ${i + 1}`),
      Number(params.rondas ?? 3),
    ),
  );
  const [restantes, setRestantes] = useState(segundosTurno);

  useEffect(() => {
    if (p.fase !== "turno") return;
    setRestantes(segundosTurno);
    const inicio = Date.now();
    const id = setInterval(() => {
      const quedan = segundosTurno - Math.floor((Date.now() - inicio) / 1000);
      setRestantes(Math.max(quedan, 0));
      if (quedan <= 0) {
        clearInterval(id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        dispatch({ tipo: "finTurno" });
      }
    }, 250);
    return () => clearInterval(id);
  }, [p.fase, p.equipoActual, p.rondaActual, segundosTurno]);

  const equipo = p.equipos[p.equipoActual];

  if (p.fase === "previa") {
    return (
      <View style={[estilos.pantalla, estilos.centro]}>
        <Text style={estilos.subtitulo}>
          {t("ronda")} {p.rondaActual}/{p.rondasTotales}
        </Text>
        <Text style={estilos.titulo}>
          {t("turno_de")} {equipo.nombre}
        </Text>
        <Text style={[estilos.texto, s.centrado]}>{t("pasale_telefono")}</Text>
        <Boton grande texto={t("listo")} onPress={() => dispatch({ tipo: "iniciarTurno", tarjeta: siguienteTarjeta() })} />
      </View>
    );
  }

  if (p.fase === "turno" && p.tarjeta) {
    return (
      <View style={estilos.pantalla}>
        <View style={s.cabecera}>
          <Text style={estilos.subtitulo}>{equipo.nombre}</Text>
          <Text style={[s.reloj, restantes <= 10 && { color: colores.peligro }]}>{restantes}s</Text>
          <Text style={estilos.subtitulo}>✓ {p.turno.correctas}</Text>
        </View>
        <View style={s.tarjeta}>
          <Text style={s.palabra}>{p.tarjeta.palabra}</Text>
          <Text style={s.noDigas}>{t("no_digas")}</Text>
          {p.tarjeta.prohibidas.map((x) => (
            <Text key={x} style={s.prohibida}>
              {x}
            </Text>
          ))}
        </View>
        <Boton
          grande
          color={colores.exito}
          texto={t("correcta")}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            dispatch({ tipo: "correcta", siguiente: siguienteTarjeta() });
          }}
        />
        <View style={s.fila}>
          <View style={{ flex: 1 }}>
            <Boton color={colores.neutro} texto={t("pasar")} onPress={() => dispatch({ tipo: "pasar", siguiente: siguienteTarjeta() })} />
          </View>
          <View style={{ flex: 1 }}>
            <Boton color={colores.peligro} texto={t("falta")} onPress={() => dispatch({ tipo: "falta", siguiente: siguienteTarjeta() })} />
          </View>
        </View>
      </View>
    );
  }

  if (p.fase === "resumen") {
    const ultimo = p.equipoActual === p.equipos.length - 1 && p.rondaActual === p.rondasTotales;
    return (
      <View style={[estilos.pantalla, estilos.centro]}>
        <Text style={estilos.titulo}>{t("tiempo")}</Text>
        <Text style={estilos.texto}>
          {t("aciertos")}: {p.turno.correctas} · {t("faltas")}: {p.turno.faltas} · {t("pasadas")}: {p.turno.pasadas}
        </Text>
        <Text style={s.puntos}>
          {t("puntos_turno")}: {puntosTurno(p.turno)}
        </Text>
        <Marcador equipos={p.equipos} />
        <Boton grande texto={ultimo ? t("ver_resultado") : t("siguiente_turno")} onPress={() => dispatch({ tipo: "siguienteTurno" })} />
      </View>
    );
  }

  const ganan = ganadores(p);
  return (
    <View style={[estilos.pantalla, estilos.centro]}>
      <Text style={estilos.subtitulo}>{t("resultado")}</Text>
      <Text style={estilos.titulo}>
        🏆 {ganan.length > 1 ? t("empate") : `${t("gano")} ${ganan[0].nombre}!`}
      </Text>
      <Marcador equipos={p.equipos} />
      <Boton grande texto={t("jugar_otra")} onPress={() => router.replace("/prohibido")} />
      <Boton color={colores.neutro} texto={t("volver_inicio")} onPress={() => router.dismissTo("/")} />
    </View>
  );
}

function Marcador({ equipos }: { equipos: { nombre: string; puntos: number }[] }) {
  return (
    <View style={s.marcador}>
      {equipos.map((e) => (
        <View key={e.nombre} style={s.filaMarcador}>
          <Text style={estilos.texto}>{e.nombre}</Text>
          <Text style={[estilos.texto, { fontWeight: "800" }]}>{e.puntos}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  centrado: { textAlign: "center" },
  cabecera: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reloj: { color: colores.primario, fontSize: 34, fontWeight: "800" },
  tarjeta: {
    flex: 1,
    backgroundColor: colores.texto,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  palabra: { fontSize: 40, fontWeight: "900", color: colores.fondo, textAlign: "center", marginBottom: 12 },
  noDigas: { fontSize: 14, fontWeight: "700", color: colores.peligro, textTransform: "uppercase" },
  prohibida: { fontSize: 22, color: colores.fondo },
  fila: { flexDirection: "row", gap: 12 },
  puntos: { color: colores.primario, fontSize: 24, fontWeight: "800" },
  marcador: { alignSelf: "stretch", backgroundColor: colores.tarjeta, borderRadius: 16, padding: 16, gap: 8 },
  filaMarcador: { flexDirection: "row", justifyContent: "space-between" },
});
