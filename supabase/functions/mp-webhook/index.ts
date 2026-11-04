// Notificaciones de Mercado Pago. No confiamos en el cuerpo: re-consultamos cada recurso a la API con nuestro token.
import { db, mp } from "../_shared/common.ts";

const ok = () => new Response("ok", { status: 200 });

async function approve(id: string, patch: Record<string, unknown>) {
  await db().from("donations")
    .update({ status: "approved", approved_at: new Date().toISOString(), ...patch })
    .eq("id", id).eq("status", "pending");
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const type = body.type || body.topic || url.searchParams.get("type") || url.searchParams.get("topic");
    const id = String(body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id") || "");
    if (!type || !id) return ok();

    if (type === "payment") {
      const p = await mp(`/v1/payments/${encodeURIComponent(id)}`);
      const ref = p.external_reference;
      if (!ref) return ok();
      const { data: d } = await db().from("donations").select("*").eq("id", ref).maybeSingle();
      if (!d || d.provider !== "mercadopago") return ok();
      if (d.months === 1 && p.status === "approved" && p.currency_id === "ARS"
          && Number(p.transaction_amount) >= Number(d.amount_ars) * 0.99) {
        await approve(d.id, { provider_ref: String(p.id), payments_received: 1, raw: p });
      }
      if (d.months === 1 && ["refunded", "charged_back"].includes(p.status)) {
        await db().from("donations").update({ status: "refunded" }).eq("id", d.id);
      }
    }

    if (type === "subscription_preapproval" || type === "preapproval") {
      const s = await mp(`/preapproval/${encodeURIComponent(id)}`);
      const ref = s.external_reference;
      if (!ref) return ok();
      const { data: d } = await db().from("donations").select("*").eq("id", ref).maybeSingle();
      if (!d || d.provider !== "mercadopago") return ok();
      if (s.status === "authorized") await approve(d.id, { provider_ref: s.id, raw: s });
      if (s.status === "cancelled" && d.payments_received === 0) {
        await db().from("donations").update({ status: "cancelled" }).eq("id", d.id);
      }
    }

    if (type === "subscription_authorized_payment") {
      const a = await mp(`/authorized_payments/${encodeURIComponent(id)}`);
      if (a.preapproval_id && (a.payment?.status === "approved" || a.status === "processed")) {
        const { data: d } = await db().from("donations").select("id,payments_received,months")
          .eq("provider", "mercadopago").eq("provider_ref", a.preapproval_id).maybeSingle();
        if (d) {
          // Idempotencia: cada cobro autorizado se cuenta una sola vez.
          const { error } = await db().from("processed_events").insert({ id: `mp-ap-${a.id}` });
          if (!error) {
            await db().from("donations").update({ payments_received: Math.min(d.months, d.payments_received + 1) }).eq("id", d.id);
          }
        }
      }
    }
    return ok();
  } catch (e) {
    console.error(e);
    return new Response("error", { status: 500 }); // MP reintenta
  }
});
