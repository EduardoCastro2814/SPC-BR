import React, { useState } from 'react';
import { Award, Zap, ShieldAlert, Cpu, Wrench, Settings, BarChart3, HelpCircle } from 'lucide-react';

export default function PlayerView({ sync }) {
  const {
    pin,
    gameState,
    players,
    currentQuestionIndex,
    timer,
    // Estado individual del jugador
    joined,
    hasAnswered,
    myLastAnswerCorrect,
    pointsEarnedThisRound,
    myScore,
    myStreak,
    myRank,
    // Acciones del jugador
    joinGame,
    submitAnswer
  } = sync;

  const [inputPin, setInputPin] = useState('');
  const [inputName, setInputName] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (!inputPin.trim() || !inputName.trim()) {
      alert('Por favor introduce el PIN del juego y tu Apodo.');
      return;
    }
    joinGame(inputPin.trim(), inputName.trim());
  };

  // Íconos y colores para los 4 botones de respuesta táctil
  const answerButtons = [
    { index: 0, color: 'bg-red-600 hover:bg-red-700 shadow-red-900/50', icon: TriangleIcon, label: 'Triángulo Rojo' },
    { index: 1, color: 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/50', icon: DiamondIcon, label: 'Rombo Azul' },
    { index: 2, color: 'bg-amber-500 hover:bg-amber-600 shadow-amber-900/50', icon: CircleIcon, label: 'Círculo Amarillo' },
    { index: 3, color: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-950/50', icon: SquareIcon, label: 'Cuadrado Verde' }
  ];

  // 1. PANTALLA DE INGRESO (LOGIN)
  if (!joined) {
    return (
      <div className="flex flex-col justify-center items-center min-h-500 bg-gray-950 text-white p-6 font-sans">
        <div className="w-full max-w-sm p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Neon Border Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 animate-pulse" />
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black uppercase tracking-wider text-blue-400 font-mono">
              SPC BATTLE ARENA
            </h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">
              Consola del Jugador
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 font-mono">
                PIN del Juego
              </label>
              <input
                type="text"
                maxLength="4"
                placeholder="Ej. 1234"
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 text-white rounded-lg text-center text-2xl font-black tracking-widest focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 font-mono">
                Tu Apodo
              </label>
              <input
                type="text"
                maxLength="12"
                placeholder="Nombre de Operador"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 text-white rounded-lg text-center text-lg font-bold focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider rounded-lg shadow-lg hover:shadow-blue-500/20 active:scale-95 transition duration-150 font-mono"
            >
              Entrar a la Arena
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
              Flex Manufacturing System v2.0
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. PANTALLA DE LOBBY (ESPERANDO AL INSTRUCTOR)
  if (gameState === 'LOBBY') {
    return (
      <div className="flex flex-col justify-between items-center min-h-500 bg-gray-950 text-white p-6 font-sans">
        <div className="text-center mt-8">
          <div className="inline-flex p-3 bg-blue-950 text-blue-400 rounded-full animate-bounce mb-4 border border-blue-800">
            <Settings className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <h2 className="text-2xl font-bold">¡Estás en la Arena!</h2>
          <p className="text-blue-400 font-mono font-bold mt-1 text-lg">PIN: {pin}</p>
          <p className="text-gray-400 text-sm mt-4 px-6">
            Tu apodo: <strong className="text-white">{playerName}</strong>
          </p>
        </div>

        <div className="w-full max-w-xs p-4 bg-gray-900 border border-gray-800 rounded-xl text-center shadow-lg mb-8">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">Estado</div>
          <div className="text-sm font-bold text-amber-400 animate-pulse mt-1">
            Esperando a que el Instructor inicie...
          </div>
          <div className="mt-3 flex justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping delay-100"></span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping delay-200"></span>
          </div>
        </div>
      </div>
    );
  }

  // 3. PANTALLA DE INTRO DE PREGUNTA ("PREPÁRATE")
  if (gameState === 'INTRO') {
    return (
      <div className="flex flex-col justify-center items-center min-h-500 bg-gray-905 text-white p-6 font-sans text-center">
        <div className="animate-pulse space-y-4">
          <div className="text-xs text-blue-400 font-bold uppercase tracking-widest font-mono">
            Prepárate Operador
          </div>
          <h2 className="text-3xl font-black uppercase font-mono">
            Pregunta {currentQuestionIndex + 1}
          </h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
          <p className="text-sm text-gray-400 mt-2">
            Mira la pantalla del proyector para leer el problema.
          </p>
        </div>
      </div>
    );
  }

  // 4. PANTALLA DE RESPUESTA ACTIVA (PANELES GEOMÉTRICOS)
  if (gameState === 'QUESTION') {
    if (hasAnswered) {
      return (
        <div className="flex flex-col justify-center items-center min-h-500 bg-gray-900 text-white p-6 text-center font-sans">
          <div className="space-y-4">
            <div className="inline-flex p-4 bg-blue-950 text-blue-400 border border-blue-800 rounded-full animate-pulse">
              <Zap className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-xl font-bold uppercase font-mono tracking-wide text-blue-400">
              Respuesta Recibida
            </h2>
            <p className="text-sm text-gray-400">
              ¡Buen trabajo! Esperando a que termine el tiempo...
            </p>
            <div className="text-xs font-mono text-gray-500">
              Tiempo restante en pantalla: {timer}s
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-between min-h-[500px] bg-gray-950 p-4 font-sans text-white">
        {/* Cabecera del jugador */}
        <div className="flex justify-between items-center bg-gray-900 border border-gray-800 px-4 py-2.5 rounded-lg">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-mono">Operador</span>
            <span className="font-bold text-sm block">{playerName}</span>
          </div>
          <div className="flex items-center gap-1 bg-blue-950 border border-blue-800 text-blue-400 px-3 py-1 rounded-full font-mono font-bold text-sm">
            <Zap className="w-4 h-4 fill-current" />
            <span>{timer}s</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-mono">Puntos</span>
            <span className="font-bold text-sm block">{myScore}</span>
          </div>
        </div>

        {/* Panel Táctil de 4 Respuestas */}
        <div className="grid grid-cols-2 gap-4 my-6 flex-1 min-h-300">
          {answerButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.index}
                onClick={() => submitAnswer(btn.index)}
                className={`flex flex-col justify-center items-center ${btn.color} border border-white/10 rounded-2xl shadow-lg active:scale-95 transition-all duration-100 p-6 group relative`}
              >
                <div className="text-white group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-16 h-16 filter drop-shadow-md" />
                </div>
                <span className="text-xs font-bold font-mono tracking-wider opacity-60 uppercase text-white mt-4">
                  Opción {String.fromCharCode(65 + btn.index)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Indicador de Racha */}
        {myStreak > 0 && (
          <div className="text-center py-2 bg-amber-950/40 border border-amber-800/40 text-amber-400 font-bold rounded-lg text-xs font-mono animate-pulse">
            🔥 Racha actual: {myStreak} aciertos consecutivos
          </div>
        )}
      </div>
    );
  }

  // 5. REVELACIÓN DE RESPUESTA (FEEDBACK DE CORRECCIÓN)
  if (gameState === 'REVEAL') {
    const isCorrect = myLastAnswerCorrect;
    
    return (
      <div className={`flex flex-col justify-between items-center min-h-500 p-6 font-sans text-white transition-colors duration-300 ${
        isCorrect ? 'bg-emerald-900 border-t-8 border-emerald-500' : 'bg-rose-900 border-t-8 border-rose-500'
      }`}>
        <div className="text-center mt-12 space-y-4">
          <div className="inline-flex p-5 rounded-full bg-black/25 mb-2 shadow-inner">
            {isCorrect ? (
              <Award className="w-16 h-16 text-emerald-300 animate-bounce" />
            ) : (
              <ShieldAlert className="w-16 h-16 text-rose-300 animate-pulse" />
            )}
          </div>
          <h2 className="text-3xl font-black tracking-wider uppercase font-mono">
            {isCorrect ? '¡CORRECTO!' : '¡INCORRECTO!'}
          </h2>
          <div className="text-sm font-mono opacity-80 uppercase tracking-widest">
            {isCorrect ? `+${pointsEarnedThisRound} PUNTOS` : 'NO TE RINDAS OPERADOR'}
          </div>
        </div>

        <div className="w-full max-w-xs bg-black/20 border border-white/5 p-4 rounded-xl text-center backdrop-blur shadow-lg mb-8">
          <div className="flex justify-between items-center text-sm font-mono border-b border-white/10 pb-2 mb-2">
            <span className="opacity-70">Posición actual:</span>
            <span className="font-bold">{myRank}º lugar</span>
          </div>
          <div className="flex justify-between items-center text-sm font-mono">
            <span className="opacity-70">Puntaje Total:</span>
            <span className="font-bold text-amber-400">{myScore} pts</span>
          </div>
          {isCorrect && myStreak >= 3 && (
            <div className="mt-3 text-xs font-bold text-amber-300 animate-pulse font-mono">
              🔥 ¡Bono de Racha Activo! (+100 pts extra)
            </div>
          )}
        </div>
      </div>
    );
  }

  // 6. TABLA DE POSICIONES INTERMEDIA
  if (gameState === 'LEADERBOARD') {
    return (
      <div className="flex flex-col justify-between items-center min-h-500 bg-gray-900 text-white p-6 font-sans">
        <div className="text-center mt-12 space-y-2">
          <BarChart3 className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold uppercase font-mono tracking-wider">Tabla de Posiciones</h2>
          <p className="text-xs text-gray-400 font-mono">Mira el proyector para ver el Top 5</p>
        </div>

        <div className="w-full max-w-xs bg-gray-950 border border-gray-800 p-5 rounded-2xl text-center shadow-2xl mb-8 relative">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">Tus Estadísticas</div>
          <div className="text-3xl font-black font-mono text-blue-400 mt-2">{myScore} pts</div>
          <div className="text-sm font-bold text-gray-300 mt-1 font-mono">Rango: #{myRank}</div>
          
          <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 font-mono">
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

    return (
      <div className="flex flex-col justify-between items-center min-h-500 bg-gray-950 text-white p-6 font-sans text-center relative overflow-hidden">
        {/* Glow de podio */}
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-300" />
        
        <div className="text-center mt-12 space-y-4">
          <div className="inline-flex p-6 rounded-full bg-amber-950/50 border border-amber-500/30 text-amber-400 mb-2">
            <Award className="w-20 h-20 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-wider font-mono">Fin de la Batalla</h2>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            ¡El torneo de SPC Battle Arena ha finalizado!
          </p>
        </div>

        <div className="w-full max-w-xs bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-2xl mb-8 relative">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">Tu Resultado Final</div>
          <div className="text-4xl font-black font-mono text-yellow-400 mt-2">{myScore} pts</div>
          
          <div className="text-lg font-bold text-white mt-2 font-mono">
            {isTop3 ? `¡${myRank}º Lugar en el Podio!` : `Terminaste en el lugar #${myRank}`}
          </div>
          
          <p className="text-xs text-gray-500 mt-4 font-mono uppercase tracking-wider">
            {isWinner ? '🏆 Campeón Absoluto de SPC 🏆' : '¡Excelente Esfuerzo de Calidad!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-center text-white bg-gray-950 font-mono">
      <HelpCircle className="w-12 h-12 text-gray-500 mx-auto animate-bounce mb-2" />
      <span>Estado desconocido: {gameState}</span>
    </div>
  );
}

// --- ICONOS GEOMÉTRICOS PARA LOS BOTONES TÁCTILES ---
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
