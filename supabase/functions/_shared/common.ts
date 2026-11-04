import { createClient } from "jsr:@supabase/supabase-js@2";

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

export const db = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

export const fnBase = () => `${Deno.env.get("SUPABASE_URL")}/functions/v1`;

export async function settings() {
  const { data, error } = await db().from("campaign_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data as {
    goal_usd: number; match_multiplier: number; ars_per_usd: number; ends_at: string;
    site_url: string; paypal_product_id: string | null;
  };
}

export const withParams = (base: string, params: Record<string, string>) => {
  const u = new URL(base);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
};

/* ---------------- Mercado Pago ---------------- */
export async function mp(path: string, init: RequestInit = {}) {
  const token = Deno.env.get("MP_ACCESS_TOKEN");
  if (!token) throw new Error("MP_ACCESS_TOKEN no configurado");
  const r = await fetch(`https://api.mercadopago.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Mercado Pago ${r.status}: ${JSON.stringify(body)}`);
  return body;
}

/* ---------------- PayPal ---------------- */
export const paypalBase = () =>
  Deno.env.get("PAYPAL_ENV") === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

async function paypalToken() {
  const id = Deno.env.get("PAYPAL_CLIENT_ID"), secret = Deno.env.get("PAYPAL_SECRET");
  if (!id || !secret) throw new Error("PAYPAL_CLIENT_ID / PAYPAL_SECRET no configurados");
  const r = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${id}:${secret}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const b = await r.json();
  if (!r.ok) throw new Error(`PayPal auth ${r.status}: ${JSON.stringify(b)}`);
  return b.access_token as string;
}

export async function paypal(path: string, init: RequestInit = {}) {
  const t = await paypalToken();
  const r = await fetch(`${paypalBase()}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json", Prefer: "return=representation", ...(init.headers || {}) },
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`PayPal ${r.status}: ${JSON.stringify(body)}`);
  return body;
}
