import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colores } from "../ui/tema";

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colores.fondo },
          headerTintColor: colores.texto,
          headerTitle: "",
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colores.fondo },
        }}
      />
    </>
  );
}
