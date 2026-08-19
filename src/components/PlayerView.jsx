import React, { useState } from 'react';
import { Zap, ShieldAlert, HelpCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

// --- CUTE CARTOON SVG AVATARS ---
export function AvatarSVG({ type, size = 64 }) {
  if (type === 'engineer') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="animate-float">
        <circle cx="32" cy="32" r="28" fill="#FFDBB5" stroke="#005B96" strokeWidth="3"/>
        {/* Casco amarillo */}
        <path d="M12 28 C 12 10, 52 10, 52 28 Z" fill="#FBBF24" stroke="#005B96" strokeWidth="3"/>
        <rect x="22" y="24" width="20" height="5" rx="2.5" fill="#F59E0B" stroke="#005B96" strokeWidth="2"/>
        {/* Ojos felices */}
        <path d="M 22 36 Q 25 33 28 36" stroke="#005B96" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M 36 36 Q 39 33 42 36" stroke="#005B96" strokeWidth="3" strokeLinecap="round" fill="none"/>
        {/* Sonrisa */}
        <path d="M 24 44 Q 32 50 40 44" stroke="#005B96" strokeWidth="3" strokeLinecap="round" fill="none"/>
        {/* Mejillas */}
        <circle cx="18" cy="42" r="3" fill="#FF8A8A" opacity="0.6"/>
        <circle cx="46" cy="42" r="3" fill="#FF8A8A" opacity="0.6"/>
      </svg>
    );
  }
  if (type === 'robot') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="animate-float" style={{ animationDelay: '0.5s' }}>
        {/* Cabeza metálica */}
        <rect x="14" y="18" width="36" height="32" rx="8" fill="#EAF6FF" stroke="#005B96" strokeWidth="3"/>
        {/* Antena */}
        <line x1="32" y1="18" x2="32" y2="8" stroke="#005B96" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="32" cy="8" r="4" fill="#EF4444" stroke="#005B96" strokeWidth="2"/>
        {/* Orejas de tornillo */}
        <rect x="8" y="28" width="6" height="12" rx="2" fill="#00AEEF" stroke="#005B96" strokeWidth="2"/>
        <rect x="50" y="28" width="6" height="12" rx="2" fill="#00AEEF" stroke="#005B96" strokeWidth="2"/>
        {/* Pantalla ojos digital */}
        <rect x="20" y="24" width="24" height="12" rx="4" fill="#0f172a"/>
        <circle cx="26" cy="30" r="2.5" fill="#22C55E"/>
        <circle cx="38" cy="30" r="2.5" fill="#22C55E"/>
        {/* Boca zig zag */}
        <path d="M 24 43 L 28 40 L 32 43 L 36 40 L 40 43" stroke="#005B96" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    );
  }
  if (type === 'chart') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="animate-float" style={{ animationDelay: '1s' }}>
        <rect x="8" y="8" width="48" height="48" rx="12" fill="#FFFFFF" stroke="#005B96" strokeWidth="3"/>
        {/* Rejilla de fondo */}
        <line x1="20" y1="8" x2="20" y2="56" stroke="#EAF6FF" strokeWidth="1.5"/>
        <line x1="32" y1="8" x2="32" y2="56" stroke="#EAF6FF" strokeWidth="1.5"/>
        <line x1="44" y1="8" x2="44" y2="56" stroke="#EAF6FF" strokeWidth="1.5"/>
        <line x1="8" y1="32" x2="56" y2="32" stroke="#EAF6FF" strokeWidth="1.5"/>
        {/* Línea del gráfico sonriente */}
        <path d="M 14 42 Q 24 16 36 32 T 50 18" stroke="#00AEEF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Puntos de datos con ojitos */}
        <circle cx="22" cy="27" r="5" fill="#22C55E" stroke="#005B96" strokeWidth="1.5"/>
        <circle cx="36" cy="32" r="5" fill="#22C55E" stroke="#005B96" strokeWidth="1.5"/>
        <circle cx="48" cy="20" r="5" fill="#EF4444" stroke="#005B96" strokeWidth="1.5"/>
        {/* Cara del gráfico */}
        <circle cx="32" cy="46" r="1.5" fill="#005B96"/>
        <circle cx="38" cy="46" r="1.5" fill="#005B96"/>
        <path d="M 33 49 Q 35 51 37 49" stroke="#005B96" strokeWidth="1" fill="none"/>
      </svg>
    );
  }
  if (type === 'factory') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="animate-float" style={{ animationDelay: '1.5s' }}>
        <rect x="8" y="28" width="48" height="28" rx="6" fill="#005B96" stroke="#005B96" strokeWidth="2"/>
        {/* Techos en sierra */}
        <path d="M 8 28 L 20 16 L 20 28 L 32 16 L 32 28 L 44 16 L 44 28 L 56 28 Z" fill="#00AEEF" stroke="#005B96" strokeWidth="3" strokeLinejoin="round"/>
        {/* Chimeneas echando nubecitas */}
        <circle cx="16" cy="10" r="3" fill="#EAF6FF" stroke="#005B96" strokeWidth="1.5"/>
        <circle cx="28" cy="10" r="3" fill="#EAF6FF" stroke="#005B96" strokeWidth="1.5"/>
        {/* Ventanas sonrientes */}
        <rect x="14" y="36" width="8" height="12" rx="2" fill="#FBBF24" stroke="#005B96" strokeWidth="2"/>
        <rect x="28" y="36" width="8" height="12" rx="2" fill="#FBBF24" stroke="#005B96" strokeWidth="2"/>
        <rect x="42" y="36" width="8" height="12" rx="2" fill="#FBBF24" stroke="#005B96" strokeWidth="2"/>
        {/* Puerta */}
        <path d="M 28 56 L 28 48 C 28 46, 36 46, 36 48 L 36 56 Z" fill="#EF4444" stroke="#005B96" strokeWidth="2"/>
      </svg>
    );
  }
  if (type === 'analyst') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="animate-float" style={{ animationDelay: '2s' }}>
        <circle cx="32" cy="32" r="28" fill="#FFECE1" stroke="#005B96" strokeWidth="3"/>
        {/* Cabello morado/azul */}
        <path d="M10 24 C 10 6, 54 6, 54 24 C 54 28, 48 30, 48 24 Z" fill="#005B96" stroke="#005B96" strokeWidth="1"/>
        {/* Gafas de protección (Círculos cyan gigantes) */}
        <rect x="16" y="24" width="32" height="12" rx="6" fill="rgba(0, 174, 239, 0.4)" stroke="#005B96" strokeWidth="2"/>
        <line x1="32" y1="24" x2="32" y2="36" stroke="#005B96" strokeWidth="2"/>
        {/* Ojitos felices dentro de las gafas */}
        <circle cx="24" cy="30" r="1.5" fill="#005B96"/>
        <circle cx="40" cy="30" r="1.5" fill="#005B96"/>
        {/* Sonrisa feliz */}
        <path d="M 25 44 Q 32 49 39 44" stroke="#005B96" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Matraz en la mano */}
        <path d="M 44 46 L 40 56 L 52 56 Z" fill="#22C55E" stroke="#005B96" strokeWidth="2"/>
        <rect x="44" y="42" width="4" height="6" fill="#EAF6FF" stroke="#005B96" strokeWidth="1.5"/>
      </svg>
    );
  }
  return null;
}

