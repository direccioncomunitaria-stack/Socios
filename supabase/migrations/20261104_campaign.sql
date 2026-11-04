-- Esquema de la campaña Binián Atid (ya aplicado en el proyecto Supabase "binian-atid").
create table public.campaign_settings (
  id int primary key default 1 check (id = 1),
  goal_usd numeric not null default 30000,          -- meta sin duplicar
  match_multiplier numeric not null default 2,      -- x2
  ars_per_usd numeric not null default 1460,        -- cotización para cobrar en pesos (Mercado Pago)
  starts_at timestamptz,
  ends_at timestamptz not null default '2026-12-31T23:59:00-03:00',
  site_url text not null default 'https://direccioncomunitaria-stack.github.io/Socios/',
  paypal_product_id text,
  updated_at timestamptz not null default now()
);
insert into public.campaign_settings (id) values (1);

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  status text not null default 'pending' check (status in ('pending','approved','cancelled','refunded')),
  provider text not null check (provider in ('mercadopago','paypal','offline')),
  provider_ref text,
  name text not null,
  email text,
  phone text,
  anonymous boolean not null default false,
  message text,
  dedication text,
  area text,
  amount_usd numeric not null check (amount_usd > 0),   -- por pago (por mes si months > 1)
  months int not null default 1 check (months between 1 and 60),
  total_usd numeric generated always as (amount_usd * months) stored,
  amount_ars numeric,
  payments_received int not null default 0,
  raw jsonb
);
create index donations_status_idx on public.donations (status, approved_at desc);
create index donations_provider_ref_idx on public.donations (provider, provider_ref);

create table public.processed_events (id text primary key, created_at timestamptz not null default now());

alter table public.campaign_settings enable row level security;
alter table public.donations enable row level security;
alter table public.processed_events enable row level security;
-- Sin políticas a propósito: el público solo lee a través de get_campaign/get_donors (sin emails ni teléfonos).

create or replace function public.get_campaign() returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'goal_usd', s.goal_usd, 'match_multiplier', s.match_multiplier, 'ars_per_usd', s.ars_per_usd, 'ends_at', s.ends_at,
    'given_usd', coalesce(sum(d.total_usd), 0),
    'raised_usd', coalesce(sum(d.total_usd), 0) * s.match_multiplier,
    'donors', count(d.id),
    'by_area', coalesce((select json_object_agg(area, t) from (
        select coalesce(area,'general') as area, sum(total_usd) * s.match_multiplier as t
        from donations where status = 'approved' group by 1) x), '{}'::json))
  from campaign_settings s left join donations d on d.status = 'approved' group by s.id;
$$;

create or replace function public.get_donors(p_limit int default 60, p_offset int default 0)
returns table (id uuid, display_name text, amount_usd numeric, months int, total_usd numeric,
  matched_usd numeric, message text, dedication text, area text, approved_at timestamptz)
language sql stable security definer set search_path = public as $$
  select d.id, case when d.anonymous then 'Anónimo' else d.name end, d.amount_usd, d.months, d.total_usd,
         d.total_usd * (select match_multiplier from campaign_settings where id = 1),
         d.message, d.dedication, d.area, coalesce(d.approved_at, d.created_at)
  from donations d where d.status = 'approved'
  order by coalesce(d.approved_at, d.created_at) desc
  limit least(greatest(p_limit, 1), 500) offset greatest(p_offset, 0);
$$;

revoke all on function public.get_campaign() from public;
revoke all on function public.get_donors(int,int) from public;
grant execute on function public.get_campaign() to anon, authenticated;
grant execute on function public.get_donors(int,int) to anon, authenticated;
