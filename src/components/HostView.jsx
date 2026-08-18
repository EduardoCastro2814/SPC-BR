import React from 'react';
import questionsData from '../data/questions.json';
import ControlChartVisualizer from './ControlChartVisualizer';
import { Users, Play, Plus, ArrowRight, Award, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../services/sound';

export default function HostView({ sync, isMuted, onToggleMute }) {
  const {
    pin,
    gameState,
    players,
    currentQuestionIndex,
    timer,
    answers,
    // Acciones del Host
    startLobby,
    addBotPlayer,
    startQuestion,
    showLeaderboard,
    nextQuestion
  } = sync;

  const currentQuestion = questionsData[currentQuestionIndex];
  const totalQuestions = questionsData.length;

  const botNames = [
    'Inspector_Rob',
    'Solder_Pro',
    'Press_Master',
    'Gears_Op',
    'Calip_Expert',
    'Circuit_Queen',
    'SPC_Sensei'
  ];

  const handleAddBot = () => {
    // Escoger un nombre de bot que no esté en uso
    const unusedNames = botNames.filter(
      (name) => !players.some((p) => p.name.includes(name))
    );
    const botName = unusedNames.length > 0 
      ? unusedNames[Math.floor(Math.random() * unusedNames.length)]
      : 'Operador_Bot_' + (players.length + 1);
    addBotPlayer(botName);
  };

  // Contar cuántas respuestas se han recibido
  const answersCount = Object.keys(answers).length;
  const totalPlayers = players.length;

  // Calcular la distribución de las respuestas elegidas para el gráfico de barras
  const answerDistribution = [0, 0, 0, 0];
  Object.values(answers).forEach((ans) => {
    if (ans.optionIndex >= 0 && ans.optionIndex < 4) {
      answerDistribution[ans.optionIndex]++;
    }
  });

  // Colores Kahoot para las opciones
  const optionStyles = [
    { bg: 'bg-red-600', hover: 'hover:bg-red-700', border: 'border-red-500', text: 'text-red-200', icon: TriangleIcon },
    { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', border: 'border-blue-500', text: 'text-blue-200', icon: DiamondIcon },
    { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', border: 'border-amber-400', text: 'text-amber-100', icon: CircleIcon },
    { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', border: 'border-emerald-500', text: 'text-emerald-200', icon: SquareIcon }
  ];

  // 1. LOBBY DE INICIO
  if (gameState === 'LOBBY') {
    return (
      <div className="flex flex-col justify-between min-h-500 bg-gray-950 text-white p-6 font-sans relative overflow-hidden">
        {/* Grilla de fondo industrial */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />

        <div className="relative z-10 flex justify-between items-center border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-black tracking-widest text-blue-500 font-mono">
              SPC BATTLE ARENA
            </h1>
            <p className="text-xs text-gray-400 font-mono uppercase tracking-widest mt-1">
              Sala del Instructor
            </p>
          </div>
          
          <button
            onClick={onToggleMute}
            className="p-2.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            title={isMuted ? 'Activar Sonido' : 'Mutear'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
          </button>
        </div>

        {/* Panel Central del PIN */}
        <div className="relative z-10 text-center my-8 max-w-2xl mx-auto space-y-4">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest">
              Entrada al Servidor Local
            </div>
            
            <p className="text-sm text-gray-400 uppercase tracking-widest font-mono">
              Para unirte a la batalla, ingresa el PIN:
            </p>
            <div className="text-6xl font-black font-mono tracking-widest text-blue-400 my-4 select-all drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              {pin}
            </div>
            <p className="text-xs text-gray-500 font-mono">
              Comparte este PIN con los participantes en la red o usa la Consola de la derecha.
            </p>
          </div>
        </div>

        {/* Listado de Jugadores Conectados */}
        <div className="relative z-10 flex-1 my-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Jugadores en la Arena ({totalPlayers})
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={handleAddBot}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg text-xs font-mono font-bold text-blue-400 hover:text-blue-300 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir Bot
              </button>
            </div>
          </div>

          {totalPlayers === 0 ? (
            <div className="h-44 border border-dashed border-gray-800 rounded-2xl flex flex-col justify-center items-center text-gray-600 font-mono p-6">
              <Users className="w-8 h-8 opacity-30 mb-2 animate-bounce" />
              <span className="text-xs text-center">Esperando a que ingresen los competidores...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-center font-bold text-sm text-gray-200 animate-fadeIn relative group overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/50" />
                  <span className="truncate block">{player.name}</span>
                  {player.isBot && (
                    <span className="text-[9px] bg-blue-950 text-blue-400 px-1 rounded absolute right-1.5 bottom-1 font-mono uppercase">
                      Bot
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón de Comenzar */}
        <div className="relative z-10 border-t border-gray-800 pt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500 font-mono">
            SPC Battle Arena v2.0 • Diseñado para Calidad y Manufactura
          </span>
          <button
            onClick={startQuestion}
            disabled={totalPlayers === 0}
            className={`flex items-center gap-2 px-8 py-4 font-black uppercase tracking-wider rounded-xl shadow-lg font-mono transition-all duration-150 active:scale-95 ${
              totalPlayers === 0
                ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            Iniciar Batalla
          </button>
        </div>
      </div>
    );
  }

  // 2. PANTALLA INTRODUCTORIA DE LA PREGUNTA
  if (gameState === 'INTRO') {
    return (
      <div className="flex flex-col justify-center items-center min-h-500 bg-gray-950 text-white p-8 font-sans text-center relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-100" />
        
        <div className="relative z-10 space-y-6 max-w-xl mx-auto">
          <div className="flex justify-center gap-3">
            <span className="bg-blue-950 border border-blue-800 text-blue-400 px-3 py-1 rounded text-xs font-mono uppercase tracking-wider">
              {currentQuestion.category}
            </span>
            <span className="bg-gray-900 border border-gray-800 text-gray-400 px-3 py-1 rounded text-xs font-mono uppercase tracking-wider">
              Dificultad: {currentQuestion.difficulty}
            </span>
          </div>

          <div className="text-xs uppercase tracking-widest font-mono text-gray-500">
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </div>
          
          <h2 className="text-3xl font-black leading-tight uppercase font-mono tracking-wide text-blue-100">
            {currentQuestion.mode === 'spc-match' && 'MODO: Emparejar Escenario SPC'}
            {currentQuestion.mode === 'chart-detective' && 'MODO: Detective del Gráfico'}
            {currentQuestion.mode === 'problem-solver' && 'MODO: Resolutor de Problemas SPC'}
          </h2>

          <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-800">
            <div className="bg-blue-500 h-full animate-progress" />
          </div>
          
          <p className="text-xs text-gray-400 italic">
            Visualizando pregunta en proyector... ¡Prepárate!
          </p>
        </div>
      </div>
    );
  }

  // 3. PREGUNTA EN CURSO (PANTALLA DE JUEGO PRINCIPAL)
  if (gameState === 'QUESTION') {
    return (
      <div className="flex flex-col justify-between min-h-500 bg-gray-950 text-white p-6 font-sans">
        {/* Cabecera superior */}
        <div className="flex justify-between items-center border-b border-gray-900 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold font-mono text-gray-500 uppercase">
              Pregunta {currentQuestionIndex + 1}/{totalQuestions}
            </span>
            <span className="bg-blue-950 border border-blue-900 text-blue-400 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider">
              {currentQuestion.category}
            </span>
          </div>
          <div className="text-right text-xs font-bold text-gray-500 font-mono">
            PIN: {pin}
          </div>
        </div>

        {/* Título de la Pregunta */}
        <div className="text-center my-4">
          <h2 className="text-xl sm:text-2xl font-bold leading-snug px-6 max-w-4xl mx-auto">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Panel Central: Gráficos de Control o Decoración Visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center my-2 max-w-5xl mx-auto w-full">
          {/* Temporizador */}
          <div className="flex flex-col items-center justify-center bg-gray-900/50 border border-gray-800/80 p-6 rounded-2xl text-center h-full max-w-xs mx-auto w-full">
            <div className="relative flex justify-center items-center w-28 h-28">
              <svg className="w-full h-full transform -rotate-95">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="#1f2937"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke={timer <= 5 ? '#ef4444' : '#3b82f6'}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="301.6"
                  strokeDashoffset={301.6 - (301.6 * timer) / TOTAL_QUESTION_TIME}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className={`absolute text-4xl font-black font-mono ${timer <= 5 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                {timer}
              </div>
            </div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-4">
              Segundos restantes
            </span>
          </div>

          {/* Gráfico SPC si es modo Detective o Solver con Gráfico */}
          <div className="md:col-span-2 flex justify-center w-full">
            {currentQuestion.chartData ? (
              <ControlChartVisualizer chartConfig={currentQuestion.chartData} />
            ) : (
              <div className="flex flex-col justify-center items-center border border-gray-900 bg-gray-900/20 p-8 rounded-2xl text-center w-full max-w-lg h-60 font-mono">
                <HelpCircle className="w-16 h-16 text-blue-500/20 animate-bounce mb-3" />
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                  Analiza el Escenario SPC
                </span>
                <span className="text-[10px] text-gray-600 mt-2">
                  Elige la gráfica correcta para este caso de uso.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Panel de Respuestas en Grid 2x2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {currentQuestion.options.map((option, idx) => {
            const style = optionStyles[idx];
            const Icon = style.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-4 ${style.bg} border border-white/5 p-4 rounded-xl shadow-md transition-opacity duration-200`}
              >
                <div className="p-2.5 bg-black/20 text-white rounded-lg">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 font-bold text-sm sm:text-base leading-snug">
                  {option}
                </div>
              </div>
            );
          })}
        </div>

        {/* Estado Inferior */}
        <div className="flex justify-between items-center border-t border-gray-900 pt-4 mt-4 text-xs font-mono text-gray-500">
          <span>{answersCount} de {totalPlayers} respuestas recibidas</span>
          <span className="uppercase tracking-widest">SPC Battle Arena</span>
        </div>
      </div>
    );
  }

  // 4. REVELACIÓN DE RESPUESTA CORRECTA Y DISTRIBUCIÓN
  if (gameState === 'REVEAL') {
    const correctOptionIdx = currentQuestion.answer;
    
    return (
      <div className="flex flex-col justify-between min-h-[500px] bg-gray-950 text-white p-6 font-sans">
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b border-gray-900 pb-3">
          <div className="text-xs font-bold text-gray-500 font-mono uppercase">
            Pregunta {currentQuestionIndex + 1}/{totalQuestions} • Respuestas Reveladas
          </div>
          <button
            onClick={onToggleMute}
            className="p-1 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="text-center my-3">
          <h2 className="text-lg font-bold text-gray-300">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Panel de Gráfico de Respuestas y Explicación */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch my-2 max-w-5xl mx-auto w-full">
          {/* Gráfico de barras de respuestas */}
          <div className="md:col-span-2 bg-gray-900 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono mb-4 text-center">
              Distribución de Respuestas
            </h4>
            
            {/* Gráfico de barras */}
            <div className="flex justify-around items-end h-32 px-2 border-b border-gray-800 pb-2">
              {answerDistribution.map((count, idx) => {
                const style = optionStyles[idx];
                const maxCount = Math.max(...answerDistribution, 1);
                const heightPercent = `${(count / maxCount) * 100}%`;
                
                return (
                  <div key={idx} className="flex flex-col items-center w-8 gap-2">
                    <span className="text-[10px] font-mono font-bold text-gray-400">{count}</span>
                    <div
                      style={{ height: heightPercent }}
                      className={`w-full ${style.bg} rounded-t-sm transition-all duration-500 min-h-[4px]`}
                    />
                    <div className="text-white p-1 rounded bg-black/40">
                      {React.createElement(style.icon, { className: 'w-3.5 h-3.5' })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-[10px] text-gray-500 font-mono text-center mt-3">
              Total de respuestas registradas: {answersCount}
            </div>
          </div>

          {/* Explicación Didáctica */}
          <div className="md:col-span-3 bg-gray-900 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 px-3 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-bold mb-2 inline-block">
                Respuesta Correcta
              </span>
              <h3 className="text-base font-bold text-emerald-400 mb-3">
                {currentQuestion.options[correctOptionIdx]}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans border-t border-gray-800 pt-3">
                {currentQuestion.explanation}
              </p>
            </div>
            
            <div className="bg-blue-950/40 border border-blue-900/40 text-blue-400 p-2.5 rounded-lg text-[10px] font-mono mt-4">
              <strong>Categoría:</strong> {currentQuestion.category} | <strong>Gráficos cubiertos:</strong> X̄-R, X̄-S, I-MR, P, NP, C, U.
            </div>
          </div>
        </div>

        {/* Respuestas marcadas (Correcta vs Incorrectas) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {currentQuestion.options.map((option, idx) => {
            const style = optionStyles[idx];
            const isCorrect = idx === correctOptionIdx;
            
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg border text-sm transition-all ${
                  isCorrect
                    ? 'bg-emerald-900/50 border-emerald-500 font-bold text-emerald-200'
                    : 'bg-gray-900/20 border-gray-850 opacity-40 text-gray-400 line-through'
                }`}
              >
                <div className={`p-1.5 rounded bg-black/20 ${isCorrect ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {React.createElement(style.icon, { className: 'w-4 h-4' })}
                </div>
                <div className="flex-1 truncate">{option}</div>
              </div>
            );
          })}
        </div>

        {/* Acciones */}
        <div className="flex justify-end border-t border-gray-900 pt-4 mt-4">
          <button
            onClick={showLeaderboard}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider rounded-lg shadow-md font-mono text-xs transition-all active:scale-95"
          >
            Ver Tabla de Posiciones
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 5. TABLA DE POSICIONES ANIMADA (LEADERBOARD)
  if (gameState === 'LEADERBOARD') {
    // Filtrar los top 5 mejores jugadores ordenados
    const topPlayers = [...players].sort((a, b) => b.score - a.score).slice(0, 5);
    
    return (
      <div className="flex flex-col justify-between min-h-[500px] bg-gray-950 text-white p-6 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/20 to-transparent" />

        <div className="relative z-10 flex justify-between items-center border-b border-gray-900 pb-3">
          <div className="text-xs font-bold text-gray-500 font-mono uppercase">
            Pregunta {currentQuestionIndex + 1}/{totalQuestions} • Posiciones
          </div>
          <span className="text-xs text-gray-500 font-mono">PIN: {pin}</span>
        </div>

        <div className="relative z-10 text-center my-4">
          <h2 className="text-2xl font-black uppercase font-mono tracking-wider text-blue-400 flex items-center justify-center gap-2">
            <Award className="w-6 h-6" />
            Tabla de Posiciones
          </h2>
        </div>

        {/* Lista de Clasificación */}
        <div className="relative z-10 max-w-xl mx-auto w-full flex-1 flex flex-col justify-center gap-3">
          {topPlayers.length === 0 ? (
            <div className="text-center text-gray-600 font-mono">No hay jugadores registrados.</div>
          ) : (
            topPlayers.map((player, idx) => {
              const colors = [
                'from-yellow-500/20 via-yellow-600/10 to-transparent border-yellow-500',
                'from-gray-400/20 via-gray-500/10 to-transparent border-gray-400',
                'from-amber-600/20 via-amber-700/10 to-transparent border-amber-600',
                'from-gray-800/40 to-transparent border-gray-800',
                'from-gray-850/40 to-transparent border-gray-900'
              ];
              const borderStyle = colors[idx] || 'from-gray-800/40 to-transparent border-gray-800';
              
              return (
                <div
                  key={player.id}
                  className={`flex justify-between items-center bg-gradient-to-r ${borderStyle} border-l-4 px-5 py-3 rounded-xl shadow-lg animate-slideIn`}
                  style={{ animationDelay: `${idx * 0.15}s` }}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-center font-mono font-black text-lg text-gray-400">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-base">{player.name}</span>
                    {player.streak >= 3 && (
                      <span className="text-[10px] font-mono bg-amber-950 text-amber-400 px-2 py-0.5 rounded-full font-bold animate-pulse flex items-center gap-1 border border-amber-800/30">
                        🔥 Racha: {player.streak}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {player.lastCorrect !== null && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        player.lastCorrect ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950 text-rose-400 border border-rose-900/30'
                      }`}>
                        {player.lastCorrect ? '✓ Correcto' : '✗ Incorrecto'}
                      </span>
                    )}
                    <span className="font-mono font-black text-blue-400">{player.score} pts</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Acciones */}
        <div className="relative z-10 flex justify-between items-center border-t border-gray-900 pt-4 mt-4">
          <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
            Asegura el centrado del proceso
          </span>
          <button
            onClick={nextQuestion}
            className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider rounded-xl shadow-lg font-mono text-xs transition-all active:scale-95"
          >
            {currentQuestionIndex + 1 < totalQuestions ? (
              <>
                Siguiente Pregunta
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Finalizar y Ver Podio
                <Award className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 6. PODIO FINAL
  if (gameState === 'PODIUM') {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const first = sorted[0];
    const second = sorted[1];
    const third = sorted[2];

    return (
      <div className="flex flex-col justify-between min-h-500 bg-gray-950 text-white p-6 font-sans relative overflow-hidden">
        {/* Glow triunfal */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(234,179,8,0.06),transparent_60%)] animate-pulse" />
        
        <div className="relative z-10 flex justify-between items-center border-b border-gray-900 pb-3">
          <span className="text-xs font-bold text-gray-500 font-mono uppercase">Fin de la Partida</span>
          <button
            onClick={startLobby}
            className="text-xs font-mono font-bold text-blue-400 hover:underline"
          >
            Nueva Partida
          </button>
        </div>

        {/* Título de ganadores */}
        <div className="relative z-10 text-center my-2 space-y-1">
          <h2 className="text-3xl font-black uppercase tracking-widest font-mono text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.2)]">
            🏆 Podio SPC 🏆
          </h2>
          <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">
            Control de Calidad Sobresaliente
          </p>
        </div>

        {/* Estructura 3D del Podio */}
        <div className="relative z-10 flex justify-center items-end gap-3 max-w-xl mx-auto w-full h-64 pt-8">
          {/* Segundo Lugar (Izquierda) */}
          {second && (
            <div className="flex flex-col items-center w-28 group animate-podiumLeft">
              <div className="text-center font-bold text-xs truncate w-24 mb-1.5 text-gray-300">
                {second.name}
              </div>
              <div className="text-[10px] font-mono font-black text-gray-400 mb-2">
                {second.score} pts
              </div>
              <div className="w-full bg-gradient-to-t from-gray-700/50 to-gray-600/80 border border-gray-500 rounded-t-xl h-24 flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-400" />
                <span className="font-mono font-black text-2xl text-gray-300">2</span>
              </div>
            </div>
          )}

          {/* Primer Lugar (Centro - Más Alto) */}
          {first && (
            <div className="flex flex-col items-center w-36 group animate-podiumCenter">
              <Award className="w-8 h-8 text-yellow-400 animate-bounce mb-1" />
              <div className="text-center font-black text-sm truncate w-32 mb-1.5 text-yellow-300">
                {first.name}
              </div>
              <div className="text-xs font-mono font-black text-yellow-400 mb-2">
                {first.score} pts
              </div>
              <div className="w-full bg-gradient-to-t from-yellow-600/50 to-yellow-500/80 border border-yellow-400 rounded-t-2xl h-36 flex flex-col justify-center items-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />
                <span className="font-mono font-black text-4xl text-yellow-300">1</span>
              </div>
            </div>
          )}

          {/* Tercer Lugar (Derecha) */}
          {third && (
            <div className="flex flex-col items-center w-24 group animate-podiumRight">
              <div className="text-center font-bold text-xs truncate w-20 mb-1.5 text-amber-500">
                {third.name}
              </div>
              <div className="text-[10px] font-mono font-black text-amber-500 mb-2">
                {third.score} pts
              </div>
              <div className="w-full bg-gradient-to-t from-amber-800/40 to-amber-700/70 border border-amber-600 rounded-t-lg h-16 flex flex-col justify-center items-center shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500" />
                <span className="font-mono font-black text-xl text-amber-600">3</span>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de clasificación inferior para el resto */}
        <div className="relative z-10 max-w-sm mx-auto w-full bg-gray-900/60 border border-gray-800 rounded-2xl p-4 my-4 max-h-36 overflow-y-auto shadow-inner">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono text-center border-b border-gray-800 pb-2 mb-2">
            Clasificación de Operadores
          </div>
          {sorted.slice(3).map((p, idx) => (
            <div key={p.id} className="flex justify-between items-center text-xs font-mono py-1 border-b border-gray-800 last:border-b-0 px-2 text-gray-300">
              <span>#{idx + 4} {p.name}</span>
              <span className="font-bold">{p.score} pts</span>
            </div>
          ))}
        </div>

        {/* Botón Nueva Partida */}
        <div className="relative z-10 border-t border-gray-900 pt-4 flex justify-center">
          <button
            onClick={startLobby}
            className="flex items-center gap-2 px-10 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-wider rounded-xl shadow-lg shadow-yellow-500/10 font-mono text-sm active:scale-95 transition-all"
          >
            Nueva Partida
          </button>
        </div>
      </div>
    );
  }

  return <div>Estado desconocido: {gameState}</div>;
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
