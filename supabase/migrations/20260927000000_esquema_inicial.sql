-- Esquema inicial: banco de contenido, grupos, historial y reposición con IA.
--
-- El banco es el activo principal del negocio: los clientes NO leen la tabla
-- `contenidos` directamente. Reciben de a una unidad por vez a través de
-- `servir_contenido`, que además registra lo jugado.

create type juego_id as enum ('prohibido', 'misterio');
create type dificultad as enum ('facil', 'media', 'dificil');
create type idioma as enum ('es', 'pt');
create type origen_contenido as enum ('precargado', 'ia');
create type estado_contenido as enum ('pendiente', 'aprobado', 'rechazado');

create table contenidos (
  id          uuid primary key default gen_random_uuid(),
  juego       juego_id not null,
  tematica    text not null,
  dificultad  dificultad not null,
  idioma      idioma not null default 'es',
  edad_min    smallint not null default 8,
  payload     jsonb not null,
  huella      text not null,
  origen      origen_contenido not null,
  -- Los misterios quedan 'pendiente' hasta tener su audio e imágenes.
  estado      estado_contenido not null default 'pendiente',
  -- URLs de audio/imágenes (misterios), completadas por el proceso multimedia.
  multimedia  jsonb,
  creado_en   timestamptz not null default now(),
  unique (juego, idioma, huella)
);

create index contenidos_combinacion_idx
  on contenidos (juego, tematica, dificultad, idioma)
  where estado = 'aprobado';

-- Un grupo es quien juega (una familia, un grupo de amigos). Pertenece a una
-- cuenta; una cuenta puede tener varios grupos.
create table grupos (
  id         uuid primary key default gen_random_uuid(),
  cuenta_id  uuid not null references auth.users (id) on delete cascade,
  nombre     text not null,
  creado_en  timestamptz not null default now()
);

create table historial_jugado (
  grupo_id     uuid not null references grupos (id) on delete cascade,
  contenido_id uuid not null references contenidos (id) on delete cascade,
  jugado_en    timestamptz not null default now(),
  primary key (grupo_id, contenido_id)
);

-- Registro de cada llamada a la IA, para controlar el costo por suscriptor.
create table generaciones (
  id             uuid primary key default gen_random_uuid(),
  juego          juego_id not null,
  tematica       text not null,
  dificultad     dificultad not null,
  idioma         idioma not null,
  modelo         text,
  tokens_entrada integer,
  tokens_salida  integer,
  aceptados      integer not null default 0,
  rechazados     integer not null default 0,
  error          text,
  iniciada_en    timestamptz not null default now(),
  terminada_en   timestamptz
);

-- Evita que dos grupos disparen a la vez la misma reposición: solo puede haber
-- una generación en curso por combinación.
create unique index generaciones_en_curso_idx
  on generaciones (juego, tematica, dificultad, idioma)
  where terminada_en is null;

-- RLS: cada cuenta ve solo sus grupos. Contenidos, historial y generaciones
-- no tienen políticas para clientes: solo se accede vía funciones o service role.
alter table contenidos enable row level security;
alter table grupos enable row level security;
alter table historial_jugado enable row level security;
alter table generaciones enable row level security;

create policy "grupos propios" on grupos
  for all to authenticated
  using (cuenta_id = (select auth.uid()))
  with check (cuenta_id = (select auth.uid()));

-- Devuelve una unidad no jugada por el grupo y la marca como jugada. Si el
-- grupo ya jugó todo, devuelve la que jugó hace más tiempo (repetido = true)
-- para no dejarlo nunca sin contenido. `sin_jugar` y `total` le permiten al
-- llamador decidir si hay que reponer el banco.
create or replace function servir_contenido(
  p_grupo      uuid,
  p_juego      juego_id,
  p_tematica   text,
  p_dificultad dificultad,
  p_idioma     idioma default 'es'
)
returns table (
  contenido_id uuid,
  payload      jsonb,
  multimedia   jsonb,
  repetido     boolean,
  sin_jugar    integer,
  total        integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id       uuid;
  v_repetido boolean := false;
  v_total    integer;
  v_jugados  integer;
begin
  if not exists (
    select 1 from grupos g where g.id = p_grupo and g.cuenta_id = auth.uid()
  ) then
    raise exception 'grupo inexistente o ajeno' using errcode = '42501';
  end if;

  select c.id into v_id
  from contenidos c
  where c.juego = p_juego and c.tematica = p_tematica
    and c.dificultad = p_dificultad and c.idioma = p_idioma
    and c.estado = 'aprobado'
    and not exists (
      select 1 from historial_jugado h
      where h.grupo_id = p_grupo and h.contenido_id = c.id
    )
  order by random()
  limit 1;

  if v_id is null then
    v_repetido := true;
    select h.contenido_id into v_id
    from historial_jugado h
    join contenidos c on c.id = h.contenido_id
    where h.grupo_id = p_grupo and c.juego = p_juego
      and c.tematica = p_tematica and c.dificultad = p_dificultad
      and c.idioma = p_idioma and c.estado = 'aprobado'
    order by h.jugado_en asc
    limit 1;
  end if;

  if v_id is not null then
    insert into historial_jugado (grupo_id, contenido_id)
    values (p_grupo, v_id)
    on conflict on constraint historial_jugado_pkey do update set jugado_en = now();
  end if;

  select count(*) into v_total
  from contenidos c
  where c.juego = p_juego and c.tematica = p_tematica
    and c.dificultad = p_dificultad and c.idioma = p_idioma
    and c.estado = 'aprobado';

  select count(*) into v_jugados
  from historial_jugado h
  join contenidos c on c.id = h.contenido_id
  where h.grupo_id = p_grupo and c.juego = p_juego
    and c.tematica = p_tematica and c.dificultad = p_dificultad
    and c.idioma = p_idioma and c.estado = 'aprobado';

  return query
  select c.id, c.payload, c.multimedia, v_repetido,
         (v_total - v_jugados)::integer, v_total
  from contenidos c
  where c.id = v_id;

  -- Banco vacío para esta combinación: devolvemos solo los contadores.
  if v_id is null then
    return query select null::uuid, null::jsonb, null::jsonb, true, 0, 0;
  end if;
end;
$$;

revoke all on function servir_contenido from public, anon;
grant execute on function servir_contenido to authenticated;
