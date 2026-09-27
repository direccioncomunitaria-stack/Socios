// Banco de demostración para jugar sin conexión ni cuenta. El banco real vive
// en Supabase y se sirve con la función `siguiente-contenido`.
import type { Tarjeta } from "../juegos/prohibido/partida";

export const TARJETAS_DEMO: Tarjeta[] = [
  { palabra: "Playa", prohibidas: ["arena", "mar", "sol", "verano", "olas"] },
  { palabra: "Cumpleaños", prohibidas: ["torta", "velas", "fiesta", "regalo", "invitados"] },
  { palabra: "Bicicleta", prohibidas: ["ruedas", "pedalear", "manubrio", "casco", "cadena"] },
  { palabra: "Dentista", prohibidas: ["dientes", "muela", "caries", "boca", "doctor"] },
  { palabra: "Paraguas", prohibidas: ["lluvia", "mojarse", "abrir", "sombrilla", "tormenta"] },
  { palabra: "Elefante", prohibidas: ["trompa", "grande", "gris", "orejas", "colmillos"] },
  { palabra: "Pizza", prohibidas: ["queso", "masa", "horno", "porción", "muzzarella"] },
  { palabra: "Astronauta", prohibidas: ["espacio", "luna", "cohete", "traje", "nave"] },
  { palabra: "Biblioteca", prohibidas: ["libros", "leer", "silencio", "prestar", "estantes"] },
  { palabra: "Semáforo", prohibidas: ["rojo", "verde", "amarillo", "luz", "esquina"] },
  { palabra: "Pirata", prohibidas: ["barco", "tesoro", "parche", "loro", "mar"] },
  { palabra: "Invierno", prohibidas: ["frío", "nieve", "abrigo", "estación", "bufanda"] },
  { palabra: "Guitarra", prohibidas: ["cuerdas", "tocar", "música", "instrumento", "acordes"] },
  { palabra: "Hospital", prohibidas: ["médico", "enfermera", "enfermo", "cama", "ambulancia"] },
  { palabra: "Mate", prohibidas: ["yerba", "bombilla", "termo", "agua", "tomar"] },
  { palabra: "Dinosaurio", prohibidas: ["extinto", "jurásico", "reptil", "fósil", "rex"] },
  { palabra: "Espejo", prohibidas: ["reflejo", "mirarse", "vidrio", "cara", "baño"] },
  { palabra: "Bombero", prohibidas: ["fuego", "incendio", "manguera", "camión", "apagar"] },
  { palabra: "Chocolate", prohibidas: ["cacao", "dulce", "marrón", "golosina", "tableta"] },
  { palabra: "Avión", prohibidas: ["volar", "aeropuerto", "piloto", "alas", "viaje"] },
  { palabra: "Fútbol", prohibidas: ["pelota", "gol", "arco", "equipo", "cancha"] },
  { palabra: "Reloj", prohibidas: ["hora", "tiempo", "agujas", "muñeca", "minutos"] },
  { palabra: "Abuela", prohibidas: ["mamá", "papá", "familia", "nietos", "vieja"] },
  { palabra: "Carpa", prohibidas: ["acampar", "camping", "dormir", "estacas", "bolsa"] },
  { palabra: "Pingüino", prohibidas: ["hielo", "frío", "ave", "negro", "antártida"] },
  { palabra: "Escuela", prohibidas: ["maestra", "alumnos", "aula", "recreo", "estudiar"] },
  { palabra: "Helado", prohibidas: ["frío", "cucurucho", "sabor", "verano", "crema"] },
  { palabra: "Tren", prohibidas: ["vías", "estación", "vagón", "locomotora", "pasajeros"] },
  { palabra: "Mago", prohibidas: ["magia", "truco", "varita", "sombrero", "conejo"] },
  { palabra: "Volcán", prohibidas: ["lava", "erupción", "montaña", "fuego", "cráter"] },
  { palabra: "Celular", prohibidas: ["teléfono", "llamar", "pantalla", "mensaje", "aplicación"] },
  { palabra: "Arcoíris", prohibidas: ["colores", "lluvia", "cielo", "sol", "tormenta"] },
  { palabra: "Supermercado", prohibidas: ["comprar", "carrito", "caja", "góndola", "comida"] },
  { palabra: "Tiburón", prohibidas: ["mar", "aleta", "dientes", "pez", "nadar"] },
  { palabra: "Almohada", prohibidas: ["dormir", "cama", "cabeza", "funda", "plumas"] },
  { palabra: "Castillo", prohibidas: ["rey", "princesa", "torre", "muralla", "medieval"] },
  { palabra: "Cine", prohibidas: ["película", "pantalla", "pochoclo", "entrada", "butaca"] },
  { palabra: "Abeja", prohibidas: ["miel", "picar", "panal", "insecto", "flores"] },
  { palabra: "Mochila", prohibidas: ["espalda", "llevar", "escuela", "bolso", "cierre"] },
  { palabra: "Robot", prohibidas: ["máquina", "metal", "inteligencia", "programar", "futuro"] },
];

/** Devuelve las tarjetas en orden aleatorio y vuelve a mezclar al agotarlas. */
export function crearMazo(tarjetas: Tarjeta[] = TARJETAS_DEMO): () => Tarjeta {
  let mazo: Tarjeta[] = [];
  return () => {
    if (mazo.length === 0) {
      mazo = [...tarjetas];
      for (let i = mazo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
      }
    }
    return mazo.pop()!;
  };
}
