# Proyecto: App de juegos para familia y amigos con IA

> Documento vivo de proyecto. Última actualización: 2026-09-27 (v2: mercado, precio y canal).

## 1. Visión

App móvil y sitio web con suscripción que ofrece juegos sociales para familia y amigos
(adivinar canciones por temática, "Prohibido decirlo" tipo tabú, salas de escape, misterios
de "¿quién es el asesino?"). El contenido nunca se agota: partimos de un banco precargado
y la IA genera contenido nuevo cuando hace falta.

## 2. Decisiones tomadas

| # | Decisión | Estado |
|---|----------|--------|
| D1 | Un **generador por tipo de juego** (prompt + reglas + esquema JSON), invocado bajo demanda, no agentes corriendo 24/7 | Aprobado |
| D2 | **Banco precargado primero, IA después**: se juega contenido precargado; cuando el grupo se acerca a agotarlo, la IA genera nuevo | Aprobado |
| D3 | "Adiviná la canción" en MVP **sin audio con derechos** (pistas con emojis/descripciones); audio real solo tras consulta legal | Aprobado |
| D4 | No usar marcas registradas como nombre de juego (ej. "Tabú" → "Prohibido decirlo") | Aprobado |
| D5 | Suscripción mensual como modelo base; pago único solo como anual o con límite de partidas | Aprobado |
| D6 | **Mercado**: global a largo plazo, **lanzamiento en Latinoamérica** | Aprobado |
| D7 | **Precio de referencia: USD 5/mes**, con precios regionales por país en las tiendas | Aprobado |
| D8 | **App en App Store y Google Play desde el día 1** (la web acompaña como landing) | Aprobado |
| D9 | Idiomas: **español** al lanzamiento, **portugués (Brasil)** como segundo idioma; i18n desde el inicio | Propuesto |

## 3. Estrategia de contenido: "banco primero, IA después"

### 3.1 Flujo

```
Grupo pide partida (juego + temática + dificultad + edades)
        │
        ▼
¿Hay contenido del banco NO jugado por este grupo?
        │ sí                                  │ no
        ▼                                     ▼
Servir del banco                     Generar con IA en el momento
        │                                     │
        ▼                                     ▼
Marcar como jugado            Validar → servir → guardar en el banco
        │
        ▼
¿Quedan menos del 20% sin jugar para esa combinación?
        │ sí
        ▼
Disparar generación en segundo plano (el grupo no espera)
```

### 3.2 Reglas clave

1. **Seguimiento por grupo/cuenta**: cada contenido servido se registra en `historial_jugado`
   (cuenta, juego, contenido_id, fecha). "Agotado" se calcula por cuenta, no globalmente.
2. **Umbral anticipado**: la generación arranca cuando queda ~20% sin jugar (o menos de N
   unidades), no al 0%, para que nunca haya espera.
3. **Lo generado alimenta el banco**: todo contenido nuevo que pasa validación se agrega al
   banco global y queda disponible para otras cuentas. El banco crece con el uso y el costo
   de IA por partida baja con el tiempo.
4. **Anti-repetición semántica**: además del ID, se guarda una "huella" (palabra clave, culpable
   + escenario, canción) para que la IA no genere variantes casi idénticas.
5. **Validación antes de publicar**: formato JSON válido, apto para la edad elegida, reglas
   propias del juego (ej. misterio con un único culpable deducible, palabra prohibida no
   incluida en las pistas).
6. **Respaldo**: si la IA falla o hay demora, se sirve contenido del banco aunque sea
   "menos fresco" (el más antiguo jugado), nunca una pantalla de error.

### 3.3 Carga inicial del banco (objetivo MVP)

| Juego | Unidad de contenido | Cantidad inicial |
|-------|---------------------|------------------|
| Prohibido decirlo | Tarjeta (palabra + 5 prohibidas) | 1.500 (≈10 temáticas × 3 dificultades × 50) |
| Misterio: ¿quién fue? | Caso completo (historia, personajes, pistas, solución) | 60 (20 por nivel de dificultad) |
| Adiviná la canción (sin audio) | Pregunta (pistas + respuesta) | 800 (≈8 temáticas × 100) |
| Sala de escape | Sala (acertijos encadenados) | 20 |