// Componente para generar confeti por CSS
function ConfettiEffect() {
  const dots = Array.from({ length: 35 });
  const colors = ['#22C55E', '#00AEEF', '#FBBF24', '#EF4444', '#EC4899', '#A855F7'];

  return (
    <div className="confetti-container">
      {dots.map((_, i) => {
        const left = Math.random() * 100;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const delay = Math.random() * 2.5;
        const duration = 2 + Math.random() * 2;
        const size = 6 + Math.random() * 8;
        
        return (
          <div
            key={i}
            className="confetti-dot"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              width: `${size}px`,
              height: `${size}px`
            }}
          />
        );
      })}
    </div>
  );
}

export default function PlayerView({ sync, forceLogin }) {
  const {
    pin,
    gameState,
    currentQuestionIndex,
    timer,
    joined,
    hasAnswered,
    myLastAnswerCorrect,
    pointsEarnedThisRound,
    myScore,
    myStreak,
    myRank,
    playerName,
    joinGame,
    submitAnswer,
    joinError,
    clearJoinError,
    leaveSession
  } = sync;

  const [inputPin, setInputPin] = useState('');
  const [inputName, setInputName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [showExitMenu, setShowExitMenu] = useState(false);

  React.useEffect(() => {
    console.log("[PlayerView] Player route loading - Cargando panel del jugador (Player route loading)...");
    if (forceLogin && leaveSession) {
      leaveSession();
    }
  }, [forceLogin, leaveSession]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="p-6 text-center text-rose-600 font-mono space-y-4">
        <div className="text-4xl">❌</div>
        <h2 className="text-sm font-black uppercase">Error de Conexión</h2>
        <p className="text-[11px] text-slate-655 font-bold leading-relaxed px-2">
          Error: Cliente Supabase no inicializado
        </p>
        <p className="text-[10px] text-slate-400">
          Por favor verifica las variables de entorno o la configuración de tu red.
        </p>
      </div>
    );
  }

  const wrap = (content) => {
    return (
      <div className="relative flex-1 flex flex-col min-h-500 justify-between">
        <div className="flex-1 flex flex-col justify-stretch">
          {content}
        </div>
        
        {/* Barra de utilidades inferior */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 flex justify-between items-center text-[10px] font-mono text-slate-500 w-full select-none">
          <span className="font-bold">Sala PIN: {pin}</span>
          <button
            onClick={() => setShowExitMenu(true)}
            className="text-red-500 hover:text-red-655 font-black uppercase tracking-wider transition-all active:scale-95 px-2.5 py-1 rounded-xl bg-red-50 border border-red-100"
          >
            ⚙️ Salir / Opciones
          </button>
        </div>

        {/* Modal de Opciones de Salida */}
        {showExitMenu && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex flex-col justify-end transition-all animate-fadeIn">
            <div className="bg-white rounded-t-3xl border-t-4 border-blue-500 p-5 space-y-4 shadow-2xl animate-slideUp">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 font-mono">
                  Opciones de Operador
                </h4>
                <button
                  onClick={() => setShowExitMenu(false)}
                  className="text-slate-400 hover:text-slate-650 font-black font-mono text-base px-2 py-1"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setShowExitMenu(false);
                    if (leaveSession) leaveSession();
                  }}
                  className="w-full py-3 bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-655 font-black uppercase text-xs rounded-2xl transition-all active:scale-95 font-mono tracking-wider"
                >
                  🚪 Salir de partida
                </button>
                <button
                  onClick={() => {
                    setShowExitMenu(false);
                    if (leaveSession) leaveSession();
                  }}
                  className="w-full py-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-150 text-blue-600 font-black uppercase text-xs rounded-2xl transition-all active:scale-95 font-mono tracking-wider"
                >
                  👤 Cambiar jugador
                </button>
                <button
                  onClick={() => {
                    setShowExitMenu(false);
                    if (leaveSession) leaveSession();
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 border-2 border-slate-350 text-slate-700 font-black uppercase text-xs rounded-2xl transition-all active:scale-95 font-mono tracking-wider"
                >
                  🔑 Cerrar sesión
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setShowExitMenu(false)}
                  className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-mono hover:text-slate-600"
                >
                  Volver al Juego
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleJoin = (e) => {
    e.preventDefault();
    console.log("Join pressed");
    console.log("Validando PIN:", inputPin);
    console.log("Validando Nombre:", inputName);
    console.log("Avatar seleccionado:", selectedAvatar);

    if (!inputPin.trim()) {
      console.log("Validación fallida: PIN vacío");
      return;
    }
    if (inputPin.trim().length !== 6) {
      console.log("Validación fallida: PIN inválido (debe tener 6 dígitos)");
      return;
    }
    if (!inputName.trim()) {
      console.log("Validación fallida: Nombre vacío");
      return;
    }
    if (!selectedAvatar) {
      console.log("Validación fallida: Avatar no seleccionado");
      return;
    }

    // Guardar avatar elegido en almacenamiento de sesión para que el host pueda sincronizarlo
    sessionStorage.setItem(`avatar_${inputName.trim().toLowerCase()}`, selectedAvatar);
    console.log("Enviando petición de unión de juego al hook...");
    joinGame(inputPin.trim(), inputName.trim());
  };

  const avatarsList = ['engineer', 'robot', 'chart', 'factory', 'analyst'];

  // NUEVO CÓDIGO DE COLORES CARTOON:
  // A = Azul (#00AEEF)
  // B = Verde (#22C55E)
  // C = Amarillo (#FBBF24)
  // D = Red (#EF4444)
  const answerButtons = [
    { index: 0, color: 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200 text-white', icon: TriangleIcon, label: 'Opción A' },
    { index: 1, color: 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200 text-white', icon: DiamondIcon, label: 'Opción B' },
    { index: 2, color: 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200 text-white', icon: CircleIcon, label: 'Opción C' },
    { index: 3, color: 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 text-white', icon: SquareIcon, label: 'Opción D' }
  ];

  const isBtnDisabled = !inputPin.trim() || !inputName.trim() || !selectedAvatar;

  // 1. PANTALLA DE INGRESO (CON SELECTOR DE AVATARES)
  if (!joined) {
    return wrap(
      <div className="flex flex-col justify-center items-center min-h-500 bg-white text-slate-800 p-6 font-sans">
        <div className="w-full max-w-sm p-6 bg-white border-2 border-blue-100 rounded-3xl shadow-lg relative overflow-hidden">
          {/* Neon/Rainbow Border */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400" />
          
          <div className="text-center mb-6 pt-2">
            <h1 className="text-2xl font-black uppercase tracking-wider text-blue-500 font-mono">
              ✅ Modo Jugador
            </h1>
          </div>

          {/* Mostrar error de servidor si existe */}
          {joinError && (
            <div className="p-3 bg-rose-50 border border-rose-150 text-rose-600 font-mono font-bold text-xs rounded-2xl text-center mb-4">
              ❌ {joinError}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            {/* PIN de la sala */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-mono text-center">
                PIN de partida
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={inputPin}
                onChange={(e) => {
                  setInputPin(e.target.value.replace(/\D/g, ''));
                  if (clearJoinError) clearJoinError();
                }}
                className="w-full px-4 py-2.5 bg-gray-50 border-3 border-gray-100 text-slate-800 rounded-2xl text-center text-xl font-black tracking-widest focus:outline-none"
              />
            </div>
            
            {/* Apodo */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-mono text-center">
                Nombre
              </label>
              <input
                type="text"
                maxLength="12"
                placeholder="Ej. SuperCalidad"
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  if (clearJoinError) clearJoinError();
                }}
                className="w-full px-4 py-2.5 bg-gray-50 border-3 border-gray-100 text-slate-800 rounded-2xl text-center text-base font-bold focus:outline-none"
              />
            </div>

            {/* Selector de Avatar */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 font-mono text-center">
                Elige tu Personaje Avatar
              </label>
              <div className="flex justify-around items-center bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                {avatarsList.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => {
                      console.log("Avatar seleccionado:", avatar);
                      setSelectedAvatar(avatar);
                      if (clearJoinError) clearJoinError();
                    }}
                    style={{
                      transform: selectedAvatar === avatar ? 'scale(1.15)' : 'scale(1)',
                      border: selectedAvatar === avatar ? '3px solid var(--primary-blue)' : '3px solid transparent',
                      backgroundColor: selectedAvatar === avatar ? 'rgba(0, 174, 239, 0.15)' : 'transparent',
                      transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    className="p-1.5 rounded-xl"
                  >
                    <AvatarSVG type={avatar} size={36} />
                  </button>
                ))}
              </div>
            </div>

            {/* Botón Jugar */}
            <button
              type="submit"
              disabled={isBtnDisabled}
              className={`w-full py-4 text-white font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all font-mono ${
                isBtnDisabled 
                  ? 'bg-slate-300 shadow-none cursor-not-allowed opacity-75' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 active:scale-95'
              }`}
            >
              Unirse
            </button>
          </form>

          {/* Mostrar razones si el botón de unión está bloqueado */}
          {isBtnDisabled && (
            <div className="text-[10px] text-rose-500 font-mono font-bold text-center mt-3 space-y-1">
              {!inputPin.trim() && <div>❌ PIN de partida vacío.</div>}
              {inputPin.trim() && inputPin.trim().length !== 6 && <div>❌ El PIN debe tener 6 dígitos.</div>}
              {!inputName.trim() && <div>❌ Nombre vacío.</div>}
              {!selectedAvatar && <div>❌ Debes seleccionar un avatar.</div>}
            </div>
          )}
          
          <div className="mt-5 text-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">
              Versión Educativa v2.5
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. PANTALLA DE LOBBY (ESPERANDO AL HOST)
  if (gameState === 'LOBBY') {
    return wrap(
      <div className="flex flex-col justify-between items-center min-h-500 bg-white text-slate-800 p-6 font-sans">
        <div className="text-center mt-8 space-y-4 w-full">
          <div className="mb-2">
            <span className="text-[10px] bg-yellow-100 border border-yellow-300 text-amber-650 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
              Esperando inicio de partida...
            </span>
          </div>
          <div className="flex justify-center">
            <AvatarSVG type={selectedAvatar} size={96} />
          </div>
          
          <h2 className="text-2xl font-black text-blue-500">¡Conectado, {playerName}!</h2>
          
          <div className="bg-blue-50 border-2 border-blue-100 px-6 py-2 rounded-2xl inline-block">
            <span className="text-xs font-mono font-bold text-blue-500">PIN de Sala Activo</span>
            <div className="text-2xl font-black font-mono text-blue-600">{pin}</div>
          </div>
        </div>

        <div className="w-full max-w-xs p-5 bg-blue-50/40 border border-blue-100 rounded-3xl text-center shadow-inner mb-6 space-y-3">
          <div className="text-xs text-slate-500 uppercase tracking-widest font-mono font-bold">
            Tu Estado
          </div>
          <div className="text-sm font-bold text-amber-600 animate-pulse font-mono uppercase leading-relaxed px-2">
            Esperando que el instructor inicie la partida
          </div>
          <div className="flex justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
          </div>
        </div>

        {/* Stack de Botones de Salida Directa en Lobby */}
        <div className="w-full max-w-xs mb-6 space-y-2">
          <button
            onClick={() => leaveSession && leaveSession()}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-655 font-black uppercase text-[10px] rounded-2xl transition-all active:scale-95 font-mono tracking-wider"
          >
            🚪 Salir de partida
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => leaveSession && leaveSession()}
              className="py-2 bg-blue-50 hover:bg-blue-100 border-2 border-blue-150 text-blue-600 font-black uppercase text-[9px] rounded-2xl transition-all active:scale-95 font-mono tracking-wider"
            >
              👤 Cambiar jugador
            </button>
            <button
              onClick={() => leaveSession && leaveSession()}
              className="py-2 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 text-slate-655 font-black uppercase text-[9px] rounded-2xl transition-all active:scale-95 font-mono tracking-wider"
            >
              🔑 Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. PANTALLA DE INTRO DE PREGUNTA ("PREPÁRATE")
  if (gameState === 'INTRO') {
    return wrap(
      <div className="flex flex-col justify-center items-center min-h-500 bg-blue-50 text-slate-800 p-6 font-sans text-center">
        <div className="animate-fadeIn space-y-4">
          <div className="mb-2">
            <span className="text-[10px] bg-emerald-100 border border-emerald-250 text-emerald-600 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
              Partida iniciada
            </span>
          </div>
          <div className="flex justify-center mb-2">
            <AvatarSVG type={selectedAvatar} size={80} />
          </div>
          <div className="text-xs text-blue-500 font-bold uppercase tracking-widest font-mono">
            ¡Prepárate Operador!
          </div>
          <h2 className="text-3xl font-black uppercase font-mono text-blue-600">
            Pregunta {currentQuestionIndex + 1}
          </h2>
          <div className="w-16 h-1.5 bg-blue-500 mx-auto rounded-full" />
          <p className="text-xs text-slate-500 font-semibold px-4">
            Mira la pantalla principal para leer la pregunta y las opciones.
          </p>
        </div>
      </div>
  );
  }

  // 4. PANTALLA DE RESPUESTA ACTIVA (PANELES GEOMÉTRICOS)
  if (gameState === 'QUESTION') {
    if (hasAnswered) {
      return wrap(
        <div className="flex flex-col justify-center items-center min-h-500 bg-white text-slate-800 p-6 text-center font-sans">
          <div className="space-y-4 animate-float">
            <div className="flex justify-center">
              <AvatarSVG type={selectedAvatar} size={80} />
            </div>
            
            <h2 className="text-xl font-black uppercase font-mono tracking-wide text-green-500">
              ¡Respuesta Recibida!
            </h2>
            <p className="text-xs text-slate-500 font-bold">
              Excelente velocidad. Esperando a los demás operadores...
            </p>
            <div className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-full inline-block">
              Tiempo restante: {timer}s
            </div>
          </div>
        </div>
    );
    }

    return wrap(
      <div className="flex flex-col justify-between min-h-500 bg-blue-50/30 p-4 font-sans text-slate-800 w-full">
        <div className="text-center mb-2">
          <span className="text-[9px] bg-blue-100 border border-blue-200 text-blue-600 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
            Pregunta recibida
          </span>
        </div>
        {/* Cabecera del jugador */}
        <div className="flex justify-between items-center bg-white border-2 border-blue-50 px-4 py-2 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <AvatarSVG type={selectedAvatar} size={30} />
            <div>
              <span className="font-bold text-xs block text-slate-800">{playerName}</span>
              <span className="text-[9px] text-slate-400 font-mono font-bold block">Puntaje: {myScore}</span>
            </div>
          </div>
          <div className="animate-timer-pulse flex items-center gap-1 bg-red-150 border-2 border-red-500 text-red-500 px-3 py-1 rounded-full font-mono font-black text-sm">
            <Zap className="w-4 h-4 fill-current" />
            <span>{timer}s</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono font-bold">Rango</span>
            <span className="font-black text-sm text-blue-500 block">#{myRank}</span>
          </div>
        </div>

        {/* Panel Táctil de 4 Respuestas con nuevos colores */}
        <div className="grid grid-cols-2 gap-4 my-4 flex-1 min-h-300">
          {answerButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.index}
                onClick={() => submitAnswer(btn.index)}
                className={`flex flex-col justify-center items-center ${btn.color} rounded-3xl border-b-4 border-black/20 active:scale-95 transition-all duration-100 p-6 group relative`}
              >
                <div className="text-white group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-14 h-14 filter drop-shadow-md" />
                </div>
                <span className="text-[10px] font-bold font-mono tracking-wider opacity-85 uppercase text-white mt-3">
                  {btn.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Indicador de Racha */}
        {myStreak > 0 && (
          <div className="text-center py-2 bg-yellow-100 border-2 border-yellow-350 text-amber-500 font-black rounded-2xl text-xs font-mono animate-bounce">
            🔥 Racha activa: ¡{myStreak} aciertos seguidos! 🔥
          </div>
        )}
      </div>
  );
  }

  // 5. REVELACIÓN DE RESPUESTA (CON CONFETI Y SHAKE DE CARICATURA)
  if (gameState === 'REVEAL') {
    const isCorrect = myLastAnswerCorrect;
    
    return wrap(
      <div className={`flex flex-col justify-between items-center min-h-500 p-6 font-sans text-white transition-colors duration-300 relative overflow-hidden ${
        isCorrect ? 'bg-green-500 border-t-8 border-green-600 animate-fadeIn' : 'bg-red-500 border-t-8 border-red-650 animate-shake'
      }`}>
        
        {/* Renderizar confeti en caso de acierto */}
        {isCorrect && <ConfettiEffect />}

        <div className="text-center mt-8 space-y-4 relative z-10">
          <div className="inline-flex p-4 rounded-full bg-white/20 shadow-inner">
            {isCorrect ? (
              <AvatarSVG type={selectedAvatar} size={80} />
            ) : (
              <ShieldAlert className="w-16 h-16 text-white animate-bounce" />
            )}
          </div>
          
          <h2 className="text-3xl font-black tracking-wider uppercase font-mono drop-shadow-md">
            {isCorrect ? '✅ ¡Correcto!' : '❌ ¡Incorrecto!'}
          </h2>
          <div className="text-xs font-mono opacity-90 uppercase tracking-widest font-black">
            {isCorrect ? `+${pointsEarnedThisRound} Puntos Ganados` : '¡Sigue intentando, operador!'}
          </div>
        </div>

        {/* Panel de estadísticas redondeado */}
        <div className="w-full max-w-xs bg-white text-slate-800 p-4 rounded-3xl shadow-lg mb-6 relative z-10 border-2 border-blue-50">
          <div className="flex justify-between items-center text-xs font-mono font-bold border-b border-gray-100 pb-2 mb-2">
            <span className="text-slate-500">Posición:</span>
            <span className="text-blue-500 text-sm">#{myRank} lugar</span>
          </div>
          <div className="flex justify-between items-center text-xs font-mono font-bold">
            <span className="text-slate-500">Puntaje Total:</span>
            <span className="text-amber-500 text-sm">{myScore} pts</span>
          </div>
          {isCorrect && myStreak >= 3 && (
            <div className="mt-3 text-[10px] font-black text-amber-500 animate-pulse font-mono uppercase text-center bg-amber-50 border border-amber-200 py-1 rounded-xl">
              🔥 ¡Bono de Racha! (+100 pts)
            </div>
          )}
        </div>
      </div>
  );
  }

  // 6. TABLA DE POSICIONES INTERMEDIA
  if (gameState === 'LEADERBOARD') {
    return wrap(
      <div className="flex flex-col justify-between items-center min-h-500 bg-white text-slate-800 p-6 font-sans">
        <div className="text-center mt-10 space-y-2">
          <div className="flex justify-center mb-2">
            <AvatarSVG type={selectedAvatar} size={80} />
          </div>
          <h2 className="text-2xl font-black uppercase font-mono tracking-wider text-blue-500">Marcador Temporal</h2>
          <p className="text-xs text-slate-500 font-bold">Mira el proyector para ver si estás en el Top 5</p>
        </div>

        <div className="w-full max-w-xs bg-blue-50/50 border-2 border-blue-100 p-5 rounded-3xl text-center shadow-lg mb-6">
          <div className="text-xs text-blue-500 uppercase tracking-widest font-mono font-black">Tu Puntuación</div>
          <div className="text-3xl font-black font-mono text-blue-600 mt-2">{myScore} pts</div>
          <div className="text-sm font-bold text-slate-600 mt-1 font-mono">Posición en la Arena: #{myRank}</div>
          
          <div className="mt-4 pt-3 border-t border-blue-100 text-[10px] text-slate-400 font-mono font-bold uppercase">
            Próxima pregunta próximamente...
          </div>
        </div>
      </div>
  );
  }

  // 7. PANTALLA FINAL (PODIO DE GANADORES)
  if (gameState === 'PODIUM') {
    const isWinner = myRank === 1;
    const isTop3 = myRank <= 3;
    
    return wrap(
      <div className="flex flex-col justify-between items-center min-h-500 bg-white text-slate-800 p-6 font-sans text-center relative overflow-hidden">
        {isWinner && <ConfettiEffect />}
        
        <div className="text-center mt-8 space-y-4 w-full">
          <div className="mb-2">
            <span className="text-[10px] bg-rose-100 border border-rose-250 text-rose-600 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
              Fin del juego
            </span>
          </div>
          <div className="flex justify-center">
            <AvatarSVG type={selectedAvatar} size={96} />
          </div>
          
          <h2 className="text-2xl font-black text-blue-500 uppercase tracking-wider font-mono">
            ¡FIN DE LA BATALLA!
          </h2>
          <p className="text-slate-500 text-xs font-bold max-w-xs mx-auto">
            ¡Has completado el torneo de SPC Battle Arena!
          </p>
        </div>

        <div className="w-full max-w-xs bg-blue-50/40 border-2 border-blue-100 p-6 rounded-3xl shadow-lg mb-6 relative">
          <div className="text-xs text-blue-500 uppercase tracking-widest font-mono font-black">Tu Puntuación Final</div>
          <div className="text-4xl font-black font-mono text-blue-650 mt-2">{myScore} pts</div>
          
          <div className="text-base font-black text-slate-800 mt-2 font-mono uppercase">
            {isTop3 ? `¡${myRank}º Lugar en el Podio! 🏆` : `Terminaste en el lugar #${myRank}`}
          </div>
          
          <p className="text-[10px] text-slate-500 mt-4 font-mono font-bold uppercase tracking-wider">
            {isWinner ? '🏆 ¡Campeón Absoluto de SPC! 🏆' : '¡Excelente entrenamiento de calidad!'}
          </p>
        </div>
      </div>
  );
  }

  return wrap(
    <div className="p-6 text-center text-slate-500 font-mono">
      <HelpCircle className="w-12 h-12 text-slate-300 mx-auto animate-bounce mb-2" />
      <span>Estado desconocido: {gameState}</span>
    </div>
  );
}

// --- ICONOS GEOMÉTRICOS ---
function TriangleIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L2 22h20L12 2z" />
    </svg>
  );
}

function DiamondIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
    </svg>
  );
}

function CircleIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function SquareIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}
