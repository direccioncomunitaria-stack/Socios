-- Acceso al panel admin.html (ya aplicado en el proyecto Supabase "binian-atid").
-- Para sumar a alguien: insert into public.admins (email) values ('mail@ejemplo.com');
create table public.admins (email text primary key, created_at timestamptz not null default now());
alter table public.admins enable row level security;
insert into public.admins (email) values ('direccion.comunitaria@bialik.edu.ar');

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
     and coalesce((auth.jwt() ->> 'email_verified')::boolean, true);
$$;
revoke all on function public.is_admin() from public;
revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

create policy "admins leen donaciones" on public.donations
  for select to authenticated using (public.is_admin());
create policy "admins leen configuracion" on public.campaign_settings
  for select to authenticated using (public.is_admin());
create policy "admin ve su fila" on public.admins
  for select to authenticated using (public.is_admin());