El banco inicial se genera con los mismos generadores de IA, en lote, y se revisa por muestreo
humano antes de publicar.

### 3.4 Modelo de datos (borrador)

- `juegos` (id, nombre, activo)
- `contenidos` (id, juego_id, tematica, dificultad, edad_min, payload JSON, huella, origen[precargado|ia], estado[pendiente|aprobado|rechazado], creado_en)
- `cuentas` / `grupos` (id, plan, …)
- `historial_jugado` (grupo_id, contenido_id, jugado_en)
- `generaciones` (id, juego_id, parametros, costo_tokens, resultado, duracion_ms) — para controlar costos

## 3.5 Economía por suscriptor (USD 5/mes)

| Concepto | Monto aprox. |
|----------|--------------|
| Precio | 5,00 |
| Comisión tienda (15% con Apple Small Business Program / Google Play suscripciones) | −0,75 |
| Impuestos locales (varían por país; las tiendas los retienen) | variable |
| **Ingreso neto estimado** | **≈ 3,50 – 4,25** |
| **Tope objetivo de costo IA por suscriptor/mes** | **≤ 0,50** |

Implicancias:
- El "banco primero" no es opcional: es lo que mantiene el costo de IA bajo el tope.
- Límite razonable de generaciones nuevas por cuenta/mes (invisible para el uso normal).
- Usar el modelo de IA más económico que cumpla la calidad para cada juego (ej. tarjetas
  simples con modelo chico; misterios con modelo más capaz) y medir costo real en `generaciones`.
- Precios regionales: las tiendas permiten fijar precio por país (ej. Argentina/Brasil más
  bajo, México/Chile cerca de USD 5). Se define en Fase 0.
- Prueba gratis de 7 días + plan anual con descuento (ej. USD 40/año) para mejorar retención.

## 4. Arquitectura propuesta

| Capa | Tecnología |
|------|------------|
| App móvil | React Native + Expo |
| Web | Next.js |
| Backend / DB / Auth / Realtime | Supabase |
| IA | API de Claude, un generador por juego, salidas en JSON |
| Pagos | RevenueCat + Stripe y/o Mercado Pago |

## 5. Plan por fases

- **Fase 0 – Descubrimiento (2 sem.)**: precios, mercados, marca, consulta legal, diseño UX.
- **Fase 1 – MVP app en tiendas (8–10 sem.)**: app Expo (iOS + Android), login,
  suscripción con RevenueCat, banco precargado + generación, juegos "Prohibido decirlo" y
  "Misterio", modo "pasar el teléfono", landing web. Incluye 1–2 semanas para revisión de
  Apple/Google.
- **Fase 2 – Multijugador y web jugable (4–6 sem.)**: salas con código/QR, jugar desde el navegador.
- **Fase 3 – Expansión**: canciones, salas de escape, nuevas temáticas.

## 6. Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Costo de IA > ingreso por usuario | Banco primero, lo generado se reutiliza, límites por plan |
| Contenido inapropiado | Validación automática + modo familia + muestreo humano |
| Derechos de música / marcas | Sin audio en MVP, nombres propios, consulta legal |
| Espera al generar | Generación anticipada al 20% + respaldo del banco |
| Rechazo en revisión de tiendas | Checklist desde el diseño: borrar cuenta desde la app, restaurar compras, política de privacidad, términos de suscripción visibles, clasificación de edad. Publicar como app "familiar" (4+/9+) pero **no** en la categoría "Niños" (sus restricciones de analítica y pagos son muy estrictas) |

## 7. Decisiones pendientes

1. ¿Pago único/vitalicio es imprescindible o alcanza con mensual + anual?
2. Equipo: ¿quién desarrolla/diseña además de este repo? ¿Hay cuentas de Apple Developer y Google Play Console?
3. Nombre de la marca.
4. Tabla de precios regionales por país (Fase 0).
