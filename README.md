# Juegos IA (nombre provisorio)

App de juegos para familia y amigos con contenido que no se repite: primero se juega
un banco precargado y, cuando un grupo está por agotarlo, la IA genera contenido nuevo.

Visión, decisiones y plan: [`docs/PROYECTO.md`](docs/PROYECTO.md).

## Estructura

| Carpeta | Qué hay |
|---|---|
| `app/` | App móvil (Expo + Expo Router, iOS/Android/web). Juego "Prohibido decirlo" jugable con banco demo. |
| `supabase/migrations/` | Esquema de base de datos: banco, grupos, historial, costos de IA. |
| `supabase/functions/_shared/motor/` | Motor de contenido: esquemas, prompts, generación con Claude, validación, reposición. |
| `supabase/functions/siguiente-contenido/` | Edge Function que sirve contenido y repone el banco en segundo plano. |
| `scripts/` | Generación y carga del banco inicial. |

## Correr la app

```bash
cd app
npm install
npx expo start        # escanear el QR con Expo Go, o presionar w para web
```

## Motor de contenido

```bash
npm install
npm test              # validaciones y lógica de juego
npm run typecheck

# Generar banco inicial (requiere ANTHROPIC_API_KEY) y revisarlo a mano
npm run banco:generar -- prohibido peliculas facil 3
# Cargarlo en Supabase
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run banco:cargar -- banco/generado/prohibido/es-peliculas-facil.json
```

Secrets de la Edge Function: `ANTHROPIC_API_KEY` (Supabase ya provee `SUPABASE_URL`,
`SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`).
