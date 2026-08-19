import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HostView from './components/HostView';
import PlayerView from './components/PlayerView';
import { useGameSync } from './hooks/useGameSync';
import { Trophy, Award, Users, BarChart3, ArrowLeft } from 'lucide-react';
import { supabase } from './services/supabase';

// --- CUTE CARTOON SVG ILLUSTRATIONS FOR CARDS ---
function TeacherIllustration() {
  return (
    <svg width="100" height="70" viewBox="0 0 100 70" fill="none" className="mx-auto mb-4 animate-float" style={{ animationDelay: '0.5s' }}>
      <rect x="15" y="10" width="70" height="40" rx="8" fill="#FBBF24" stroke="#005B96" strokeWidth="4"/>
      <line x1="25" y1="20" x2="75" y2="20" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
      <line x1="25" y1="30" x2="60" y2="30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
      {/* Patas de pizarra */}
      <line x1="30" y1="50" x2="20" y2="65" stroke="#005B96" strokeWidth="4" strokeLinecap="round"/>
      <line x1="70" y1="50" x2="80" y2="65" stroke="#005B96" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="70" cy="35" r="4" fill="#22C55E" />
    </svg>
  );
}

function SmartphoneIllustration() {
  return (
    <svg width="100" height="70" viewBox="0 0 100 70" fill="none" className="mx-auto mb-4 animate-float" style={{ animationDelay: '1s' }}>
      <rect x="35" y="5" width="30" height="60" rx="8" fill="#EAF6FF" stroke="#005B96" strokeWidth="4"/>
      <rect x="40" y="10" width="20" height="42" rx="4" fill="#FFFFFF" stroke="#005B96" strokeWidth="2"/>
      <circle cx="50" cy="58" r="3" fill="#00AEEF"/>
      <circle cx="50" cy="20" r="3" fill="#22C55E"/>
      <path d="M45 36 Q 50 40 55 36" stroke="#EF4444" strokeWidth="2" fill="none"/>
    </svg>
  );
}

// --- SUB-COMPONENTE PARA INSTRUCTOR ---
function InstructorRoute({ sync, isMuted, onToggleMute }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!sync.pin && sync.startLobby) {
      sync.startLobby();
    }
  }, [sync]);

  return (
    <div className="min-h-screen bg-blue-50/10 p-6 flex flex-col font-sans">
      <div className="mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-100 hover:bg-blue-50 text-blue-500 font-mono font-black text-xs uppercase rounded-2xl active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Menú Principal
        </button>
      </div>
      <div className="flex-1 bg-white border-2 border-blue-100 rounded-3xl overflow-hidden shadow-xl flex flex-col">
        <HostView
          sync={sync}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
        />
      </div>
    </div>
  );
}

