import { Pressable, StyleSheet, Text } from "react-native";
import { colores } from "./tema";

interface Props {
  texto: string;
  onPress: () => void;
  color?: string;
  grande?: boolean;
}

export function Boton({ texto, onPress, color = colores.primario, grande }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.boton,
        grande && s.grande,
        { backgroundColor: color, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[s.texto, grande && s.textoGrande]}>{texto}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  boton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  grande: { paddingVertical: 22 },
  texto: { color: colores.fondo, fontSize: 18, fontWeight: "700" },
  textoGrande: { fontSize: 22 },
});
