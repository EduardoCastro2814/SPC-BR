import React, { useState } from 'react';
import { Database, ShieldAlert, Clipboard, Check } from 'lucide-react';
import { saveSupabaseConfig } from '../services/supabase';

export default function SupabaseConfigView() {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- Habilitar extensión para generar UUIDs
create extension if not exists "uuid-ossp";

-- 1. Tabla de partidas (games)
create table public.games (
  id uuid primary key default gen_random_uuid(),
  pin text not null unique,
  game_state text not null default 'LOBBY',
  current_question_index integer not null default 0,
  question_started_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create index games_pin_idx on public.games(pin);

-- 2. Tabla de jugadores (players)
create table public.players (
  id text not null, -- ID generado en cliente ('p_' + random)
  game_id uuid not null references public.games(id) on delete cascade,
  name text not null,
  score integer not null default 0,
  streak integer not null default 0,
  is_bot boolean not null default false,
  last_correct boolean,
  rank integer not null default 1,
  avatar text not null default 'engineer',
  last_seen timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  primary key (id, game_id)
);

create index players_game_id_idx on public.players(game_id);

-- 3. Tabla de respuestas (answers)
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player_id text not null,
  question_index integer not null,
  option_index integer not null,
  time_taken numeric not null,
  is_correct boolean not null,
  points integer not null,
  created_at timestamp with time zone default now() not null
);

create index answers_game_question_idx on public.answers(game_id, question_index);

-- Activar canal Realtime para las tres tablas
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.answers;

-- Desactivar RLS para pruebas rápidas
alter table public.games disable row level security;
alter table public.players disable row level security;
alter table public.answers disable row level security;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      alert('Por favor, ingresa tanto la URL de Supabase como la Clave Anónima.');
      return;
    }
    if (!url.trim().startsWith('http')) {
      alert('La URL de Supabase debe comenzar con http:// o https://');
      return;
    }
    saveSupabaseConfig(url.trim(), key.trim());
  };

  return (
    <div className="min-h-screen bg-blue-50/20 p-6 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Retícula lúdica de fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,174,239,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,174,239,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="w-full max-w-5xl bg-white border-2 border-blue-100 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Panel Izquierdo: Formulario */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-black font-mono tracking-wider text-blue-600 uppercase">
                CONFIGURAR SUPABASE
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">
              Paso Final para el Modo Multijugador
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Para jugar en múltiples dispositivos (como computadoras y celulares conectados a internet), SPC Battle Arena necesita enlazarse a una base de datos de Supabase.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono tracking-wider">
                URL del Proyecto (Project URL)
              </label>
              <input
                type="text"
                placeholder="https://tu-proyecto.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-100 border-2 border-gray-200 text-slate-800 rounded-2xl text-xs focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono tracking-wider">
                Clave Pública Anónima (Anon/Public API Key)
              </label>
              <textarea
                placeholder="eyJhbGciOi..."
                rows="4"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-100 border-2 border-gray-200 text-slate-800 rounded-2xl text-[10px] focus:outline-none focus:border-blue-500 font-mono resize-none leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider rounded-2xl shadow-lg active:scale-95 transition-all font-mono text-xs border-b-4 border-blue-800"
            >
              ¡Guardar y Conectar Servidor!
            </button>
          </form>

          <div className="flex gap-2 p-3 bg-amber-100 border-2 border-yellow-500 rounded-2xl text-slate-700 text-[10px] leading-relaxed">
            <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <span className="font-bold">Nota de Seguridad:</span> Las credenciales se guardan de forma segura localmente en tu navegador. Nadie más tiene acceso a ellas.
            </div>
          </div>
        </div>

        {/* Panel Derecho: Instrucciones y SQL */}
        <div className="flex-1 bg-blue-50/30 border-2 border-blue-50 p-5 rounded-3xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-mono font-black text-xs text-blue-500 uppercase mb-2">
              Instrucciones de Instalación
            </h3>
            <ol className="list-decimal list-inside text-xs text-slate-650 space-y-2 font-medium">
              <li>Crea un proyecto gratuito en <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-500 font-bold underline">supabase.com</a>.</li>
              <li>Ve a la sección <strong>SQL Editor</strong> en tu panel de Supabase.</li>
              <li>Haz clic en <strong>New Query</strong>, pega el script de abajo y presiona <strong>Run</strong>.</li>
              <li>Busca tus credenciales en <strong>Settings &gt; API</strong> y pégalas en el formulario.</li>
            </ol>
          </div>

          <div className="flex-1 flex flex-col min-h-200">
            <div className="flex justify-between items-center bg-gray-200 px-4 py-2 rounded-t-2xl border-t border-r border-l border-gray-300">
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">Script SQL de Tablas</span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 text-[9px] font-mono font-bold text-blue-500 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-xl transition-all border border-blue-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-green-500" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3 h-3" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={sqlCode}
              className="flex-1 w-full p-3 bg-gray-950 text-emerald-400 font-mono text-[9px] rounded-b-2xl border-r border-b border-l border-gray-350 resize-none outline-none leading-relaxed select-all"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
