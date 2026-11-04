// PayPal redirige acá después de que el donante aprueba. Verificamos/capturamos con la API y volvemos a la página.
import { db, paypal, settings, withParams } from "../_shared/common.ts";

const redirect = (to: string) => new Response(null, { status: 302, headers: { Location: to } });

Deno.serve(async (req) => {
  const s = await settings();
  try {
    const id = new URL(req.url).searchParams.get("d") || "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) return redirect(withParams(s.site_url, { donacion: "error" }));
    const { data: d } = await db().from("donations").select("*").eq("id", id).maybeSingle();
    if (!d || d.provider !== "paypal" || !d.provider_ref) return redirect(withParams(s.site_url, { donacion: "error" }));
    if (d.status === "approved") return redirect(withParams(s.site_url, { donacion: "ok", id }));

    let approved = false, raw: unknown = null, received = 0;
    if (d.months === 1) {
      const cap = await paypal(`/v2/checkout/orders/${d.provider_ref}/capture`, { method: "POST", body: "{}" });
      const c = cap.purchase_units?.[0]?.payments?.captures?.[0];
      approved = cap.status === "COMPLETED" && c?.amount?.currency_code === "USD"
        && Number(c.amount.value) >= Number(d.amount_usd) - 0.01;
      raw = cap; received = approved ? 1 : 0;
    } else {
      const sub = await paypal(`/v1/billing/subscriptions/${d.provider_ref}`);
      approved = ["ACTIVE", "APPROVED"].includes(sub.status) && sub.custom_id === d.id;
      raw = sub; received = sub.billing_info?.cycle_executions?.[0]?.cycles_completed ?? 0;
    }

    if (!approved) return redirect(withParams(s.site_url, { donacion: "pendiente", id }));
    await db().from("donations").update({
      status: "approved", approved_at: new Date().toISOString(), payments_received: received, raw,
    }).eq("id", d.id).eq("status", "pending");
    return redirect(withParams(s.site_url, { donacion: "ok", id }));
  } catch (e) {
    console.error(e);
    return redirect(withParams(s.site_url, { donacion: "error" }));
  }
});
