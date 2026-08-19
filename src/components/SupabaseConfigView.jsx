import React, { useState, useEffect } from 'react';
import { Database, Clipboard, Check, Terminal, Play, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { saveSupabaseConfig, getSupabaseConfig } from '../services/supabase';

export default function SupabaseConfigView() {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url || '');
  const [key, setKey] = useState(currentConfig.key || '');
  const [copied, setCopied] = useState(false);

  // Estados del diagnóstico
  const [testResult, setTestResult] = useState(null); // null, 'testing', 'success', 'error'
  const [errorDetails, setErrorDetails] = useState('');
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);

  // Ejecutar prueba inicial si ya hay configuración guardada
  useEffect(() => {
    if (currentConfig.url && currentConfig.key) {
      runConnectionTest(currentConfig.url, currentConfig.key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sqlCode = `-- ==========================================
-- SCRIPT DE GENERACIÓN SPC BATTLE ARENA
-- Copia y pega esto en tu SQL Editor de Supabase
-- ==========================================

-- Habilitar extensión para generar UUIDs
create extension if not exists "uuid-ossp";

-- 1. Tabla de partidas (games)
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  pin text not null unique,
  game_state text not null default 'LOBBY',
  current_question_index integer not null default 0,
  question_started_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create index if not exists games_pin_idx on public.games(pin);

-- 2. Tabla de jugadores (players)
create table if not exists public.players (
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

create index if not exists players_game_id_idx on public.players(game_id);

-- 3. Tabla de respuestas (answers)
create table if not exists public.answers (
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

create index if not exists answers_game_question_idx on public.answers(game_id, question_index);

-- Activar canal Realtime para las tres tablas en Supabase
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.answers;

-- ==========================================
-- POLÍTICAS DE ACCESO PÚBLICO (DESARROLLO)
-- Si RLS bloquea el acceso, estas políticas lo resuelven
-- ==========================================

-- Habilitar RLS en las tablas
alter table public.games enable row level security;
alter table public.players enable row level security;
alter table public.answers enable row level security;

-- Borrar políticas previas si existen para evitar duplicados
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

-- Crear políticas públicas completas
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
create policy "Permitir borrado público de respuestas" on public.answers for delete using (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runConnectionTest = async (testUrl, testKey) => {
    if (!testUrl.trim() || !testKey.trim()) {
      setTestResult('error');
      setErrorDetails('La URL o la Anon Key están vacías.');
      return;
    }

    setTestResult('testing');
    setErrorDetails('');
    const logs = [];
    const addLog = (msg) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setDiagnosticLogs([...logs]);
    };

    addLog('Diagnóstico iniciado...');
    addLog(`Comprobando URL: ${testUrl}`);

    // 1. Validaciones locales de formato
    if (!testUrl.trim().startsWith('http')) {
      addLog('❌ ERROR: La URL debe comenzar con http:// o https://');
      setTestResult('error');
      setErrorDetails('La URL no es válida. Debe iniciar con http/https.');
      return;
    }

    if (testUrl.includes('postgresql://') || testUrl.includes(':5432') || testUrl.includes('@db.')) {
      addLog('❌ ERROR: Parece que copiaste la URI de conexión de base de datos Postgres (puerto 5432) en lugar de la URL del API REST de Supabase.');
      setTestResult('error');
      setErrorDetails('Has ingresado la conexión del motor de base de datos en lugar de la URL del API de Supabase. Debe ser de tipo https://xxxx.supabase.co');
      return;
    }

    if (!testKey.trim().startsWith('eyJ')) {
      addLog('⚠️ ADVERTENCIA: La Anon API Key no empieza por el token JWT típico (eyJ...). Verifica si has copiado la clave correcta.');
    }

    // 2. Comprobar alcance del servidor (Fetch Ping)
    try {
      addLog('Enviando solicitud de ping HTTP al servidor Supabase...');
      // Intentar conectarse al endpoint rest de Supabase para verificar si responde
      const pingUrl = `${testUrl.trim()}/rest/v1/`;
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: {
          'apikey': testKey.trim(),
          'Authorization': `Bearer ${testKey.trim()}`
        }
      });
      
      addLog(`Servidor HTTP respondió con código de estado: ${response.status}`);
    } catch (fetchErr) {
      addLog(`❌ ERROR DE ACCESO RED (CORS / BLOQUEO): ${fetchErr.message}`);
      addLog('💡 Sugerencia: Esto ocurre cuando la URL de Supabase es inexistente, el DNS falló, o un bloqueador de publicidad en tu navegador bloquea las solicitudes a dominios de Supabase.');
      setTestResult('error');
      setErrorDetails(`Error de Red (CORS / Bloqueado por Navegador): ${fetchErr.message}. Verifica que la URL del proyecto sea la correcta y que no tengas ad-blockers encendidos.`);
      return;
    }

    // 3. Crear cliente local y probar consulta
    try {
      addLog('Instanciando cliente de prueba temporal...');
      const client = createClient(testUrl.trim(), testKey.trim(), {
        auth: { persistSession: false }
      });

      addLog('Consultando registros de la tabla "games"...');
      const { data, error } = await client.from('games').select('*').limit(1);

      if (error) {
        addLog(`❌ ERROR en la respuesta de base de datos: ${error.message} (Código: ${error.code})`);
        
        // Diagnosticar errores específicos
        if (error.message.includes('relation "public.games" does not exist') || error.code === '42P01') {
          addLog('💡 DIAGNÓSTICO: Las tablas "games", "players" y "answers" NO han sido creadas en este proyecto de Supabase.');
          addLog('👉 SOLUCIÓN: Copia el script SQL del panel derecho, ve a tu panel de Supabase > SQL Editor > New Query, pégalo y haz clic en RUN.');
          setErrorDetails('Las tablas no existen en tu base de datos de Supabase. Debes ejecutar el script SQL de creación de tablas.');
        } else if (error.message.includes('Invalid API key') || error.message.includes('invalid JWT') || error.code === 'PGRST301') {
          addLog('💡 DIAGNÓSTICO: La clave Anon API Key ingresada es inválida o ha sido revocada.');
          addLog('👉 SOLUCIÓN: Obtén tu anon/public key desde Settings > API en tu panel de control de Supabase.');
          setErrorDetails('Credenciales inválidas: La clave de Supabase (Anon Key) es incorrecta.');
        } else if (error.code === '42501' || error.message.includes('row-level security') || error.message.includes('permission denied')) {
          addLog('💡 DIAGNÓSTICO: La tabla "games" tiene activado Row Level Security (RLS) pero carece de políticas de acceso público.');
          addLog('👉 SOLUCIÓN: Asegúrate de ejecutar el bloque de políticas públicas RLS al final del script SQL.');
          setErrorDetails('Acceso bloqueado por RLS (Row Level Security). Aplica las políticas públicas del script SQL.');
        } else {
          setErrorDetails(`${error.message} (Código: ${error.code || 'Desconocido'})`);
        }
        
        setTestResult('error');
      } else {
        addLog('✅ ¡Prueba de consulta finalizada con éxito!');
        addLog(`Número de partidas encontradas: ${data.length}`);
        setTestResult('success');
        setErrorDetails('');
      }
    } catch (catchErr) {
      addLog(`❌ EXCEPCIÓN INESPERADA: ${catchErr.message}`);
      setTestResult('error');
      setErrorDetails(catchErr.message);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (testResult !== 'success') {
      alert('Por favor, realiza una prueba de conexión exitosa antes de guardar.');
      return;
    }
    saveSupabaseConfig(url, key);
  };

  return (
    <div className="min-h-screen bg-blue-50/20 p-6 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Retícula lúdica de fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,174,239,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,174,239,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="w-full max-w-5xl bg-white border-2 border-blue-100 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Panel Izquierdo: Configuración y Test */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-black font-mono tracking-wider text-blue-600 uppercase">
                DIAGNÓSTICO SUPABASE
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">
              Configuración y Prueba de Conectividad
            </p>
            <p className="text-xs text-slate-650 leading-relaxed">
              Introduce las credenciales de tu proyecto Supabase. La aplicación realizará comprobaciones automáticas de DNS, CORS, estructura de tablas y políticas de seguridad (RLS).
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono tracking-wider">
                URL del Proyecto (API URL)
              </label>
              <input
                type="text"
                placeholder="https://tu-proyecto.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 text-slate-800 rounded-2xl text-xs focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono tracking-wider">
                Clave Pública Anónima (Anon API Key)
              </label>
              <textarea
                placeholder="eyJhbGciOi..."
                rows="3"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 text-slate-800 rounded-2xl text-[10px] focus:outline-none focus:border-blue-500 font-mono resize-none leading-relaxed"
                required
              />
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => runConnectionTest(url, key)}
                disabled={testResult === 'testing'}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase tracking-wider rounded-2xl shadow-sm text-xs font-mono border-2 border-slate-200 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                {testResult === 'testing' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Probando...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Probar Conexión</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={testResult !== 'success'}
                className={`flex-1 py-3 font-black uppercase tracking-wider rounded-2xl shadow-md text-xs font-mono flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                  testResult === 'success'
                    ? 'bg-green-500 hover:bg-green-600 text-white border-b-4 border-green-700'
                    : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                }`}
              >
                <span>Conectar y Entrar</span>
              </button>
            </div>
          </form>

          {/* INDICADOR DE ESTADO EN GRANDE */}
          {testResult && (
            <div className={`p-4 rounded-2xl border-2 shadow-sm flex flex-col gap-2 ${
              testResult === 'success'
                ? 'bg-green-50 border-green-300 text-green-800'
                : testResult === 'testing'
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}>
              <div className="flex items-center gap-2 font-mono font-black text-sm uppercase">
                {testResult === 'success' && <span>✅ Supabase Conectado</span>}
                {testResult === 'testing' && <span>⏳ Diagnosticando Red...</span>}
                {testResult === 'error' && <span>❌ Supabase Conexión Fallida</span>}
              </div>
              
              {errorDetails && (
                <div className="text-[10px] font-mono bg-white/60 p-2.5 rounded-xl border border-black/5 leading-relaxed break-all select-text font-bold">
                  {errorDetails}
                </div>
              )}
            </div>
          )}

          {/* VISOR DE CONSOLA DE DIAGNÓSTICO */}
          {diagnosticLogs.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-500" />
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Consola de Diagnóstico</span>
              </div>
              <div className="h-32 overflow-y-auto bg-gray-950 text-emerald-400 font-mono text-[9px] p-3 rounded-2xl space-y-1 border border-gray-900 shadow-inner select-text">
                {diagnosticLogs.map((log, idx) => {
                  let color = 'text-emerald-400';
                  if (log.includes('❌')) color = 'text-rose-400 font-bold';
                  if (log.includes('⚠️') || log.includes('💡')) color = 'text-amber-300';
                  if (log.includes('✅')) color = 'text-green-400 font-black';
                  return <div key={idx} className={color}>{log}</div>;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Panel Derecho: Instrucciones y SQL DDL */}
        <div className="flex-1 bg-blue-50/30 border-2 border-blue-50 p-5 rounded-3xl flex flex-col justify-between space-y-4 lg:max-w-md">
          <div>
            <h3 className="font-mono font-black text-xs text-blue-500 uppercase mb-2">
              Solución a Errores de Conexión
            </h3>
            <div className="text-slate-650 text-[10px] leading-relaxed space-y-2 font-medium">
              <p>
                <strong>¿Errores de red / CORS?</strong> Esto suele ser causado por extensiones ad-blockers (como uBlock Origin, Brave Shields) que bloquean la red a dominios externos. Desactiva el ad-blocker para esta página.
              </p>
              <p>
                <strong>¿RLS bloquea la creación?</strong> Supabase activa Row Level Security por defecto. Asegúrate de ejecutar la sección de políticas de seguridad al final del script para permitir juego público sin login.
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-200">
            <div className="flex justify-between items-center bg-gray-200 px-4 py-2 rounded-t-2xl border-t border-r border-l border-gray-300">
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">Script SQL Completo</span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 text-[9px] font-mono font-bold text-blue-500 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-xl transition-all border border-blue-200 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-green-500" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" />
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
