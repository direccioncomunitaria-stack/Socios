# Binián Atid · Página de la campaña

Página de donaciones de la campaña comunitaria 2026 **Binián Atid** (בניין עתיד) de la Comunidad Israelita de Santa Fe.
Es un sitio estático: `index.html` + carpeta `img/`. Se puede publicar en GitHub Pages, Netlify, etc.

## Cómo actualizarla
Todo se edita en el bloque **CONFIGURACIÓN** al final de `index.html`:

- `CAMPAIGN.endsAt`: fecha de cierre (cuenta regresiva).
- `CAMPAIGN.paymentUrl`: link de la plataforma de pago (Mercado Pago, PayPal…). **Obligatorio para cobrar.**
- `CAMPAIGN.matchMultiplier`: 2 o 3 si hay padrinos que duplican cada aporte (1 = sin matching).
- `CAMPAIGN.contact`: datos de contacto del pie de página.
- `AREAS[].raised`: lo ya conseguido en cada área (actualiza la barra general y la de cada área).
- `DONATIONS`: donaciones online para mostrar en la pestaña Donantes.

Las imágenes y los textos salen del *Binian-Atid-Dossier-2026*.
