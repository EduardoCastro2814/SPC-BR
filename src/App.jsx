import React, { useState, useEffect } from 'react';
import DashboardView from './components/DashboardView';
import HostView from './components/HostView';
import PlayerView from './components/PlayerView';
import { useGameSync } from './hooks/useGameSync';
import { Trophy, Award, Users, BarChart3, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured, clearSupabaseConfig } from './services/supabase';
import SupabaseConfigView from './components/SupabaseConfigView';

// --- CUTE CARTOON SVG ILLUSTRATIONS FOR CARDS ---
function ControllerIllustration() {
  return (
    <svg width="100" height="70" viewBox="0 0 100 70" fill="none" className="mx-auto mb-4 animate-float">
      <rect x="10" y="10" width="80" height="50" rx="16" fill="#00AEEF" stroke="#005B96" strokeWidth="4"/>
      <circle cx="30" cy="35" r="8" fill="#FFFFFF" stroke="#005B96" strokeWidth="2"/>
      <path d="M30 30 L30 40 M25 35 L35 35" stroke="#005B96" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="64" cy="35" r="4" fill="#EF4444"/>
      <circle cx="74" cy="35" r="4" fill="#22C55E"/>
    </svg>
  );
}

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

function MedalIllustration() {
  return (
    <svg width="100" height="70" viewBox="0 0 100 70" fill="none" className="mx-auto mb-4 animate-float" style={{ animationDelay: '1.5s' }}>
      <path d="M 38 10 L 50 10 L 50 35 L 38 35 Z" fill="#EF4444"/>
      <path d="M 50 10 L 62 10 L 62 35 L 50 35 Z" fill="#00AEEF"/>
      <circle cx="50" cy="40" r="16" fill="#FBBF24" stroke="#005B96" strokeWidth="4"/>
      <circle cx="50" cy="40" r="10" fill="#FFFBEB"/>
      {/* Copa o estrella adentro */}
      <path d="M50 34 L52 38 L57 38 L53 41 L55 45 L50 42 L45 45 L47 41 L43 38 L48 38 Z" fill="#FBBF24"/>
    </svg>
  );
}

