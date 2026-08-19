-- ========================================================
-- SCRIPT DE MIGRACIÓN Y REPARACIÓN DEL SCHEMA DE SUPABASE
-- ========================================================
-- Instrucciones:
-- 1. Ve al SQL Editor de tu panel de Supabase.
-- 2. Crea una consulta nueva ("New Query"), pega este script y ejecútalo ("RUN").
-- ========================================================

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. ALINEACIÓN DE COLUMNAS EN LA TABLA "games"
-- ==========================================
alter table public.games add column if not exists pin text;
alter table public.games add column if not exists game_state text default 'LOBBY';
alter table public.games add column if not exists current_question_index integer default 0;
alter table public.games add column if not exists question_started_at timestamp with time zone;
alter table public.games add column if not exists created_at timestamp with time zone default now();
alter table public.games add column if not exists updated_at timestamp with time zone default now();

-- Asegurar restricción de PIN único
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'games_pin_key' or conname = 'games_pin_unique'
  ) then
    alter table public.games add constraint games_pin_key unique (pin);
  end if;
end $$;

-- ==========================================
-- 2. ALINEACIÓN DE COLUMNAS EN LA TABLA "players"
-- ==========================================
alter table public.players add column if not exists name text;
alter table public.players add column if not exists score integer default 0;
alter table public.players add column if not exists streak integer default 0;
alter table public.players add column if not exists is_bot boolean default false;
alter table public.players add column if not exists last_correct boolean;
alter table public.players add column if not exists rank integer default 1;
alter table public.players add column if not exists avatar text default 'engineer';
alter table public.players add column if not exists last_seen timestamp with time zone default now();
alter table public.players add column if not exists created_at timestamp with time zone default now();

-- ==========================================
-- 3. ALINEACIÓN DE COLUMNAS EN LA TABLA "answers"
-- ==========================================
alter table public.answers add column if not exists question_index integer;
alter table public.answers add column if not exists option_index integer;
alter table public.answers add column if not exists time_taken numeric;
alter table public.answers add column if not exists is_correct boolean;
alter table public.answers add column if not exists points integer;
alter table public.answers add column if not exists created_at timestamp with time zone default now();

-- ==========================================
-- 4. CONFIGURACIÓN DE REALTIME
-- ==========================================
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.answers;

-- ==========================================
-- 5. POLÍTICAS DE ACCESO PÚBLICO (RLS)
-- ==========================================
alter table public.games enable row level security;
alter table public.players enable row level security;
alter table public.answers enable row level security;

-- Borrar políticas duplicadas
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

-- Crear nuevas políticas públicas
create policy "Permitir lectura pública de partidas" on public.games for select using (true);
create policy "Permitir inserción pública de partidas" on public.games for insert with check (true);
create policy "Permitir actualización pública de partidas" on public.games for update using (true);
create policy "Permitir borrado público de partidas" on public.games for delete using (true);

create policy "Permitir lectura pública de jugadores" on public.players for select using (true);
create policy "Permitir inserción pública de jugadores" on public.players for insert with check (true);
create policy "Permitir actualización pública de jugadores" on public.players for update using (true);
create policy "Permitir borrado público de jugadores" on public.players for delete using (true);

create policy "Permitir lectura pública de respuestas" on public.answers for select using (true);
create policy "Permitir inserción pública de respuestas" on public.answers for insert with check (true);
create policy "Permitir actualización pública de respuestas" on public.answers for update using (true);
create policy "Permitir borrado público de respuestas" on public.answers for delete using (true);

-- ==========================================
-- 6. RECARGAR EL CACHÉ DE POSTGREST
-- ==========================================
notify pgrst, 'reload schema';
