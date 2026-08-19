import React, { useState } from 'react';
import questionsData from '../data/questions.json';
import ControlChartVisualizer from './ControlChartVisualizer';
import { AvatarSVG } from './PlayerView';
import { Users, Play, Plus, ArrowRight, Award, HelpCircle, Volume2, VolumeX, Flame, Trophy } from 'lucide-react';
import DebugLogsDrawer from './DebugLogsDrawer';

export default function HostView({ sync, isMuted, onToggleMute }) {
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const {
    pin,
    gameState,
    players,
    currentQuestionIndex,
    timer,
    answers,
    startLobby,
    addBotPlayer,
    startQuestion,
    showLeaderboard,
    nextQuestion,
    connectionStatus,
    debugLogs,
    clearLogs
  } = sync;

  const currentQuestion = questionsData[currentQuestionIndex];
  const totalQuestions = questionsData.length;

  const wrap = (content) => {
    return (
      <div className="relative flex-1 flex flex-col min-h-500">
        {content}
        
        {/* Floating Debug Status Badge & Debug Log Drawer Button */}
        <div className="absolute bottom-4 left-4 z-40 flex items-center gap-2 pointer-events-auto">
          {connectionStatus === 'connected' ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 border border-green-500 text-green-700 text-[10px] font-mono font-bold rounded-xl shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Supabase Conectado
            </span>
          ) : connectionStatus === 'connecting' ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border border-yellow-500 text-amber-700 text-[10px] font-mono font-bold rounded-xl shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Conectando...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 border border-red-500 text-red-700 text-[10px] font-mono font-bold rounded-xl shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Desconectado
            </span>
          )}
          <button
            onClick={() => setIsLogsOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 font-mono text-[10px] uppercase font-bold rounded-xl shadow-sm flex items-center gap-1 active:scale-95 transition-all"
          >
            🐞 Depurar
          </button>
        </div>

        <DebugLogsDrawer
          logs={debugLogs}
          isOpen={isLogsOpen}
          onClose={() => setIsLogsOpen(false)}
          onClear={clearLogs}
        />
      </div>
    );
  };

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
    const unusedNames = botNames.filter(
      (name) => !players.some((p) => p.name.includes(name))
    );
    const botName = unusedNames.length > 0 
      ? unusedNames[Math.floor(Math.random() * unusedNames.length)]
      : 'Operador_Bot_' + (players.length + 1);
    addBotPlayer(botName);
  };

  const answersCount = Object.keys(answers).length;
  const totalPlayers = players.length;

  // Distribución de respuestas para el gráfico
  const answerDistribution = [0, 0, 0, 0];
  Object.values(answers).forEach((ans) => {
    if (ans.optionIndex >= 0 && ans.optionIndex < 4) {
      answerDistribution[ans.optionIndex]++;
    }
  });

  // Códigos de colores gamificados del juego: A = Azul, B = Verde, C = Amarillo, D = Rojo
  const optionStyles = [
    { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', border: 'border-blue-600', text: 'text-blue-100', icon: TriangleIcon, char: 'A' },
    { bg: 'bg-green-500', hover: 'hover:bg-green-600', border: 'border-green-600', text: 'text-green-100', icon: DiamondIcon, char: 'B' },
    { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', border: 'border-amber-600', text: 'text-amber-100', icon: CircleIcon, char: 'C' },
    { bg: 'bg-red-500', hover: 'hover:bg-red-600', border: 'border-red-650', text: 'text-red-100', icon: SquareIcon, char: 'D' }
  ];

  // Obtener avatar del jugador (sincronizado a través de sessionStorage local)
  const getPlayerAvatar = (name, isBot) => {
    const cleanName = name.replace(' (Bot)', '').trim().toLowerCase();
    const saved = sessionStorage.getItem(`avatar_${cleanName}`);
    if (saved) return saved;
    if (isBot) {
      // Repartir avatares para los bots
      const botAvatars = ['robot', 'chart', 'factory', 'analyst'];
      return botAvatars[name.charCodeAt(0) % 4];
    }
    return 'engineer';
  };

  // Componente de confeti local para el Host
  const HostConfetti = () => {
    const dots = Array.from({ length: 40 });
    const colors = ['#22C55E', '#00AEEF', '#FBBF24', '#EF4444', '#EC4899', '#A855F7'];
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events:none z-0">
        {dots.map((_, i) => (
          <div
            key={i}
            className="confetti-dot"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              animationDelay: `${Math.random() * 2.5}s`,
              animationDuration: `${2.5 + Math.random() * 2}s`,
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`
            }}
          />
        ))}
      </div>
    );
  };

  // 1. PANTALLA DE LOBBY DEL INSTRUCTOR
  if (gameState === 'LOBBY') {
    return wrap(
      <div className="flex flex-col justify-between min-h-500 bg-white text-slate-800 p-6 font-sans relative overflow-hidden">
        {/* Decoraciones de burbujas flotantes de fondo */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-blue-100/40 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-amber-100/30 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 flex justify-between items-center border-b border-blue-50 pb-4">
          <div>
            <h1 className="text-3xl font-black tracking-widest text-blue-500 font-mono flex items-center gap-2">
              🏆 SPC BATTLE ARENA
            </h1>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1 font-bold">
              Sala del Instructor
            </p>
          </div>
          
          <button
            onClick={onToggleMute}
            className="p-3 bg-blue-50 border-2 border-blue-100 hover:bg-blue-100/60 rounded-2xl text-blue-500 transition-colors"
            title={isMuted ? 'Activar Sonido' : 'Mutear'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
          </button>
        </div>

        {/* Panel central del PIN de caricatura */}
        <div className="relative z-10 text-center my-6 max-w-xl mx-auto w-full">
          <div className="bg-blue-50/50 border-3 border-blue-100 p-6 rounded-3xl shadow-lg relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-[10px] uppercase font-mono tracking-widest font-black">
              Unirse al Servidor
            </div>
            
            <p className="text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mt-2">
              Ingresa el siguiente PIN en tu dispositivo:
            </p>
            <div className="text-6xl font-black font-mono tracking-widest text-blue-600 my-3 select-all drop-shadow-[0_4px_10px_rgba(0,174,239,0.15)]">
              {pin}
            </div>
            <p className="text-[11px] text-slate-400 font-mono font-bold">
              Abre la consola de jugador a la derecha o utiliza otra pestaña.
            </p>
          </div>
        </div>

        {/* Listado de jugadores con avatares */}
        <div className="relative z-10 flex-1 my-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Operadores Conectados ({totalPlayers})
            </h3>
            
            <button
              onClick={handleAddBot}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 border-2 border-blue-100 rounded-2xl text-xs font-mono font-black text-blue-500 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Añadir Bot
            </button>
          </div>

          {totalPlayers === 0 ? (
            <div className="h-44 border-3 border-dashed border-blue-100 rounded-3xl flex flex-col justify-center items-center text-slate-400 font-mono p-6 bg-blue-50/10">
              <Users className="w-10 h-10 text-blue-300 animate-bounce mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Esperando competidores...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {players.map((player) => {
                const av = getPlayerAvatar(player.name, player.isBot);
                return (
                  <div
                    key={player.id}
                    className="p-3 bg-white border-2 border-blue-50 rounded-2xl text-center shadow-md animate-fadeIn flex flex-col items-center gap-2 relative hover:scale-105 transition-transform"
                  >
                    <AvatarSVG type={av} size={44} />
                    <span className="font-black text-xs text-slate-800 truncate w-full block">
                      {player.name}
                    </span>
                    {player.isBot && (
                      <span className="text-[8px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-mono uppercase font-black tracking-wide">
                        Bot
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón de Comenzar */}
        <div className="relative z-10 border-t border-blue-50 pt-4 flex justify-between items-center">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
            SPC Battle Arena • Videojuego de Calidad
          </span>
          <button
            onClick={startQuestion}
            disabled={totalPlayers === 0}
            className={`flex items-center gap-2 px-8 py-4 font-black uppercase tracking-wider rounded-2xl shadow-lg font-mono text-sm transition-all active:scale-95 ${
              totalPlayers === 0
                ? 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-green-200 border-b-4 border-green-700'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            Comenzar Partida
          </button>
        </div>
      </div>
  );
  }

  // 2. PANTALLA DE INTRO DE PREGUNTA
  if (gameState === 'INTRO') {
    return wrap(
      <div className="flex flex-col justify-center items-center min-h-500 bg-white text-slate-800 p-8 font-sans text-center relative overflow-hidden">
        {/* Nubes decorativas */}
        <div className="absolute top-10 left-10 w-28 h-10 bg-blue-50 rounded-full blur-sm animate-float" />
        <div className="absolute bottom-10 right-10 w-32 h-12 bg-blue-50 rounded-full blur-sm animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 space-y-6 max-w-xl mx-auto">
          <div className="flex justify-center gap-2">
            <span className="bg-blue-50 border-2 border-blue-100 text-blue-500 px-4 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider">
              {currentQuestion.category}
            </span>
            <span className="bg-yellow-100 border-2 border-yellow-350 text-amber-500 px-4 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider">
              Dificultad: {currentQuestion.difficulty}
            </span>
          </div>

          <div className="text-xs uppercase tracking-widest font-mono text-slate-400 font-bold">
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </div>
          
          <h2 className="text-3xl font-black uppercase font-mono tracking-wide text-slate-800 leading-tight">
            {currentQuestion.mode === 'spc-match' && '🎮 Modo: Emparejar SPC'}
            {currentQuestion.mode === 'chart-detective' && '🔍 Modo: Detective de Gráficos'}
            {currentQuestion.mode === 'problem-solver' && '🧩 Modo: Resolutor de Problemas'}
          </h2>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border-2 border-slate-200">
            <div className="bg-blue-500 h-full animate-progress" />
          </div>
          
          <p className="text-xs text-slate-400 font-bold italic animate-pulse">
            Cargando visualizaciones de control estadístico...
          </p>
        </div>
      </div>
  );
  }

  // 3. PREGUNTA EN CURSO (PANTALLA DE JUEGO)
  if (gameState === 'QUESTION') {
    return wrap(
      <div className="flex flex-col justify-between min-h-500 bg-white text-slate-800 p-6 font-sans">
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b border-blue-50 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black font-mono text-blue-500">
              PREGUNTA {currentQuestionIndex + 1}/{totalQuestions}
            </span>
            <span className="bg-blue-50 border border-blue-100 text-blue-500 px-3 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold">
              {currentQuestion.category}
            </span>
          </div>
          <div className="text-right text-xs font-bold text-slate-400 font-mono">
            PIN: {pin}
          </div>
        </div>

        {/* Título de la pregunta en un Speech Bubble caricaturesco */}
        <div className="my-3 max-w-4xl mx-auto w-full">
          <div className="speech-bubble text-center">
            <h2 className="text-xl sm:text-2xl font-black leading-snug text-slate-800">
              {currentQuestion.question}
            </h2>
          </div>
        </div>

        {/* Panel Central: Reloj y Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center my-2 max-w-5xl mx-auto w-full">
          {/* Reloj de tiempo gigante */}
          <div className="flex flex-col items-center justify-center bg-blue-50/30 border-2 border-blue-100 p-6 rounded-3xl text-center h-full max-w-xs mx-auto w-full shadow-sm">
            <div className={`relative flex justify-center items-center w-28 h-28 rounded-full bg-white border-4 ${
              timer <= 5 ? 'border-red-500 animate-timer-pulse' : 'border-blue-500'
            }`}>
              <div className={`text-5xl font-black font-mono ${timer <= 5 ? 'text-red-500' : 'text-blue-500'}`}>
                {timer}
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-4 font-bold">
              Segundos restantes
            </span>
          </div>

          {/* Gráfico SPC Caricatura */}
          <div className="md:col-span-2 flex justify-center w-full">
            {currentQuestion.chartData ? (
              <ControlChartVisualizer chartConfig={currentQuestion.chartData} />
            ) : (
              <div className="flex flex-col justify-center items-center border-2 border-dashed border-blue-100 bg-blue-50/10 p-8 rounded-3xl text-center w-full max-w-lg h-60 font-mono">
                <HelpCircle className="w-16 h-16 text-blue-300 animate-bounce mb-3" />
                <span className="text-xs text-blue-500 font-black uppercase tracking-widest">
                  Analiza el Problema de Calidad
                </span>
                <span className="text-[10px] text-slate-400 mt-2 font-bold px-4">
                  Lee las opciones de abajo y escoge el gráfico SPC óptimo.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Opciones de respuesta en Rejilla 2x2 estilo Kahoot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {currentQuestion.options.map((option, idx) => {
            const style = optionStyles[idx];
            const Icon = style.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-4 ${style.bg} border-b-4 border-black/20 p-4 rounded-2xl shadow-md text-white`}
              >
                <div className="p-2.5 bg-black/10 text-white rounded-xl">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 font-bold text-sm sm:text-base leading-snug">
                  <span className="font-mono font-black text-white/80 mr-1.5">{style.char})</span>
                  {option}
                </div>
              </div>
            );
          })}
        </div>

        {/* Estado Inferior */}
        <div className="flex justify-between items-center border-t border-blue-50 pt-3 mt-4 text-xs font-mono text-slate-450 font-bold">
          <span>{answersCount} de {totalPlayers} respuestas recibidas</span>
          <span className="uppercase tracking-widest">SPC Battle Arena Game</span>
        </div>
      </div>
  );
  }

  // 4. REVELACIÓN DE RESPUESTA
  if (gameState === 'REVEAL') {
    const correctOptionIdx = currentQuestion.answer;
    
    return wrap(
      <div className="flex flex-col justify-between min-h-500 bg-white text-slate-800 p-6 font-sans relative overflow-hidden">
        <HostConfetti />
        
        {/* Cabecera */}
        <div className="relative z-10 flex justify-between items-center border-b border-blue-50 pb-3">
          <div className="text-xs font-black text-slate-500 font-mono uppercase">
            Pregunta {currentQuestionIndex + 1}/{totalQuestions} • Resultados del Subgrupo
          </div>
          <button
            onClick={onToggleMute}
            className="p-2 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-lg text-blue-500"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative z-10 text-center my-2 max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-slate-650">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Gráfico de barras y explicación en formato lúdico */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch my-2 max-w-5xl mx-auto w-full">
          {/* Gráfico de barras de distribución */}
          <div className="md:col-span-2 bg-blue-50/30 border-2 border-blue-50 p-5 rounded-3xl flex flex-col justify-between shadow-sm">
            <h4 className="text-xs font-black text-blue-500 uppercase tracking-wider font-mono mb-4 text-center">
              Votación de los Operadores
            </h4>
            
            {/* Gráfico de barras */}
            <div className="flex justify-around items-end h-32 px-2 border-b-2 border-blue-100 pb-2">
              {answerDistribution.map((count, idx) => {
                const style = optionStyles[idx];
                const maxCount = Math.max(...answerDistribution, 1);
                const heightPercent = `${(count / maxCount) * 100}%`;
                
                return (
                  <div key={idx} className="flex flex-col items-center w-8 gap-2">
                    <span className="text-[10px] font-mono font-black text-slate-600">{count}</span>
                    <div
                      style={{ height: heightPercent }}
                      className={`w-full ${style.bg} rounded-t-lg transition-all duration-500 min-h-[6px] border-b-2 border-black/20`}
                    />
                    <div className="text-white p-1 rounded-lg bg-black/10">
                      {React.createElement(style.icon, { className: 'w-4 h-4' })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-[10px] text-slate-400 font-mono font-bold text-center mt-3 uppercase">
              Respuestas del subgrupo: {answersCount}
            </div>
          </div>

          {/* Explicación didáctica clara */}
          <div className="md:col-span-3 bg-white border-2 border-blue-100 p-5 rounded-3xl flex flex-col justify-between shadow-md">
            <div>
              <span className="bg-green-100 border border-green-200 text-green-600 px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-black mb-2 inline-block">
                ✓ Solución Correcta
              </span>
              <h3 className="text-base font-black text-green-600 mb-3 font-mono">
                {styleChar(correctOptionIdx)} {currentQuestion.options[correctOptionIdx]}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-bold border-t border-blue-50 pt-3">
                {currentQuestion.explanation}
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 text-blue-600 p-2.5 rounded-2xl text-[10px] font-mono mt-4 font-bold uppercase tracking-wider text-center">
              Categoría: {currentQuestion.category} • Concepto SPC Validado
            </div>
          </div>
        </div>

        {/* Lista de opciones (Correcta resaltada) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {currentQuestion.options.map((option, idx) => {
            const style = optionStyles[idx];
            const isCorrect = idx === correctOptionIdx;
            
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-sm transition-all ${
                  isCorrect
                    ? 'bg-green-500 border-green-500 font-bold text-white shadow-md'
                    : 'bg-slate-50 border-slate-100 opacity-40 text-slate-400 line-through'
                }`}
              >
                <div className={`p-1.5 rounded-lg bg-black/10 text-white`}>
                  {React.createElement(style.icon, { className: 'w-4 h-4' })}
                </div>
                <div className="flex-1 truncate font-mono font-bold">
                  {styleChar(idx)} {option}
                </div>
              </div>
            );
          })}
        </div>

        {/* Acciones */}
        <div className="relative z-10 flex justify-end border-t border-blue-50 pt-3 mt-4">
          <button
            onClick={showLeaderboard}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 text-xs active:scale-95 border-b-4 border-blue-800"
          >
            Ver Tabla de Posiciones
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
  );
  }

  // 5. TABLA DE POSICIONES INTERMEDIA (SCOREBOARD VIDEOJUEGO)
  if (gameState === 'LEADERBOARD') {
    const topPlayers = [...players].sort((a, b) => b.score - a.score).slice(0, 5);
    
    return wrap(
      <div className="flex flex-col justify-between min-h-500 bg-white text-slate-800 p-6 font-sans relative overflow-hidden">
        {/* Nubes y estrellas flotantes de fondo */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-100/30 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-10 left-10 w-28 h-28 bg-blue-100/30 rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 flex justify-between items-center border-b border-blue-50 pb-3">
          <div className="text-xs font-black text-slate-500 font-mono uppercase">
            Pregunta {currentQuestionIndex + 1}/{totalQuestions} • Posiciones de la Arena
          </div>
          <span className="text-xs text-slate-400 font-mono font-bold">PIN: {pin}</span>
        </div>

        <div className="relative z-10 text-center my-3">
          <h2 className="text-2xl font-black uppercase font-mono tracking-wider text-blue-500 flex items-center justify-center gap-2">
            🏆 Marcador General
          </h2>
        </div>

        {/* Clasificación Estilo Scoreboard Mario Party */}
        <div className="relative z-10 max-w-xl mx-auto w-full flex-1 flex flex-col justify-center gap-3">
          {topPlayers.length === 0 ? (
            <div className="text-center text-slate-400 font-mono">Lobby vacío.</div>
          ) : (
            topPlayers.map((player, idx) => {
              // Estilos de medallas
              const medals = [
                { bg: 'bg-amber-100 border-yellow-400 text-yellow-600', badge: '🥇 1º' },
                { bg: 'bg-slate-100 border-slate-350 text-slate-650', badge: '🥈 2º' },
                { bg: 'bg-orange-100 border-orange-300 text-orange-600', badge: '🥉 3º' }
              ];
              const medal = medals[idx] || { bg: 'bg-white border-blue-50 text-slate-600', badge: `${idx + 1}º` };
              const av = getPlayerAvatar(player.name, player.isBot);

              return (
                <div
                  key={player.id}
                  className={`flex justify-between items-center ${medal.bg} border-2 px-5 py-2.5 rounded-2xl shadow-md animate-slideIn`}
                  style={{ animationDelay: `${idx * 0.15}s` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-center font-mono font-black text-base uppercase bg-white/40 px-2 py-0.5 rounded-full">
                      {medal.badge}
                    </span>
                    <AvatarSVG type={av} size={36} />
                    <span className="font-black text-base text-slate-800">{player.name}</span>
                    {player.streak >= 3 && (
                      <span className="text-[9px] font-mono bg-yellow-100 text-amber-500 px-2 py-0.5 rounded-full font-bold animate-bounce flex items-center gap-1 border border-yellow-200">
                        <Flame className="w-3 h-3 fill-current" />
                        Racha: {player.streak}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {player.lastCorrect !== null && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full font-mono uppercase ${
                        player.lastCorrect 
                          ? 'bg-green-100 text-green-600 border border-green-200' 
                          : 'bg-red-100 text-red-600 border border-red-200'
                      }`}>
                        {player.lastCorrect ? 'Acierto' : 'Error'}
                      </span>
                    )}
                    <span className="font-mono font-black text-blue-500 text-base">{player.score} XP</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Botones de acción */}
        <div className="relative z-10 flex justify-between items-center border-t border-blue-50 pt-3 mt-4">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">
            Aprende Jugando SPC
          </span>
          <button
            onClick={nextQuestion}
            className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 text-xs border-b-4 border-blue-800 active:scale-95"
          >
            {currentQuestionIndex + 1 < totalQuestions ? (
              <>
                Siguiente Pregunta
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Finalizar Torneo
                <Award className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
  );
  }

  // 6. PODIO FINAL CON AVATARES FLOAT
  if (gameState === 'PODIUM') {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const first = sorted[0];
    const second = sorted[1];
    const third = sorted[2];

    return wrap(
      <div className="flex flex-col justify-between min-h-500 bg-white text-slate-800 p-6 font-sans relative overflow-hidden">
        <HostConfetti />
        
        <div className="relative z-10 flex justify-between items-center border-b border-blue-50 pb-3">
          <span className="text-xs font-black text-slate-500 font-mono uppercase">Fin del Desafío</span>
          <button
            onClick={startLobby}
            className="text-xs font-mono font-black text-blue-500 hover:underline bg-blue-50 px-3 py-1.5 rounded-full"
          >
            Nueva Partida
          </button>
        </div>

        <div className="relative z-10 text-center my-2 space-y-1">
          <h2 className="text-3xl font-black uppercase tracking-widest font-mono text-yellow-500 drop-shadow-md">
            👑 Podio de Operadores 👑
          </h2>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-widest font-bold">
            Campeonato de Calidad SPC
          </p>
        </div>

        {/* Estructura del Podio de Caricatura 3D */}
        <div className="relative z-10 flex justify-center items-end gap-4 max-w-xl mx-auto w-full h-64 pt-8">
          {/* Segundo Lugar (Izquierda) */}
          {second && (
            <div className="flex flex-col items-center w-28 animate-podiumLeft">
              <div className="mb-2">
                <AvatarSVG type={getPlayerAvatar(second.name, second.isBot)} size={48} />
              </div>
              <div className="text-center font-bold text-xs truncate w-24 mb-1 text-slate-700">
                {second.name}
              </div>
              <div className="text-[10px] font-mono font-black text-slate-500 mb-2">
                {second.score} XP
              </div>
              <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 border-2 border-slate-350 rounded-t-2xl h-24 flex flex-col justify-center items-center shadow-lg relative">
                <span className="font-mono font-black text-3xl text-slate-400">2</span>
              </div>
            </div>
          )}

          {/* Primer Lugar (Centro - Más Alto) */}
          {first && (
            <div className="flex flex-col items-center w-36 animate-podiumCenter">
              <Trophy className="w-10 h-10 text-yellow-400 animate-bounce mb-1" />
              <div className="mb-2">
                <AvatarSVG type={getPlayerAvatar(first.name, first.isBot)} size={60} />
              </div>
              <div className="text-center font-black text-sm truncate w-32 mb-1 text-yellow-600">
                {first.name}
              </div>
              <div className="text-xs font-mono font-black text-yellow-500 mb-2">
                {first.score} XP
              </div>
              <div className="w-full bg-gradient-to-t from-yellow-350 to-yellow-100 border-2 border-yellow-400 rounded-t-3xl h-36 flex flex-col justify-center items-center shadow-xl relative">
                <span className="font-mono font-black text-5xl text-yellow-500">1</span>
              </div>
            </div>
          )}

          {/* Tercer Lugar (Derecha) */}
          {third && (
            <div className="flex flex-col items-center w-24 animate-podiumRight">
              <div className="mb-2">
                <AvatarSVG type={getPlayerAvatar(third.name, third.isBot)} size={40} />
              </div>
              <div className="text-center font-bold text-xs truncate w-20 mb-1 text-orange-600">
                {third.name}
              </div>
              <div className="text-[10px] font-mono font-black text-orange-500 mb-2">
                {third.score} XP
              </div>
              <div className="w-full bg-gradient-to-t from-orange-200 to-orange-100 border-2 border-orange-350 rounded-t-xl h-16 flex flex-col justify-center items-center shadow-md relative">
                <span className="font-mono font-black text-2xl text-orange-400">3</span>
              </div>
            </div>
          )}
        </div>

        {/* Roster de posiciones inferiores */}
        <div className="relative z-10 max-w-sm mx-auto w-full bg-slate-50 border-2 border-blue-50 rounded-3xl p-4 my-3 max-h-32 overflow-y-auto shadow-inner">
          <div className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-black text-center border-b border-blue-50 pb-2 mb-2">
            Clasificación de Operadores
          </div>
          {sorted.slice(3).map((p, idx) => (
            <div key={p.id} className="flex justify-between items-center text-xs font-mono py-1 border-b border-blue-50 last:border-b-0 px-2 text-slate-650">
              <span className="font-bold">#{idx + 4} {p.name}</span>
              <span className="font-black text-blue-500">{p.score} XP</span>
            </div>
          ))}
        </div>

        {/* Reiniciar Partida */}
        <div className="relative z-10 border-t border-blue-50 pt-4 flex justify-center">
          <button
            onClick={startLobby}
            className="flex items-center gap-2 px-10 py-4 bg-yellow-500 hover:bg-yellow-400 text-white font-mono font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-yellow-250 border-b-4 border-yellow-700 active:scale-95"
          >
            Nueva Partida
          </button>
        </div>
      </div>
  );
  }

  return wrap(<div>Estado desconocido: {gameState}</div>);
}

// Retornar letra de opción
function styleChar(idx) {
  return ['A', 'B', 'C', 'D'][idx] + ')';
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