export default function App() {
  const [viewMode, setViewMode] = useState('ROUTER'); // ROUTER, HOST, PLAYER, SANDBOX, RANKINGS
  const [isMuted, setIsMuted] = useState(false);
  const [rankings, setRankings] = useState([]);

  // Validación de conexión al inicio
  const [startupConnStatus, setStartupConnStatus] = useState('checking'); // checking, success, failed, ready
  const [startupError, setStartupError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('games').select('count', { count: 'exact', head: true });
        if (error) {
          setStartupConnStatus('failed');
          
          if (error.message.includes('Failed to fetch') || error.code === 'PGRST100' || error.message.includes('TypeError')) {
            setStartupError('Error de red o CORS. Asegúrate de que el URL de Supabase sea correcto y que no haya ad-blockers bloqueando la conexión.');
          } else if (error.message.includes('relation "public.games" does not exist') || error.code === '42P01') {
            setStartupError('Las tablas requeridas no existen en la base de datos de Supabase. Debes ejecutar el archivo schema.sql en tu editor de SQL.');
          } else if (error.message.includes('Invalid API key') || error.message.includes('JWT') || error.code === 'PGRST301') {
            setStartupError('La clave Anon API Key de Supabase es inválida o ha expirado.');
          } else if (error.code === '42501' || error.message.includes('permission denied')) {
            setStartupError('Acceso bloqueado por RLS (Row Level Security). Aplica las políticas de lectura/escritura públicas del archivo schema.sql.');
          } else {
            setStartupError(`${error.message} [Código: ${error.code || 'Desconocido'}]`);
          }
        } else {
          setStartupConnStatus('success');
          // Breve retraso para mostrar el mensaje de éxito y luego ir al menú
          setTimeout(() => {
            setStartupConnStatus('ready');
          }, 1200);
        }
      } catch (err) {
        setStartupConnStatus('failed');
        setStartupError(err.message);
      }
    };
    
    checkConnection();
  }, []);

  // Inicialización de sincronizadores
  const standaloneHostSync = useGameSync(true);
  const standalonePlayerSync = useGameSync(false);

  // Leer y cargar rankings de localStorage
  useEffect(() => {
    const saved = localStorage.getItem('spc_battle_rankings');
    if (saved) {
      setRankings(JSON.parse(saved));
    } else {
      // Prellenar con algunos puntajes de bots divertidos si está vacío
      const defaultRankings = [
        { name: 'Inspector_Rob (Bot)', score: 4820, date: '17/08/2026' },
        { name: 'SPC_Sensei (Bot)', score: 4560, date: '17/08/2026' },
        { name: 'Solder_Pro (Bot)', score: 4120, date: '17/08/2026' },
        { name: 'Gears_Op (Bot)', score: 3840, date: '16/08/2026' },
        { name: 'Calip_Expert (Bot)', score: 3250, date: '15/08/2026' }
      ];
      localStorage.setItem('spc_battle_rankings', JSON.stringify(defaultRankings));
      setRankings(defaultRankings);
    }
  }, []);

  // Escuchar si el juego termina en el host para registrar automáticamente el puntaje del ganador
  useEffect(() => {
    if (standaloneHostSync.gameState === 'PODIUM' && standaloneHostSync.players.length > 0) {
      const winner = [...standaloneHostSync.players].sort((a, b) => b.score - a.score)[0];
      if (winner) {
        setRankings((prev) => {
          // Comprobar si el ganador ya está registrado hoy
          if (prev.some((r) => r.name === winner.name && r.score === winner.score)) {
            return prev;
          }
          const today = new Date().toLocaleDateString('es-ES');
          const updated = [...prev, { name: winner.name, score: winner.score, date: today }]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Conservar top 10
          localStorage.setItem('spc_battle_rankings', JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [standaloneHostSync.gameState, standaloneHostSync.players]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  if (!isSupabaseConfigured()) {
    return <SupabaseConfigView />;
  }

  // Comprobar estado de carga de la conexión inicial
  if (startupConnStatus === 'checking') {
    return (
      <div className="min-h-screen bg-blue-50/20 p-6 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-md bg-white border-2 border-blue-800 p-8 rounded-3xl shadow-xl text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
          <h2 className="text-lg font-black font-mono text-blue-600 uppercase">Verificando Servidor</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Conectando a Supabase...</p>
        </div>
      </div>
    );
  }

  if (startupConnStatus === 'success') {
    return (
      <div className="min-h-screen bg-blue-50/20 p-6 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-md bg-white border-2 border-emerald-500 p-8 rounded-3xl shadow-xl text-center space-y-4 animate-float">
          <div className="text-5xl animate-bounce">✅</div>
          <h2 className="text-lg font-black font-mono text-green-600 uppercase">Conectado a Supabase</h2>
          <p className="text-xs text-slate-450 font-mono uppercase tracking-wider font-bold">¡Bienvenido a la Arena!</p>
        </div>
      </div>
    );
  }

  if (startupConnStatus === 'failed') {
    return (
      <div className="min-h-screen bg-blue-50/20 p-6 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-md bg-white border-2 border-rose-500 p-8 rounded-3xl shadow-xl text-center space-y-6">
          <div className="text-rose-500 text-5xl">❌</div>
          <h2 className="text-xl font-black font-mono text-red-500 uppercase">Error de conexión</h2>
          
          <div className="text-xs font-mono bg-red-50 border border-red-150 p-4 rounded-2xl text-red-800 leading-relaxed text-left break-all select-text font-bold">
            <span className="block font-black text-[10px] uppercase text-red-500 mb-1">Razón del Error:</span>
            {startupError}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-grow py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-black uppercase text-xs rounded-2xl border-2 border-slate-200 active:scale-95 transition-all"
            >
              Reintentar
            </button>
            <button
              onClick={() => clearSupabaseConfig()}
              className="flex-grow py-3 bg-red-500 hover:bg-red-600 text-white font-mono font-black uppercase text-xs rounded-2xl border-b-4 border-red-700 active:scale-95 transition-all"
            >
              Configurar Servidor
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'SANDBOX') {
    return <DashboardView onExit={() => setViewMode('ROUTER')} />;
  }

  if (viewMode === 'HOST') {
    return (
      <div className="min-h-screen bg-blue-50/10 p-6 flex flex-col font-sans">
        <div className="mb-4">
          <button
            onClick={() => {
              standaloneHostSync.startLobby();
              setViewMode('ROUTER');
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-100 hover:bg-blue-50 text-blue-500 font-mono font-black text-xs uppercase rounded-2xl active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Menú Principal
          </button>
        </div>
        <div className="flex-1 bg-white border-2 border-blue-100 rounded-3xl overflow-hidden shadow-xl flex flex-col">
          <HostView
            sync={standaloneHostSync}
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
        </div>
      </div>
    );
  }

  if (viewMode === 'PLAYER') {
    return (
      <div className="min-h-screen bg-blue-50/20 p-4 flex flex-col justify-center items-center font-sans">
        <div className="w-full max-w-sm mb-4">
          <button
            onClick={() => setViewMode('ROUTER')}
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
    );
  }

  // VISTA DE RANKINGS (HALL OF FAME)
  if (viewMode === 'RANKINGS') {
    return (
      <div className="min-h-screen bg-blue-50/20 p-6 flex flex-col justify-center items-center font-sans">
        <div className="w-full max-w-xl mb-4">
          <button
            onClick={() => setViewMode('ROUTER')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-100 hover:bg-blue-50 text-blue-500 font-mono font-black text-xs uppercase rounded-2xl active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Menú
          </button>
        </div>

        <div className="w-full max-w-xl bg-white border-2 border-blue-100 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto animate-bounce mb-2" />
            <h2 className="text-3xl font-black font-mono text-blue-500 uppercase">Salón de la Fama</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Mejores Puntuaciones de SPC Battle Arena</p>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {rankings.map((rank, idx) => {
              const medals = ['🥇 1º', '🥈 2º', '🥉 3º'];
              const medalText = medals[idx] || `${idx + 1}º`;
              const rowBg = idx === 0 
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                : (idx === 1 ? 'bg-slate-50 border-slate-200 text-slate-700' : (idx === 2 ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-white border-blue-50 text-slate-800'));
              
              return (
                <div key={idx} className={`flex justify-between items-center px-4 py-2.5 border-2 rounded-2xl ${rowBg} shadow-sm font-mono font-bold text-xs`}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 font-black">{medalText}</span>
                    <span className="text-sm font-black">{rank.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-blue-500 font-black">{rank.score} XP</span>
                    <span className="text-[10px] text-slate-400">{rank.date}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => {
                if (window.confirm('¿Deseas resetear el Salón de la Fama?')) {
                  localStorage.removeItem('spc_battle_rankings');
                  window.location.reload();
                }
              }}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-500 font-bold text-[10px] font-mono uppercase tracking-wider rounded-xl transition-all"
            >
              Resetear Marcador
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MENU PRINCIPAL (ROUTER)
  return (
    <div className="min-h-screen bg-blue-50/20 text-slate-800 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Retícula lúdica de fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,174,239,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,174,239,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* Globos de color decorativos */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-100/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Ilustraciones lúdicas flotantes en el fondo (Subtles) */}
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
          Learn Statistical Process Control through challenges, competitions and games.
        </p>
      </header>

      {/* Grid de Modos de Juego (1400px máx width y responsive) */}
      <main className="relative z-10 max-w-[1400px] mx-auto w-full px-6 py-6 flex-1 flex items-center justify-center">
        <div className="game-cards-grid w-full">
          
          {/* Tarjeta 1: PRÁCTICA (SANDBOX DEMO) */}
          <div className="bg-white border-3 border-blue-500 rounded-3xl p-6 shadow-lg flex flex-col justify-between hover-scale-up relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 bg-blue-500 text-white font-mono font-black text-[9px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Recomendado
            </div>
            
            <div className="text-center pt-2">
              <ControllerIllustration />
              <h3 className="text-lg font-black font-mono text-blue-500 uppercase">
                🎮 Practice Mode
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Modo Sandbox
              </p>
              <p className="text-xs text-slate-550 leading-relaxed mt-4">
                Learn SPC concepts. Prueba el juego con bots y proyector integrado en la misma pantalla.
              </p>
            </div>
            
            <button
              onClick={() => setViewMode('SANDBOX')}
              className="w-full mt-6 py-4 btn-primary font-mono font-black text-xs uppercase tracking-wider rounded-2xl"
            >
              ¡Jugar Demo!
            </button>
          </div>

          {/* Tarjeta 2: LANZAR INSTRUCTOR */}
          <div className="bg-white border-2 border-blue-100 rounded-3xl p-6 shadow-md flex flex-col justify-between hover-scale-up h-full">
            <div className="text-center pt-2">
              <TeacherIllustration />
              <h3 className="text-lg font-black font-mono text-slate-700 uppercase">
                🏫 Instructor Mode
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Proyectar Juego
              </p>
              <p className="text-xs text-slate-550 leading-relaxed mt-4">
                Host a live competition. Lanza una sala con PIN para proyectar en el aula y entrenar a tus alumnos.
              </p>
            </div>
            
            <button
              onClick={() => {
                standaloneHostSync.startLobby();
                setViewMode('HOST');
              }}
              className="w-full mt-6 py-4 btn-secondary font-mono font-black text-xs uppercase tracking-wider rounded-2xl"
            >
              Lanzar Host
            </button>
          </div>

          {/* Tarjeta 3: CONSOLA DE JUGADOR */}
          <div className="bg-white border-2 border-blue-100 rounded-3xl p-6 shadow-md flex flex-col justify-between hover-scale-up h-full">
            <div className="text-center pt-2">
              <SmartphoneIllustration />
              <h3 className="text-lg font-black font-mono text-slate-700 uppercase">
                📱 Player Mode
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Consola Móvil
              </p>
              <p className="text-xs text-slate-550 leading-relaxed mt-4">
                Join a game session. Introduce el PIN del instructor para responder las preguntas en tu dispositivo.
              </p>
            </div>
            
            <button
              onClick={() => setViewMode('PLAYER')}
              className="w-full mt-6 py-4 btn-secondary font-mono font-black text-xs uppercase tracking-wider rounded-2xl"
            >
              Unirme
            </button>
          </div>

          {/* Tarjeta 4: RANKINGS */}
          <div className="bg-white border-2 border-blue-100 rounded-3xl p-6 shadow-md flex flex-col justify-between hover-scale-up h-full">
            <div className="text-center pt-2">
              <MedalIllustration />
              <h3 className="text-lg font-black font-mono text-slate-700 uppercase">
                🏅 Rankings
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Salón de la Fama
              </p>
              <p className="text-xs text-slate-550 leading-relaxed mt-4">
                View top scores. Revisa la lista de los mejores puntajes acumulados históricamente en el juego.
              </p>
            </div>
            
            <button
              onClick={() => setViewMode('RANKINGS')}
              className="w-full mt-6 py-4 btn-secondary font-mono font-black text-xs uppercase tracking-wider rounded-2xl"
            >
              Ver Récords
            </button>
          </div>

        </div>
      </main>

      {/* Pie de página didáctico simplificado */}
      <footer className="relative z-10 border-t border-blue-50 bg-white py-6 px-6 text-center text-xs text-slate-400 font-mono font-bold">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="text-blue-500 uppercase tracking-widest text-xs font-black">
            X̄-R | X̄-S | I-MR | P | NP | C | U
          </div>
          <div className="text-[10px] text-slate-500">
            © SPC Battle Arena
          </div>
          <div className="pt-2 flex justify-center items-center gap-2 text-[10px] text-slate-400">
            <span className="text-emerald-500 font-black">●</span> Servidor Supabase Conectado
            <button
              onClick={() => {
                if (window.confirm('¿Deseas desconectar o cambiar la base de datos de Supabase?')) {
                  clearSupabaseConfig();
                }
              }}
              className="text-blue-500 hover:text-blue-600 underline font-bold transition-all ml-1"
            >
              Cambiar Configuración
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
