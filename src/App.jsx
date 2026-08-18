import React, { useState } from 'react';
import DashboardView from './components/DashboardView';
import HostView from './components/HostView';
import PlayerView from './components/PlayerView';
import { useGameSync } from './hooks/useGameSync';
import { Tv, Smartphone, Layers, ShieldCheck, Settings } from 'lucide-react';

export default function App() {
  // 'ROUTER' o 'HOST' o 'PLAYER' o 'SANDBOX'
  const [viewMode, setViewMode] = useState('ROUTER');
  const [isMuted, setIsMuted] = useState(false);

  // Inicialización de hooks para flujos independientes
  const standaloneHostSync = useGameSync(true);
  const standalonePlayerSync = useGameSync(false);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  if (viewMode === 'SANDBOX') {
    return <DashboardView onExit={() => setViewMode('ROUTER')} />;
  }

  if (viewMode === 'HOST') {
    return (
      <div className="min-h-screen bg-gray-950 p-6 flex flex-col">
        <div className="mb-4">
          <button
            onClick={() => {
              standaloneHostSync.startLobby(); // resetear
              setViewMode('ROUTER');
            }}
            className="px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg text-xs font-mono font-bold active:scale-95 transition-all"
          >
            ← Volver al Menú Principal
          </button>
        </div>
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
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
      <div className="min-h-screen bg-gray-950 p-4 flex flex-col justify-center items-center">
        <div className="w-full max-w-sm mb-4">
          <button
            onClick={() => setViewMode('ROUTER')}
            className="px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg text-xs font-mono font-bold active:scale-95 transition-all"
          >
            ← Menú Principal
          </button>
        </div>
        <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          <PlayerView sync={standalonePlayerSync} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Retícula de fondo industrial */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Puntos de luz decorativos */}
      <div className="absolute top-neg-20 left-neg-10 w-half h-half bg-blue-600/5 rounded-full blur-120" />
      <div className="absolute bottom-neg-20 right-neg-10 w-half h-half bg-cyan-600/5 rounded-full blur-120" />

      {/* Cabecera Principal */}
      <header className="relative z-10 text-center pt-16 px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/60 border border-blue-800/40 text-blue-400 rounded-full text-xs font-mono font-bold tracking-widest uppercase mb-4 animate-pulse">
          <ShieldCheck className="w-3.5 h-3.5" />
          Plataforma de Entrenamiento de Calidad
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 font-mono select-none uppercase drop-shadow-sm">
          SPC BATTLE ARENA
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto mt-3 font-medium">
          Aprende a seleccionar e interpretar gráficos de control estadístico de procesos (SPC) a través de juego cooperativo y competitivo en tiempo real.
        </p>
      </header>

      {/* Selector de Roles */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tarjeta 1: SIMULADOR INTEGRADO (RECOMENDADO) */}
          <div className="bg-gray-900 border-2 border-blue-500/80 rounded-2xl p-6 shadow-2xl flex flex-col justify-between hover-scale-up transition-all duration-200 relative group overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white font-mono font-black text-[9px] px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Recomendado
            </div>
            
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-950/60 text-blue-400 border border-blue-800/40 rounded-xl w-fit">
                <Layers className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase font-mono tracking-wide text-blue-400">
                  Simulador Demo
                </h3>
                <p className="text-xs text-gray-400 font-mono uppercase tracking-widest mt-1">
                  Pantalla Dividida
                </p>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Ejecuta el proyector de preguntas y la consola del jugador lado a lado. Se incorporan automáticamente 4 oponentes bots para jugar de inmediato en tu equipo de pruebas.
              </p>
            </div>
            
            <button
              onClick={() => setViewMode('SANDBOX')}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-blue-600/10 active:scale-95 transition-all"
            >
              Iniciar Simulador
            </button>
          </div>

          {/* Tarjeta 2: LANZAR INSTRUCTOR */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-gray-700 transition-all duration-200 relative group overflow-hidden">
            <div className="space-y-4">
              <div className="p-3.5 bg-gray-950/60 text-gray-400 border border-gray-800 rounded-xl w-fit group-hover:text-blue-400 group-hover:border-blue-900/30 transition-colors">
                <Tv className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase font-mono tracking-wide">
                  Instructor
                </h3>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">
                  Pantalla del Host
                </p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Lanza el juego para proyectar en una sala de capacitación. Genera un PIN único para que los alumnos ingresen y gestiona el avance de las diapositivas de control estadístico.
              </p>
            </div>
            
            <button
              onClick={() => {
                standaloneHostSync.startLobby();
                setViewMode('HOST');
              }}
              className="w-full mt-6 py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-750 font-mono font-bold text-xs uppercase tracking-wider rounded-lg active:scale-95 transition-all"
            >
              Lanzar Host
            </button>
          </div>

          {/* Tarjeta 3: CONSOLA DE JUGADOR */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-gray-700 transition-all duration-200 relative group overflow-hidden">
            <div className="space-y-4">
              <div className="p-3.5 bg-gray-950/60 text-gray-400 border border-gray-800 rounded-xl w-fit group-hover:text-blue-400 group-hover:border-blue-900/30 transition-colors">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase font-mono tracking-wide">
                  Jugador
                </h3>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">
                  Consola de Respuesta
                </p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Únete a una partida activa en el proyector de tu instructor. Introduce el PIN generado e ingresa tu apodo para competir por precisión y velocidad de respuesta.
              </p>
            </div>
            
            <button
              onClick={() => setViewMode('PLAYER')}
              className="w-full mt-6 py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-750 font-mono font-bold text-xs uppercase tracking-wider rounded-lg active:scale-95 transition-all"
            >
              Unirse como Jugador
            </button>
          </div>

        </div>
      </main>

      {/* Pie de página educativo */}
      <footer className="relative z-10 border-t border-gray-900 bg-gray-950/40 backdrop-blur py-8 px-6 text-center text-xs text-gray-500 font-mono">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex justify-center flex-wrap gap-4 text-gray-400 uppercase tracking-widest text-[9px] font-bold">
            <span>X̄-R Chart</span>
            <span>X̄-S Chart</span>
            <span>I-MR Chart</span>
            <span>P Chart</span>
            <span>NP Chart</span>
            <span>C Chart</span>
            <span>U Chart</span>
          </div>
          <p className="max-w-xl mx-auto leading-relaxed">
            SPC Battle Arena enseña a los ingenieros y operadores a seleccionar el gráfico de control óptimo (por variables continuas o por atributos discretos) y a aplicar las reglas de Western Electric para identificar causas asignables.
          </p>
          <p className="text-[10px] text-gray-600">
            © {new Date().getFullYear()} Flex Manufacturing Training System. Optimizado para GitHub Pages.
          </p>
        </div>
      </footer>
    </div>
  );
}
