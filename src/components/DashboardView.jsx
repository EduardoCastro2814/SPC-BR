import React, { useEffect, useState } from 'react';
import HostView from './HostView';
import PlayerView from './PlayerView';
import { useGameSync } from '../hooks/useGameSync';
import { soundManager } from '../services/sound';
import { Smartphone, Tv, Volume2, VolumeX, LogOut, Users } from 'lucide-react';

export default function DashboardView({ onExit }) {
  // Host y Jugador locales
  const hostSync = useGameSync(true);
  const playerSync = useGameSync(false);

  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    soundManager.setMuted(isMuted);
  }, [isMuted]);

  const hostPin = hostSync.pin;
  const playerJoined = playerSync.joined;

  // Auto-unir al jugador de pruebas
  const handleAutoJoin = () => {
    if (hostPin) {
      playerSync.joinGame(hostPin, 'Tú (Operador)');
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Agregar bots de prueba rápidos
  const handleAddThreeBots = () => {
    hostSync.addBotPlayer('Inspector_Rob');
    hostSync.addBotPlayer('Solder_Pro');
    hostSync.addBotPlayer('Gears_Op');
    hostSync.addBotPlayer('Press_Master');
  };

  return (
    <div className="min-h-screen bg-blue-50/20 text-slate-800 font-sans flex flex-col">
      {/* Barra de control superior */}
      <header className="bg-white border-b-2 border-blue-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 z-20 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider">
              Modo Sandbox
            </span>
            <h1 className="text-xl font-black font-mono tracking-wider text-blue-600 uppercase">
              SPC BATTLE ARENA SIMULATOR
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-bold">
            Prueba la experiencia multijugador en una sola pantalla. El lado izquierdo representa la proyección del proyector, y el derecho tu smartphone.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Auto unir */}
          {!playerJoined && hostSync.gameState === 'LOBBY' && (
            <button
              onClick={handleAutoJoin}
              disabled={!hostPin}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-2xl shadow-md active:scale-95 border-b-4 border-blue-800"
            >
              <Smartphone className="w-4 h-4" />
              Auto-Unirse
            </button>
          )}

          {/* Rellenar Bots */}
          {hostSync.gameState === 'LOBBY' && (
            <button
              onClick={handleAddThreeBots}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border-2 border-blue-100 text-slate-700 font-mono font-black text-xs uppercase tracking-wider rounded-2xl active:scale-95 shadow-sm"
            >
              <Users className="w-4 h-4 text-blue-500" />
              Rellenar con Bots
            </button>
          )}

          {/* Silenciar */}
          <button
            onClick={toggleMute}
            className="p-2.5 bg-slate-100 border-2 border-blue-50 hover:bg-slate-200 rounded-2xl text-slate-600 transition-all active:scale-95 shadow-sm"
            title={isMuted ? 'Activar Sonido' : 'Mutear'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Salir */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-100 hover:bg-red-200 border-2 border-red-200 text-red-500 font-mono font-black text-xs uppercase tracking-wider rounded-2xl active:scale-95 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Salir del Demo
          </button>
        </div>
      </header>

      {/* Grid del simulador (Pantalla dividida) */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-blue-50/10">
        
        {/* LADO IZQUIERDO: Pantalla del Host / Instructor (Proyector) */}
        <section className="lg:col-span-8 border-r-2 border-blue-50 flex flex-col justify-stretch overflow-y-auto p-4 md:p-6 min-h-500">
          <div className="bg-white border-2 border-blue-100 rounded-3xl overflow-hidden shadow-xl flex-1 flex flex-col relative">
            {/* Indicador de Proyector */}
            <div className="bg-blue-50/50 border-b-2 border-blue-100 px-4 py-2.5 flex items-center justify-between">
              <span className="text-[10px] text-blue-500 font-mono font-black uppercase tracking-widest flex items-center gap-2">
                <Tv className="w-3.5 h-3.5 text-blue-500" />
                VISTA DEL INSTRUCTOR (PROYECTOR DE AULA)
              </span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
              </div>
            </div>
            
            {/* Componente del Host */}
            <div className="flex-1 flex flex-col bg-white">
              <HostView
                sync={hostSync}
                isMuted={isMuted}
                onToggleMute={toggleMute}
              />
            </div>
          </div>
        </section>

        {/* LADO DERECHO: Dispositivo Móvil del Jugador */}
        <section className="lg:col-span-4 p-4 md:p-6 flex justify-center items-center overflow-y-auto">
          
          {/* Carcasa Mock de Smartphone */}
          <div 
            className="w-full max-w-phone aspect-phone bg-white border-blue-100 shadow-2xl relative flex flex-col overflow-hidden ring-8 ring-blue-500/10"
            style={{ borderWidth: '8px', borderRadius: '36px' }}
          >
            {/* Notch del Teléfono */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-blue-100 w-32 h-5 rounded-b-2xl z-30 flex justify-center items-center gap-1">
              <span className="w-8 h-1 bg-blue-500/20 rounded-full"></span>
              <span className="w-2 h-2 bg-blue-500/20 rounded-full"></span>
            </div>
            
            {/* Barra de Estado superior del teléfono */}
            <div className="bg-white pt-6 px-6 pb-2 text-[9px] text-slate-400 flex justify-between items-center z-20 font-mono font-bold">
              <span>SPC Arena Cell</span>
              <span>100% 🔋</span>
            </div>

            {/* Pantalla del Teléfono (Componente Jugador) */}
            <div className="flex-1 flex flex-col bg-white overflow-y-auto z-10">
              <PlayerView sync={playerSync} />
            </div>

            {/* Botón Home Virtual */}
            <div className="bg-white py-2 flex justify-center items-center z-20 border-t border-blue-50">
              <div className="w-24 h-1 bg-slate-200 rounded-full cursor-pointer hover:bg-slate-300 transition-colors" />
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
