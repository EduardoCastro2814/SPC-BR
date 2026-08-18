import { useState, useEffect, useRef, useCallback } from 'react';
import questionsData from '../data/questions.json';
import { soundManager } from '../services/sound';

const CHANNEL_NAME = 'spc_battle_arena';
const TOTAL_QUESTION_TIME = 20; // 20 segundos por pregunta

export function useGameSync(isHost, customPin = null) {
  // --- ESTADO GENERAL ---
  const [pin, setPin] = useState(customPin || '');
  const [gameState, setGameState] = useState('LOBBY'); // LOBBY, INTRO, QUESTION, REVEAL, LEADERBOARD, PODIUM
  const [players, setPlayers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(TOTAL_QUESTION_TIME);
  const [answers, setAnswers] = useState({}); // { playerId: { optionIndex, isCorrect, points, time } }
  
  // --- ESTADO DE JUGADOR CLIENTE ---
  const [playerId, setPlayerId] = useState(() => 'p_' + Math.random().toString(36).substr(2, 9));
  const [playerName, setPlayerName] = useState('');
  const [joined, setJoined] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [myLastAnswerCorrect, setMyLastAnswerCorrect] = useState(null);
  const [pointsEarnedThisRound, setPointsEarnedThisRound] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [myRank, setMyRank] = useState(1);

  const channelRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const stateRef = useRef({ gameState, players, currentQuestionIndex, answers, pin });

  // Mantener las referencias del estado actualizadas para usarse en callbacks de eventos
  useEffect(() => {
    stateRef.current = { gameState, players, currentQuestionIndex, answers, pin };
  }, [gameState, players, currentQuestionIndex, answers, pin]);

  // Generar PIN aleatorio si es Host y no tiene uno
  useEffect(() => {
    if (isHost && !pin) {
      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
      setPin(randomPin);
    }
  }, [isHost, pin]);

  // --- CONFIGURACIÓN DE BROADCASTCHANNEL ---
  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    const handleMessage = (event) => {
      const { type, payload } = event.data;

      if (isHost) {
        // --- EVENTOS QUE RECIBE EL HOST ---
        if (type === 'PLAYER_JOIN' && payload.pin === stateRef.current.pin) {
          setPlayers((prev) => {
            if (prev.some((p) => p.name.toLowerCase() === payload.name.toLowerCase())) {
              // Nombre ya tomado, enviar error de vuelta
              channel.postMessage({
                type: 'JOIN_ERROR',
                payload: { playerId: payload.playerId, message: 'El nombre ya está en uso' }
              });
              return prev;
            }
            const newPlayer = {
              id: payload.playerId,
              name: payload.name,
              score: 0,
              streak: 0,
              isBot: false,
              lastCorrect: null,
              rank: prev.length + 1
            };
            const updated = [...prev, newPlayer];
            // Confirmar unión al jugador
            channel.postMessage({
              type: 'JOIN_CONFIRM',
              payload: { playerId: payload.playerId, pin: stateRef.current.pin, name: payload.name }
            });
            // Difundir estado actualizado de inmediato
            broadcastHostState(stateRef.current.gameState, updated, stateRef.current.currentQuestionIndex, stateRef.current.timer);
            return updated;
          });
        }

        if (type === 'PLAYER_ANSWER' && payload.pin === stateRef.current.pin) {
          const { playerId, optionIndex, timeTaken, questionIndex } = payload;
          
          if (questionIndex !== stateRef.current.currentQuestionIndex || stateRef.current.gameState !== 'QUESTION') {
            return; // Ignorar respuestas fuera de tiempo o de otras preguntas
          }

          setAnswers((prev) => {
            if (prev[playerId]) return prev; // Ya respondió

            const question = questionsData[questionIndex];
            const isCorrect = optionIndex === question.answer;
            
            // Calcular puntos (Máx 1000: 500 precisión + 500 por velocidad)
            // Velocidad: proporcional al tiempo restante
            const remainingRatio = Math.max(0, Math.min(1, (TOTAL_QUESTION_TIME - timeTaken) / TOTAL_QUESTION_TIME));
            let points = 0;
            if (isCorrect) {
              points = Math.round(500 + 500 * remainingRatio);
            }

            const updatedAnswers = {
              ...prev,
              [playerId]: { optionIndex, isCorrect, points, time: timeTaken }
            };

            // Notificar al jugador específico sobre su resultado de inmediato
            channel.postMessage({
              type: 'ANSWER_ACK',
              payload: { playerId, isCorrect, points, optionIndex }
            });

            // Si todos los jugadores (reales + bots) ya respondieron, revelar respuestas
            const totalActivePlayers = stateRef.current.players.length;
            const answersCount = Object.keys(updatedAnswers).length;
            if (totalActivePlayers > 0 && answersCount >= totalActivePlayers) {
              revealAnswers(updatedAnswers);
            }

            return updatedAnswers;
          });
        }
      } else {
        // --- EVENTOS QUE RECIBE EL JUGADOR ---
        if (type === 'HOST_STATE_UPDATE' && payload.pin === stateRef.current.pin) {
          setGameState(payload.gameState);
          setPlayers(payload.players);
          setCurrentQuestionIndex(payload.currentQuestionIndex);
          setTimer(payload.timer);

          // Actualizar ranking y puntaje local del jugador
          const me = payload.players.find((p) => p.id === playerId);
          if (me) {
            setMyScore(me.score);
            setMyStreak(me.streak);
            setMyRank(me.rank);
          }

          // Si el Host avanza a una nueva pregunta, restablecer estado de respuesta local
          if (payload.gameState === 'QUESTION' || payload.gameState === 'INTRO') {
            setHasAnswered(false);
            setPointsEarnedThisRound(0);
          }
        }

        if (type === 'JOIN_CONFIRM' && payload.playerId === playerId) {
          setPin(payload.pin);
          setJoined(true);
        }

        if (type === 'JOIN_ERROR' && payload.playerId === playerId) {
          alert(payload.message);
          setJoined(false);
        }

        if (type === 'ANSWER_ACK' && payload.playerId === playerId) {
          setHasAnswered(true);
          setMyLastAnswerCorrect(payload.isCorrect);
          setPointsEarnedThisRound(payload.points);
          if (payload.isCorrect) {
            soundManager.playCorrect();
          } else {
            soundManager.playWrong();
          }
        }
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [isHost, playerId, pin]);

  // --- FUNCIÓN PARA DIFUNDIR EL ESTADO DEL HOST ---
  const broadcastHostState = useCallback((gState, pList, qIdx, tVal) => {
    if (channelRef.current && isHost) {
      channelRef.current.postMessage({
        type: 'HOST_STATE_UPDATE',
        payload: {
          pin,
          gameState: gState,
          players: pList,
          currentQuestionIndex: qIdx,
          timer: tVal
        }
      });
    }
  }, [isHost, pin]);

  // --- LÓGICA DEL TEMPORIZADOR DEL HOST ---
  useEffect(() => {
    if (isHost && gameState === 'QUESTION') {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            revealAnswers(stateRef.current.answers);
            return 0;
          }
          // Sonar el tick en los últimos 5 segundos
          if (prev <= 6) {
            soundManager.playTick();
          }
          const nextTimer = prev - 1;
          broadcastHostState(gameState, players, currentQuestionIndex, nextTimer);
          return nextTimer;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isHost, gameState, currentQuestionIndex, players, broadcastHostState]);

  // --- REVELAR RESPUESTAS (HOST) ---
  const revealAnswers = useCallback((currentAnswers) => {
    if (!isHost) return;
    setGameState('REVEAL');
    clearInterval(timerIntervalRef.current);

    // Calcular nuevos puntajes para los jugadores
    setPlayers((prevPlayers) => {
      const updatedPlayers = prevPlayers.map((player) => {
        const answer = currentAnswers[player.id];
        const isCorrect = answer ? answer.isCorrect : false;
        const pts = answer ? answer.points : 0;
        
        let newStreak = isCorrect ? player.streak + 1 : 0;
        // Bono de racha: +100 puntos extras por racha activa de 3 o más
        const streakBonus = newStreak >= 3 ? 100 : 0;

        return {
          ...player,
          score: player.score + pts + streakBonus,
          streak: newStreak,
          lastCorrect: isCorrect
        };
      });

      // Ordenar por puntaje y recalcular rankings
      const sorted = [...updatedPlayers].sort((a, b) => b.score - a.score);
      const ranked = sorted.map((p, idx) => ({ ...p, rank: idx + 1 }));

      broadcastHostState('REVEAL', ranked, stateRef.current.currentQuestionIndex, 0);
      return ranked;
    });
  }, [isHost, broadcastHostState]);

  // --- ACCIONES DEL HOST ---
  const startLobby = useCallback(() => {
    if (!isHost) return;
    setGameState('LOBBY');
    setPlayers([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTimer(TOTAL_QUESTION_TIME);
    soundManager.startLobbyMusic();
    broadcastHostState('LOBBY', [], 0, TOTAL_QUESTION_TIME);
  }, [isHost, broadcastHostState]);

  const addBotPlayer = useCallback((botName) => {
    if (!isHost) return;
    setPlayers((prev) => {
      const botId = 'bot_' + Math.random().toString(36).substr(2, 9);
      const newBot = {
        id: botId,
        name: botName + ' (Bot)',
        score: 0,
        streak: 0,
        isBot: true,
        lastCorrect: null,
        rank: prev.length + 1
      };
      const updated = [...prev, newBot];
      broadcastHostState(stateRef.current.gameState, updated, stateRef.current.currentQuestionIndex, stateRef.current.timer);
      return updated;
    });
  }, [isHost, broadcastHostState]);

  const startQuestion = useCallback(() => {
    if (!isHost) return;
    soundManager.stopLobbyMusic();
    setAnswers({});
    setTimer(TOTAL_QUESTION_TIME);
    setGameState('INTRO'); // Mostrar pantalla de intro de la pregunta primero
    broadcastHostState('INTRO', players, currentQuestionIndex, TOTAL_QUESTION_TIME);

    // Esperar 4 segundos de intro y pasar a la pregunta real
    setTimeout(() => {
      setGameState('QUESTION');
      broadcastHostState('QUESTION', stateRef.current.players, stateRef.current.currentQuestionIndex, TOTAL_QUESTION_TIME);
      
      // Simular respuestas de bots inmediatamente después del cambio a QUESTION
      simulateBotAnswers();
    }, 4000);
  }, [isHost, currentQuestionIndex, players, broadcastHostState]);

  const simulateBotAnswers = () => {
    const activeBots = stateRef.current.players.filter((p) => p.isBot);
    const question = questionsData[stateRef.current.currentQuestionIndex];
    
    activeBots.forEach((bot) => {
      // Simular tiempo de respuesta aleatorio entre 2 y 16 segundos
      const responseDelay = 2000 + Math.random() * 14000;
      
      setTimeout(() => {
        // Verificar si seguimos en modo de juego activo para esta pregunta
        if (stateRef.current.gameState !== 'QUESTION') return;

        // Determinar inteligencia del bot: 75% probabilidad de responder correcto
        const answerCorrectly = Math.random() < 0.75;
        let chosenOptionIndex = 0;
        
        if (answerCorrectly) {
          chosenOptionIndex = question.answer;
        } else {
          // Elegir una incorrecta
          const wrongOptions = [0, 1, 2, 3].filter((idx) => idx !== question.answer);
          chosenOptionIndex = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        }

        const timeTaken = responseDelay / 1000;

        setAnswers((prev) => {
          if (prev[bot.id]) return prev;

          const isCorrect = chosenOptionIndex === question.answer;
          const remainingRatio = Math.max(0, Math.min(1, (TOTAL_QUESTION_TIME - timeTaken) / TOTAL_QUESTION_TIME));
          let points = 0;
          if (isCorrect) {
            points = Math.round(500 + 500 * remainingRatio);
          }

          const updatedAnswers = {
            ...prev,
            [bot.id]: { optionIndex: chosenOptionIndex, isCorrect, points, time: timeTaken }
          };

          // Si todos respondieron
          const totalActivePlayers = stateRef.current.players.length;
          const answersCount = Object.keys(updatedAnswers).length;
          if (totalActivePlayers > 0 && answersCount >= totalActivePlayers) {
            revealAnswers(updatedAnswers);
          }

          return updatedAnswers;
        });
      }, responseDelay);
    });
  };

  const showLeaderboard = useCallback(() => {
    if (!isHost) return;
    setGameState('LEADERBOARD');
    broadcastHostState('LEADERBOARD', players, currentQuestionIndex, 0);
  }, [isHost, players, currentQuestionIndex, broadcastHostState]);

  const nextQuestion = useCallback(() => {
    if (!isHost) return;
    if (currentQuestionIndex + 1 < questionsData.length) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setAnswers({});
      setTimer(TOTAL_QUESTION_TIME);
      setGameState('INTRO');
      broadcastHostState('INTRO', players, nextIdx, TOTAL_QUESTION_TIME);

      setTimeout(() => {
        setGameState('QUESTION');
        broadcastHostState('QUESTION', stateRef.current.players, nextIdx, TOTAL_QUESTION_TIME);
        simulateBotAnswers();
      }, 4000);
    } else {
      setGameState('PODIUM');
      soundManager.playFanfare();
      broadcastHostState('PODIUM', players, currentQuestionIndex, 0);
    }
  }, [isHost, currentQuestionIndex, players, broadcastHostState]);

  const showPodiumScreen = useCallback(() => {
    if (!isHost) return;
    setGameState('PODIUM');
    soundManager.playFanfare();
    broadcastHostState('PODIUM', players, currentQuestionIndex, 0);
  }, [isHost, players, currentQuestionIndex, broadcastHostState]);


  // --- ACCIONES DEL JUGADOR ---
  const joinGame = useCallback((targetPin, name) => {
    if (isHost) return;
    setPin(targetPin);
    setPlayerName(name);
    
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'PLAYER_JOIN',
        payload: {
          pin: targetPin,
          name,
          playerId
        }
      });
    }
  }, [isHost, playerId]);

  const submitAnswer = useCallback((optionIndex) => {
    if (isHost || hasAnswered) return;

    // Calcular el tiempo transcurrido en segundos
    const timeTaken = TOTAL_QUESTION_TIME - timer;

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'PLAYER_ANSWER',
        payload: {
          pin,
          playerId,
          optionIndex,
          timeTaken,
          questionIndex: currentQuestionIndex
        }
      });
    }
    // Autoconfirmación en caso de que juegue en local sin red demorada
    setHasAnswered(true);
  }, [isHost, hasAnswered, pin, playerId, currentQuestionIndex, timer]);

  return {
    // Estado común
    pin,
    gameState,
    players,
    currentQuestionIndex,
    timer,
    answers,

    // Estado del Jugador
    playerId,
    playerName,
    joined,
    hasAnswered,
    myLastAnswerCorrect,
    pointsEarnedThisRound,
    myScore,
    myStreak,
    myRank,

    // Acciones del Host
    startLobby,
    addBotPlayer,
    startQuestion,
    showLeaderboard,
    nextQuestion,
    showPodiumScreen,

    // Acciones del Jugador
    joinGame,
    submitAnswer
  };
}
