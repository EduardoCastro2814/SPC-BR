-- ========================================================
-- SCRIPT DE BASE DE DATOS PARA SPC BATTLE ARENA (ESPAÑOL)
-- ========================================================
-- Instrucciones:
-- 1. Ve a tu panel de control de Supabase (https://supabase.com).
-- 2. Entra a tu proyecto y haz clic en "SQL Editor" en el menú izquierdo.
-- 3. Crea una nueva consulta ("New Query"), pega este script completo y haz clic en "RUN".
-- ========================================================

-- Habilitar la extensión para generar UUIDs automáticamente
create extension if not exists "uuid-ossp";

-- 1. CREACIÓN DE LA TABLA DE PARTIDAS (games)
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  pin text not null unique,
  game_state text not null default 'LOBBY',
  current_question_index integer not null default 0,
  question_started_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Índice para búsquedas rápidas por PIN de 6 dígitos
create index if not exists games_pin_idx on public.games(pin);

-- 2. CREACIÓN DE LA TABLA DE JUGADORES (players)
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(), -- ID UUID auto-generado por el servidor
  game_id uuid not null references public.games(id) on delete cascade,
  nickname text not null,
  score integer not null default 0,
  streak integer not null default 0,
  is_bot boolean not null default false,
  last_correct boolean,
  rank integer not null default 1,
  avatar text not null default 'engineer',
  last_seen timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null
);

-- Índice para búsquedas rápidas por ID de partida
create index if not exists players_game_id_idx on public.players(game_id);

-- 3. CREACIÓN DE LA TABLA DE RESPUESTAS (answers)
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade, -- Mapeado a la llave UUID del jugador
  question_index integer not null,
  option_index integer not null,
  time_taken numeric not null,
  is_correct boolean not null,
  points integer not null,
  created_at timestamp with time zone default now() not null
);

-- Índice para búsquedas rápidas por partida y pregunta
create index if not exists answers_game_question_idx on public.answers(game_id, question_index);

-- HABILITAR REALTIME (TIEMPO REAL) PARA LAS TABLAS
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.answers;

-- ========================================================
-- CONFIGURACIÓN DE SEGURIDAD (RLS) Y POLÍTICAS PÚBLICAS
-- ========================================================
alter table public.games enable row level security;
alter table public.players enable row level security;
alter table public.answers enable row level security;

-- Borrar políticas previas para evitar duplicados en re-ejecución
drop policy if exists "Permitir lectura pública de partidas" on public.games;
drop policy if exists "Permitir inserción pública de partidas" on public.games;
drop policy if exists "Permitir actualización pública de partidas" on public.games;
drop policy if exists "Permitir borrado público de partidas" on public.games;

drop policy if exists "Permitir lectura pública de jugadores" on public.players;
drop policy if exists "Permitir inserción pública de jugadores" on public.players;
drop policy if exists "Permitir actualización pública de jugadores" on public.players;
drop policy if exists "Permitir borrado público de jugadores" on public.players;

drop policy if exists "Permitir lectura pública de respuestas" on public.answers;
drop policy if exists "Permitir inserción pública de respuestas" on public.answers;
drop policy if exists "Permitir actualización pública de respuestas" on public.answers;
drop policy if exists "Permitir borrado público de respuestas" on public.answers;

-- Políticas para la tabla "games"
create policy "Permitir lectura pública de partidas" on public.games for select using (true);
create policy "Permitir inserción pública de partidas" on public.games for insert with check (true);
create policy "Permitir actualización pública de partidas" on public.games for update using (true);
create policy "Permitir borrado público de partidas" on public.games for delete using (true);

-- Políticas para la tabla "players"
create policy "Permitir lectura pública de jugadores" on public.players for select using (true);
create policy "Permitir inserción pública de jugadores" on public.players for insert with check (true);
create policy "Permitir actualización pública de jugadores" on public.players for update using (true);
create policy "Permitir borrado público de jugadores" on public.players for delete using (true);

-- Políticas para la tabla "answers"
create policy "Permitir lectura pública de respuestas" on public.answers for select using (true);
create policy "Permitir inserción pública de respuestas" on public.answers for insert with check (true);
create policy "Permitir actualización pública de respuestas" on public.answers for update using (true);
create policy "Permitir borrado público de respuestas" on public.answers for delete using (true);

-- Notificar recarga de schema cache
notify pgrst, 'reload schema';
