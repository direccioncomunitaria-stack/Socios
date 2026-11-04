# Binián Atid · Página de donaciones

Página de donaciones estilo Charidy para la campaña **Binián Atid** (בניין עתיד) de la Comunidad Israelita de Santa Fe.

- **Meta:** USD 30.000, duplicada x2 por padrinos → **USD 60.000**.
- **Contador en vivo:** se actualiza solo cada 20 segundos y muestra cada donación duplicada.
- **Pago único o mensual** durante la cantidad de meses que elija el donante (2 a 60). Como en Charidy, el total comprometido suma al contador desde el primer pago.
- **Mercado Pago** (en pesos, con la cotización configurada) y **PayPal** (en dólares).
- Dedicatorias (en honor / en memoria), mensaje, donación anónima y elección del área.

## Cómo está armado

| Parte | Dónde |
|---|---|
| Página | `index.html` + `img/` → GitHub Pages |
| Base de datos | Supabase, proyecto `binian-atid` (`supabase/migrations/`) |
| Crear el pago | Edge function `create-donation` |
| Confirmación Mercado Pago | Edge function `mp-webhook` |
| Confirmación PayPal | Edge function `paypal-return` |

## Puesta en marcha (una sola vez)

1. **Credenciales de pago** → Supabase › proyecto `binian-atid` › Edge Functions › *Secrets*:
   - `MP_ACCESS_TOKEN`: Access Token de **producción** de Mercado Pago (Tus integraciones › Credenciales).
   - `PAYPAL_CLIENT_ID` y `PAYPAL_SECRET`: app *Live* en developer.paypal.com (cuenta PayPal Business).
   - `PAYPAL_ENV`: `live` (o `sandbox` para probar).
2. **Webhook de Mercado Pago** → Tus integraciones › Webhooks: URL
   `https://mwgcihrwmezqhcnhmimc.supabase.co/functions/v1/mp-webhook`, eventos *Pagos* y *Planes y suscripciones*.
3. **GitHub Pages** → Settings › Pages › Source: *GitHub Actions*. Al hacer merge a `main`, la página se publica en
   `https://direccioncomunitaria-stack.github.io/Socios/` (si cambia la URL, actualizar `site_url` en `campaign_settings`).

## Administrar la campaña (Supabase › Table editor)

- `campaign_settings`: meta (`goal_usd`), multiplicador (`match_multiplier`), cotización (`ars_per_usd`), fecha de cierre (`ends_at`).
- `donations`: todas las donaciones. Para cargar una **donación en efectivo o transferencia**, agregar una fila con
  `provider = offline`, `status = approved`, `approved_at = now()`, `name`, `amount_usd` y `months`.
  Para sacar una donación del contador, cambiar `status` a `cancelled`.

Textos, áreas e imágenes salen del *Binian-Atid-Dossier-2026*. Para cambiar el contacto del pie, editar `CONTACT` en `index.html`.
