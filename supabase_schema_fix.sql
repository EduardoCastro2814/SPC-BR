-- ========================================================
-- SCRIPT DE MIGRACIÓN Y REPARACIÓN DEL SCHEMA DE SUPABASE
-- ========================================================
-- Ejecuta este script en el SQL Editor de Supabase.
-- Realiza una conversión limpia de ids de TEXT a UUID,
-- renombra la columna 'name' a 'nickname' en players,
-- y actualiza answers.player_id a tipo UUID.
-- ========================================================

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 0. TRUNCAR TABLAS PARA EVITAR CONFLICTOS DE CASTING CON DATOS OBSOLETOS
truncate public.answers, public.players cascade;

-- 1. REPARACIÓN Y ALINEACIÓN DE LA TABLA "games"
alter table public.games add column if not exists pin text;
alter table public.games add column if not exists game_state text default 'LOBBY';
alter table public.games add column if not exists current_question_index integer default 0;
alter table public.games add column if not exists question_started_at timestamp with time zone;
alter table public.games add column if not exists created_at timestamp with time zone default now();
alter table public.games add column if not exists updated_at timestamp with time zone default now();

-- Asegurar constraint UNIQUE para el PIN de juego
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'games_pin_key' or conname = 'games_pin_unique'
  ) then
    alter table public.games add constraint games_pin_key unique (pin);
  end if;
end $$;

-- 2. REPARACIÓN Y CONVERSIÓN DE LA TABLA "players" A UUID
alter table public.players drop constraint if exists players_pkey cascade;
alter table public.players alter column id type uuid using gen_random_uuid();
alter table public.players alter column id set default gen_random_uuid();
alter table public.players add primary key (id);

-- Renombrar columna 'name' a 'nickname' si existe
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_name = 'players' and column_name = 'name'
  ) then
    alter table public.players rename column name to nickname;
  end if;
end $$;

-- Asegurar el resto de columnas de players
alter table public.players add column if not exists nickname text;
alter table public.players add column if not exists score integer default 0;
alter table public.players add column if not exists streak integer default 0;
alter table public.players add column if not exists is_bot boolean default false;
alter table public.players add column if not exists last_correct boolean;
alter table public.players add column if not exists rank integer default 1;
alter table public.players add column if not exists avatar text default 'engineer';
alter table public.players add column if not exists last_seen timestamp with time zone default now();
alter table public.players add column if not exists created_at timestamp with time zone default now();

-- 3. REPARACIÓN Y CONVERSIÓN DE LA TABLA "answers" A UUID
alter table public.answers drop constraint if exists answers_player_id_fkey cascade;
alter table public.answers alter column player_id type uuid using player_id::uuid;
alter table public.answers add constraint answers_player_id_fkey foreign key (player_id) references public.players(id) on delete cascade;

-- Asegurar columnas de answers
alter table public.answers add column if not exists question_index integer;
alter table public.answers add column if not exists option_index integer;
alter table public.answers add column if not exists time_taken numeric;
alter table public.answers add column if not exists is_correct boolean;
alter table public.answers add column if not exists points integer;
alter table public.answers add column if not exists created_at timestamp with time zone default now();

-- 4. HABILITAR PUBLICACIÓN EN TIEMPO REAL (REALTIME)
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.answers;

-- 5. RECARGAR CACHÉ DE POSTGREST
notify pgrst, 'reload schema';