// --- VISTA DEL MENÚ PRINCIPAL ---
function MainMenuView({ connStatus, onLanzarHost, onUnirse }) {
  return (
    <div className="min-h-screen bg-blue-50/20 text-slate-800 font-sans flex flex-col justify-between relative overflow-hidden w-full">
      {/* Retícula lúdica de fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,174,239,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,174,239,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* Globos de color decorativos */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-100/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Ilustraciones lúdicas flotantes en el fondo */}
      <div className="absolute top-10 left-[8%] opacity-[0.06] pointer-events-none animate-float">
        <Trophy className="w-24 h-24 text-blue-600" />
      </div>
      <div className="absolute top-20 right-[8%] opacity-[0.06] pointer-events-none animate-float" style={{ animationDelay: '1s' }}>
        <BarChart3 className="w-28 h-28 text-blue-600" />
      </div>
      <div className="absolute bottom-20 left-[6%] opacity-[0.06] pointer-events-none animate-float" style={{ animationDelay: '2s' }}>
        <Users className="w-24 h-24 text-blue-600" />
      </div>
      <div className="absolute bottom-16 right-[6%] opacity-[0.06] pointer-events-none animate-float" style={{ animationDelay: '3s' }}>
        <Award className="w-28 h-28 text-blue-600" />
      </div>

      {/* Cabecera Principal */}
      <header className="relative z-10 text-center pt-8 px-6">
        <h1 className="fluid-title font-black tracking-wider text-blue-600 font-mono select-none uppercase drop-shadow-sm leading-tight">
          SPC Battle Arena
        </h1>
        <p className="fluid-subtitle text-slate-500 max-w-2xl mx-auto mt-2 font-bold leading-relaxed">
          Aprende Control Estadístico de Procesos mediante desafíos, competencias y juegos.
        </p>
      </header>

      {/* Grid de Modos de Juego (2 columnas) */}
      <main className="relative z-10 max-w-[1000px] mx-auto w-full px-6 py-6 flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* Tarjeta 1: MODO INSTRUCTOR */}
          <div className="bg-white border-2 border-blue-100 rounded-3xl p-8 shadow-md flex flex-col justify-between hover-scale-up h-full">
            <div className="text-center pt-2">
              <TeacherIllustration />
              <h3 className="text-xl font-black font-mono text-slate-700 uppercase">
                ✅ Modo Instructor
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Proyectar Juego
              </p>
              <p className="text-xs text-slate-550 leading-relaxed mt-4">
                Lanza una sala con PIN para proyectar en el aula y entrenar a tus alumnos.
              </p>
            </div>
            
            <button
              onClick={onLanzarHost}
              className="w-full mt-8 py-4 btn-primary font-mono font-black text-xs uppercase tracking-wider rounded-2xl"
            >
              Lanzar Host
            </button>
          </div>

          {/* Tarjeta 2: MODO JUGADOR */}
          <div className="bg-white border-2 border-blue-100 rounded-3xl p-8 shadow-md flex flex-col justify-between hover-scale-up h-full">
            <div className="text-center pt-2">
              <SmartphoneIllustration />
              <h3 className="text-xl font-black font-mono text-slate-700 uppercase">
                ✅ Modo Jugador
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Consola Móvil
              </p>
              <p className="text-xs text-slate-550 leading-relaxed mt-4">
                Introduce el PIN del instructor para responder las preguntas en tu dispositivo.
              </p>
            </div>
            
            <button
              onClick={onUnirse}
              className="w-full mt-8 py-4 btn-secondary font-mono font-black text-xs uppercase tracking-wider rounded-2xl"
            >
              Unirse
            </button>
          </div>

        </div>
      </main>

      {/* Pie de página didáctico */}
      <footer className="relative z-10 border-t border-blue-50 bg-white py-6 px-6 text-center text-xs text-slate-400 font-mono font-bold">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="text-blue-500 uppercase tracking-widest text-xs font-black">
            X̄-R | X̄-S | I-MR | P | NP | C | U
          </div>
          <div className="text-[10px] text-slate-500">
            © SPC Battle Arena
          </div>
          <div className="pt-2 text-[10px] text-slate-400 flex justify-center items-center gap-1.5">
            {connStatus === 'checking' && (
              <>
                <span className="text-yellow-500 animate-pulse">●</span>
                <span>Conectando al Servidor...</span>
              </>
            )}
            {connStatus === 'ready' && (
              <>
                <span className="text-emerald-500 font-black">●</span>
                <span>Servidor Activo</span>
              </>
            )}
            {connStatus === 'failed' && (
              <>
                <span className="text-rose-500 font-black">●</span>
                <span>Servidor Inactivo</span>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- CONTENIDO COMPLETO DE LA APP ENRUTADA ---
function AppContent({ startupConnStatus, setStartupConnStatus }) {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);

  // Inicialización de sincronizadores
  const standaloneHostSync = useGameSync(true);
  const standalonePlayerSync = useGameSync(false);

  // Registrar récords localmente al terminar partida
  useEffect(() => {
    if (standaloneHostSync.gameState === 'PODIUM' && standaloneHostSync.players.length > 0) {
      const winner = [...standaloneHostSync.players].sort((a, b) => b.score - a.score)[0];
      if (winner) {
        const saved = localStorage.getItem('spc_battle_rankings');
        let currentRankings = [];
        if (saved) {
          currentRankings = JSON.parse(saved);
        }
        
        if (!currentRankings.some((r) => r.name === winner.name && r.score === winner.score)) {
          const today = new Date().toLocaleDateString('es-ES');
          const updated = [...currentRankings, { name: winner.name, score: winner.score, date: today }]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
          localStorage.setItem('spc_battle_rankings', JSON.stringify(updated));
        }
      }
    }
  }, [standaloneHostSync.gameState, standaloneHostSync.players]);

  // Verificar conexión en segundo plano
  useEffect(() => {
    console.log('[Supabase] Inicializando conexión en segundo plano...');
    const checkConnection = async () => {
      if (!supabase) {
        console.error('[Supabase] Error: Cliente de base de datos no está inicializado.');
        setStartupConnStatus('failed');
        return;
      }
      try {
        const { error } = await supabase.from('games').select('count', { count: 'exact', head: true });
        if (error) {
          console.error('[Supabase] Error de conexión de base de datos:', error.message);
          setStartupConnStatus('failed');
        } else {
          console.log('[Supabase] Conexión establecida y verificada correctamente.');
          setStartupConnStatus('ready');
        }
      } catch (err) {
        console.error('[Supabase] Excepción en la validación de conexión:', err.message);
        setStartupConnStatus('failed');
      }
    };
    
    checkConnection();
  }, [setStartupConnStatus]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between w-full">
      {/* Banner global de advertencia de conexión */}
      {startupConnStatus === 'failed' && (
        <div className="bg-red-600 text-white font-mono font-bold text-xs py-2.5 px-4 flex justify-between items-center z-50 shadow-md relative animate-fadeIn w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <span>Error de conexión al servidor. Revisa tu internet o ad-blockers.</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white font-black uppercase text-[10px] rounded-lg transition-all active:scale-95 border border-white/30 font-mono"
          >
            Reintentar
          </button>
        </div>
      )}

      <Routes>
        {/* Menú Principal */}
        <Route 
          path="/" 
          element={
            <MainMenuView 
              connStatus={startupConnStatus}
              onLanzarHost={() => {
                standaloneHostSync.startLobby();
                navigate('/instructor');
              }}
              onUnirse={() => navigate('/player')}
            />
          } 
        />

        {/* Ruta de Jugador */}
        <Route 
          path="/player" 
          element={
            <div className="min-h-screen bg-blue-50/20 p-4 flex flex-col justify-center items-center font-sans w-full">
              <div className="w-full max-w-sm mb-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-100 hover:bg-blue-50 text-blue-500 font-mono font-black text-xs uppercase rounded-2xl active:scale-95 transition-all shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Menú Principal
                </button>
              </div>
              <div className="w-full max-w-sm bg-white border-2 border-blue-100 rounded-3xl overflow-hidden shadow-xl flex flex-col">
                <PlayerView sync={standalonePlayerSync} />
              </div>
            </div>
          } 
        />

        {/* Ruta del Instructor */}
        <Route 
          path="/instructor" 
          element={<InstructorRoute sync={standaloneHostSync} isMuted={isMuted} onToggleMute={toggleMute} />} 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// --- COMPONENTE RAÍZ ---
export default function App() {
  const [startupConnStatus, setStartupConnStatus] = useState('checking'); // checking, failed, ready

  useEffect(() => {
    console.log('[App] Aplicación SPC Battle Arena iniciada.');
  }, []);

  return (
    <HashRouter>
      <AppContent 
        startupConnStatus={startupConnStatus} 
        setStartupConnStatus={setStartupConnStatus} 
      />
    </HashRouter>
  );
}
