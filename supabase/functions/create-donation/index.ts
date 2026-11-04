// Crea una donación pendiente y devuelve la URL de pago (Mercado Pago o PayPal).
// Pago único o mensual por N meses (como en Charidy: el compromiso total cuenta en el termómetro).
import { cors, db, fnBase, json, mp, paypal, settings, withParams } from "../_shared/common.ts";

const AREAS = ["templo", "aulas", "tecnologia", "museo", "techo"];
const BRAND = "Binián Atid · Comunidad Israelita de Santa Fe";
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    const b = await req.json();
    const name = clean(b.name, 120), email = clean(b.email, 160), phone = clean(b.phone, 40);
    const message = clean(b.message, 500), dedication = clean(b.dedication, 200);
    const area = AREAS.includes(b.area) ? b.area : null;
    const provider = b.provider === "paypal" ? "paypal" : b.provider === "mercadopago" ? "mercadopago" : null;
    const amount = Math.round(Number(b.amount_usd) * 100) / 100;
    const months = Math.trunc(Number(b.months) || 1);

    if (!provider) return json({ error: "Elegí un medio de pago." }, 400);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Completá nombre y un email válido." }, 400);
    if (!(amount >= 1 && amount <= 100000)) return json({ error: "Monto inválido." }, 400);
    if (!(months >= 1 && months <= 60)) return json({ error: "La cantidad de meses debe estar entre 1 y 60." }, 400);

    const s = await settings();
    if (new Date(s.ends_at).getTime() < Date.now()) return json({ error: "La campaña ya finalizó." }, 400);

    const amountArs = Math.round(amount * Number(s.ars_per_usd));
    const { data: d, error } = await db().from("donations").insert({
      provider, name, email, phone: phone || null, anonymous: !!b.anonymous, message: message || null,
      dedication: dedication || null, area, amount_usd: amount, months,
      amount_ars: provider === "mercadopago" ? amountArs : null,
    }).select("id").single();
    if (error) throw error;

    const ok = withParams(s.site_url, { donacion: "ok", id: d.id });
    const fail = withParams(s.site_url, { donacion: "error" });
    const pend = withParams(s.site_url, { donacion: "pendiente", id: d.id });
    const title = months > 1 ? `Donación mensual Binián Atid (${months} meses)` : "Donación Binián Atid";
    let url = "", ref = "";

    if (provider === "mercadopago") {
      if (months === 1) {
        const pref = await mp("/checkout/preferences", {
          method: "POST",
          body: JSON.stringify({
            items: [{ id: "binian-atid", title, quantity: 1, unit_price: amountArs, currency_id: "ARS" }],
            payer: { name, email },
            external_reference: d.id,
            notification_url: `${fnBase()}/mp-webhook`,
            back_urls: { success: ok, failure: fail, pending: pend },
            auto_return: "approved",
            statement_descriptor: "BINIAN ATID",
          }),
        });
        url = pref.init_point; ref = pref.id;
      } else {
        // Suscripción mensual con fecha de fin: N cobros mensuales.
        const end = new Date(); end.setMonth(end.getMonth() + months - 1); end.setDate(end.getDate() + 15);
        const pre = await mp("/preapproval", {
          method: "POST",
          body: JSON.stringify({
            reason: title,
            external_reference: d.id,
            payer_email: email,
            back_url: ok,
            notification_url: `${fnBase()}/mp-webhook`,
            status: "pending",
            auto_recurring: {
              frequency: 1, frequency_type: "months", end_date: end.toISOString(),
              transaction_amount: amountArs, currency_id: "ARS",
            },
          }),
        });
        url = pre.init_point; ref = pre.id;
      }
    } else {
      const ret = `${fnBase()}/paypal-return?d=${d.id}`;
      const cancel = withParams(s.site_url, { donacion: "cancelada" });
      if (months === 1) {
        const order = await paypal("/v2/checkout/orders", {
          method: "POST",
          body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [{ reference_id: d.id, custom_id: d.id, description: title,
              amount: { currency_code: "USD", value: amount.toFixed(2) } }],
            payment_source: { paypal: { experience_context: {
              brand_name: BRAND, user_action: "PAY_NOW", shipping_preference: "NO_SHIPPING",
              return_url: ret, cancel_url: cancel, locale: "es-AR" } } },
          }),
        });
        url = order.links.find((l: { rel: string }) => l.rel === "payer-action" || l.rel === "approve")?.href;
        ref = order.id;
      } else {
        let product = s.paypal_product_id;
        if (!product) {
          const p = await paypal("/v1/catalogs/products", {
            method: "POST",
            body: JSON.stringify({ name: "Donación Binián Atid", type: "SERVICE", category: "CHARITY" }),
          });
          product = p.id;
          await db().from("campaign_settings").update({ paypal_product_id: product }).eq("id", 1);
        }
        const plan = await paypal("/v1/billing/plans", {
          method: "POST",
          body: JSON.stringify({
            product_id: product, name: `${title} · USD ${amount}/mes`, status: "ACTIVE",
            billing_cycles: [{ frequency: { interval_unit: "MONTH", interval_count: 1 }, tenure_type: "REGULAR",
              sequence: 1, total_cycles: months, pricing_scheme: { fixed_price: { value: amount.toFixed(2), currency_code: "USD" } } }],
            payment_preferences: { auto_bill_outstanding: true, payment_failure_threshold: 2 },
          }),
        });
        const sub = await paypal("/v1/billing/subscriptions", {
          method: "POST",
          body: JSON.stringify({
            plan_id: plan.id, custom_id: d.id,
            subscriber: { name: { given_name: name.slice(0, 140) }, email_address: email },
            application_context: { brand_name: BRAND, user_action: "SUBSCRIBE_NOW", shipping_preference: "NO_SHIPPING",
              return_url: ret, cancel_url: cancel, locale: "es-AR" },
          }),
        });
        url = sub.links.find((l: { rel: string }) => l.rel === "approve")?.href;
        ref = sub.id;
      }
    }

    if (!url) throw new Error("El proveedor no devolvió URL de pago");
    await db().from("donations").update({ provider_ref: ref }).eq("id", d.id);
    return json({ id: d.id, url });
  } catch (e) {
    console.error(e);
    return json({ error: "No pudimos iniciar el pago. Probá de nuevo o con otro medio." }, 500);
  }
});
