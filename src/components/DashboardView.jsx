import React, { useEffect, useState } from 'react';
import HostView from './HostView';
import PlayerView from './PlayerView';
import { useGameSync } from '../hooks/useGameSync';
import { soundManager } from '../services/sound';
import { Play, Users, Smartphone, Tv, Volume2, VolumeX, RefreshCw, LogOut } from 'lucide-react';

export default function DashboardView({ onExit }) {
  // Inicializamos el Host
  const hostSync = useGameSync(true);
  // Inicializamos el Jugador en el mismo entorno
  const playerSync = useGameSync(false);

  const [isMuted, setIsMuted] = useState(false);

  // Sincronizar mute con el soundManager
  useEffect(() => {
    soundManager.setMuted(isMuted);
  }, [isMuted]);

  // Si el Host genera un PIN, lo prellenamos en el canal del jugador para facilitar las pruebas
  const hostPin = hostSync.pin;
  const playerJoined = playerSync.joined;

  // Auto unir al jugador de prueba con un solo clic
  const handleAutoJoin = () => {
    if (hostPin) {
      playerSync.joinGame(hostPin, 'Tú (Operador)');
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Añadir un set de bots automáticamente al iniciar para rellenar
  const handleAddThreeBots = () => {
    hostSync.addBotPlayer('Inspector_Rob');
    hostSync.addBotPlayer('Solder_Pro');
    hostSync.addBotPlayer('Gears_Op');
    hostSync.addBotPlayer('Press_Master');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
      {/* Barra de control superior */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 z-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider">
              Modo Sandbox
            </span>
            <h1 className="text-xl font-black font-mono tracking-wider text-blue-400 uppercase">
              SPC BATTLE ARENA SIMULATOR
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Prueba la experiencia multijugador local en una sola pantalla. El lado izquierdo representa el proyector del 
            instructor, y el derecho simula el smartphone del operador. 
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Unirse automáticamente */}
          {!playerJoined && hostSync.gameState === 'LOBBY' && (
            <button
              onClick={handleAutoJoin}
              disabled={!hostPin}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md font-mono active:scale-95 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Auto-Unirse
            </button>
          )}

          {/* Agregar bots rápidos */}
          {hostSync.gameState === 'LOBBY' && (
            <button
              onClick={handleAddThreeBots}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-lg font-mono active:scale-95 transition-all"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Rellenar con Bots
            </button>
          )}

          {/* Mutear/Desmutear */}
          <button
            onClick={toggleMute}
            className="p-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 rounded-lg text-gray-300 transition-all active:scale-95"
            title={isMuted ? 'Activar Sonido' : 'Mutear'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Salir */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/30 text-rose-400 font-bold text-xs uppercase tracking-wider rounded-lg font-mono active:scale-95 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir del Demo
          </button>
        </div>
      </header>

      {/* Grid del simulador (Pantalla dividida) */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-gray-950">
        
        {/* LADO IZQUIERDO: Pantalla del Host / Instructor (Proyector) */}
        <section className="lg:col-span-8 border-r border-gray-900 flex flex-col justify-stretch overflow-y-auto p-4 md:p-6 bg-gray-950 min-h-500">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex-1 flex flex-col relative">
            {/* Indicador de Proyector */}
            <div className="bg-gray-950 border-b border-gray-800 px-4 py-2 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
                <Tv className="w-3 h-3 text-blue-500" />
                VISTA DEL INSTRUCTOR (PROYECTOR)
              </span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-650 animate-pulse"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-gray-800"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-gray-800"></span>
              </div>
            </div>
            
            {/* Componente del Host */}
            <div className="flex-1 flex flex-col bg-gray-950">
              <HostView
                sync={hostSync}
                isMuted={isMuted}
                onToggleMute={toggleMute}
              />
            </div>
          </div>
        </section>

        {/* LADO DERECHO: Dispositivo Móvil del Jugador */}
        <section className="lg:col-span-4 bg-gray-950 p-4 md:p-6 flex justify-center items-center overflow-y-auto">
          
          {/* Carcasa Mock de Smartphone */}
          <div 
            className="w-full max-w-phone aspect-phone bg-gray-900 border-gray-800 shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-gray-900/30"
            style={{ borderWidth: '8px', borderRadius: '36px' }}
          >
            {/* Notch del Teléfono */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-800 w-32 h-5 rounded-b-2xl z-30 flex justify-center items-center gap-1">
              <span className="w-8 h-1 bg-gray-900 rounded-full"></span>
              <span className="w-2 h-2 bg-gray-900 rounded-full"></span>
            </div>
            
            {/* Barra de Estado superior del teléfono */}
            <div className="bg-gray-950 pt-6 px-6 pb-2 text-[10px] text-gray-500 flex justify-between items-center z-20 font-mono">
              <span>SPC Arena Cell</span>
              <span>100% 🔋</span>
            </div>

            {/* Pantalla del Teléfono (Componente Jugador) */}
            <div className="flex-1 flex flex-col bg-gray-950 overflow-y-auto z-10">
              <PlayerView sync={playerSync} />
            </div>

            {/* Botón Home Virtual */}
            <div className="bg-gray-950 py-2.5 flex justify-center items-center z-20 border-t border-gray-900">
              <div className="w-24 h-1 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition-colors" />
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
