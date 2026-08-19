import { useState, useEffect, useRef, useCallback } from 'react';
import questionsData from '../data/questions.json';
import { soundManager } from '../services/sound';
import { supabase, isSupabaseConfigured } from '../services/supabase';

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
  const [playerId] = useState(() => {
    let id = localStorage.getItem('spc_player_id');
    if (!id) {
      id = 'p_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('spc_player_id', id);
    }
    return id;
  });
  const [playerName, setPlayerName] = useState('');
  const [joined, setJoined] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [myLastAnswerCorrect, setMyLastAnswerCorrect] = useState(null);
  const [pointsEarnedThisRound, setPointsEarnedThisRound] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [myRank, setMyRank] = useState(1);

  // --- ESTADO DE CONEXIÓN Y DEPURACIÓN ---
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [debugLogs, setDebugLogs] = useState([]);
  const [joinError, setJoinError] = useState('');

  // --- REFERENCIAS PARA HACER SEGUIMIENTO DE VARIABLES DENTRO DE LISTENERS ---
  const gameIdRef = useRef(null);
  const stateRef = useRef({ gameState, players, currentQuestionIndex, answers, pin });
  const hostTimerTimeoutRef = useRef(null);

  // Guardar logs de depuración
  const addLog = useCallback((message) => {
    const time = new Date().toLocaleTimeString();
    const logMsg = `[${time}] ${message}`;
    setDebugLogs((prev) => [logMsg, ...prev].slice(0, 50));
    console.log(`[GameSync] ${message}`);
  }, []);

  // Mantener las referencias del estado actualizadas para usarse en callbacks de eventos
  useEffect(() => {
    stateRef.current = { gameState, players, currentQuestionIndex, answers, pin };
  }, [gameState, players, currentQuestionIndex, answers, pin]);

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (hostTimerTimeoutRef.current) clearTimeout(hostTimerTimeoutRef.current);
    };
  }, []);

  // --- MONITOREAR CONEXIÓN SUPABASE ---
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setConnectionStatus('disconnected');
      addLog('[ERROR] Supabase no configurado.');
      return;
    }

    setConnectionStatus('connecting');
    addLog('[SYSTEM] Conectando a Supabase...');
    
    // Verificar conectividad simple
    supabase.from('games').select('count', { count: 'exact', head: true })
      .then(({ error }) => {
        if (error) {
          setConnectionStatus('disconnected');
          addLog(`[ERROR] Error de conexión: ${error.message}`);
        } else {
          setConnectionStatus('connected');
          addLog('[SYSTEM] Conexión establecida con Supabase.');
        }
      });
  }, [addLog]);

  // --- ESCUCHA DEL TEMPORIZADOR LOCAL SEGÚN TIMESTAMP DE PREGUNTA ---
  const [questionStartedAt, setQuestionStartedAt] = useState(null);

  useEffect(() => {
    if (gameState !== 'QUESTION' || !questionStartedAt) {
      setTimer(TOTAL_QUESTION_TIME);
      return;
    }

    const startTime = new Date(questionStartedAt).getTime();
    addLog(`[TIMER] Temporizador iniciado desde: ${new Date(questionStartedAt).toLocaleTimeString()}`);

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, TOTAL_QUESTION_TIME - elapsed);
      setTimer(remaining);

      // Play tick sounds in final 5 seconds
      if (remaining > 0 && remaining <= 5) {
        soundManager.playTick();
      }

      if (remaining <= 0) {
        clearInterval(interval);
        addLog('[TIMER] Tiempo agotado.');
        if (isHost) {
          revealAnswers(stateRef.current.answers);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, questionStartedAt, isHost, addLog]);

  // --- RECONECTAR AL CARGAR (JUGADOR O HOST) ---
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const resumeSession = async () => {
      if (isHost) {
        const savedGameId = sessionStorage.getItem('spc_host_game_id');
        if (savedGameId) {
          addLog(`[HOST] Intentando reanudar partida guardada: ${savedGameId}`);
          const { data: game, error } = await supabase.from('games').select('*').eq('id', savedGameId).maybeSingle();
          if (game && !error) {
            gameIdRef.current = game.id;
            setPin(game.pin);
            setGameState(game.game_state);
            setCurrentQuestionIndex(game.current_question_index);
            setQuestionStartedAt(game.question_started_at);
            
            // Cargar jugadores
            const { data: pList } = await supabase.from('players').select('*').eq('game_id', game.id);
            if (pList) setPlayers(pList);

            // Cargar respuestas si estamos en pregunta/revelación
            if (game.game_state === 'QUESTION' || game.game_state === 'REVEAL') {
              const { data: aList } = await supabase.from('answers').select('*').eq('game_id', game.id).eq('question_index', game.current_question_index);
              if (aList) {
                const map = {};
                aList.forEach((ans) => {
                  map[ans.player_id] = {
                    optionIndex: ans.option_index,
                    isCorrect: ans.is_correct,
                    points: ans.points,
                    time: ans.time_taken
                  };
                });
                setAnswers(map);
              }
            }

            addLog(`[HOST] Partida reanudada exitosamente. PIN: ${game.pin}`);
            subscribeHostEvents(game.id);
          } else {
            sessionStorage.removeItem('spc_host_game_id');
          }
        }
      } else {
        const savedPlayerGameId = sessionStorage.getItem('spc_player_game_id');
        const savedPlayerName = sessionStorage.getItem('spc_player_name');
        
        if (savedPlayerGameId && savedPlayerName) {
          addLog(`[PLAYER] Intentando reanudar conexión a partida: ${savedPlayerGameId}`);
          const { data: game, error } = await supabase.from('games').select('*').eq('id', savedPlayerGameId).maybeSingle();
          if (game && !error) {
            // Verificar si el jugador existe en la base de datos
            const { data: player } = await supabase.from('players').select('*').eq('id', playerId).eq('game_id', game.id).maybeSingle();
            if (player) {
              gameIdRef.current = game.id;
              setPin(game.pin);
              setGameState(game.game_state);
              setCurrentQuestionIndex(game.current_question_index);
              setQuestionStartedAt(game.question_started_at);
              setPlayerName(player.name);
              setJoined(true);
              setMyScore(player.score);
              setMyStreak(player.streak);
              setMyRank(player.rank);

              // Cargar todas las respuestas de la pregunta actual para ver si ya respondimos
              const { data: myAns } = await supabase.from('answers')
                .select('*')
                .eq('game_id', game.id)
                .eq('player_id', playerId)
                .eq('question_index', game.current_question_index)
                .maybeSingle();

              if (myAns) {
                setHasAnswered(true);
                setMyLastAnswerCorrect(myAns.is_correct);
                setPointsEarnedThisRound(myAns.points);
              }

              addLog(`[PLAYER] Conexión reanudada como ${player.name} en el PIN ${game.pin}`);
              subscribePlayerEvents(game.id);
            }
          }
        }
      }
    };

    resumeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, playerId, addLog]);

  // --- LÓGICA DE SUSCRIPCIONES (HOST) ---
  const subscribeHostEvents = (gId) => {
    addLog('[HOST] Configurando suscripciones de Base de Datos...');

    // Escuchar tabla de jugadores conectándose o actualizando estado
    const playersChannel = supabase.channel(`host_players_${gId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `game_id=eq.${gId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          addLog(`[HOST] Jugador conectado: ${payload.new.name}`);
          setPlayers((prev) => {
            if (prev.some((p) => p.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        } else if (payload.eventType === 'UPDATE') {
          setPlayers((prev) => prev.map((p) => p.id === payload.new.id ? payload.new : p));
        } else if (payload.eventType === 'DELETE') {
          setPlayers((prev) => prev.filter((p) => p.id === payload.old.id));
        }
      })
      .subscribe((status) => {
        addLog(`[HOST] Canal de jugadores: ${status}`);
      });

    // Escuchar respuestas de jugadores
    const answersChannel = supabase.channel(`host_answers_${gId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'answers',
        filter: `game_id=eq.${gId}`
      }, (payload) => {
        const newAns = payload.new;
        addLog(`[HOST] Respuesta recibida de: ${newAns.player_id} (Pregunta: ${newAns.question_index})`);

        // Ignorar si es de otra pregunta
        if (newAns.question_index !== stateRef.current.currentQuestionIndex) return;

        setAnswers((prev) => {
          if (prev[newAns.player_id]) return prev; // Ya contestó

          const updated = {
            ...prev,
            [newAns.player_id]: {
              optionIndex: newAns.option_index,
              isCorrect: newAns.is_correct,
              points: newAns.points,
              time: newAns.time_taken
            }
          };

          // Si todos los jugadores (bots + reales) han respondido, revelar de inmediato
          const activePlayers = stateRef.current.players;
          const answersCount = Object.keys(updated).length;
          
          if (activePlayers.length > 0 && answersCount >= activePlayers.length && stateRef.current.gameState === 'QUESTION') {
            addLog('[HOST] Todos los jugadores han respondido. Revelando resultados...');
            revealAnswers(updated);
          }

          return updated;
        });
      })
      .subscribe((status) => {
        addLog(`[HOST] Canal de respuestas: ${status}`);
      });

    // Limpieza de canales al desmontar o resetear
    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(answersChannel);
    };
  };

  // --- LÓGICA DE SUSCRIPCIONES (JUGADOR) ---
  const subscribePlayerEvents = (gId) => {
    addLog('[PLAYER] Configurando suscripciones al servidor...');

    // Escuchar cambios en la partida activa
    const gameChannel = supabase.channel(`player_game_${gId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gId}`
      }, (payload) => {
        const updatedGame = payload.new;
        addLog(`[PLAYER] Cambio de estado de la partida: ${updatedGame.game_state}`);
        
        setGameState(updatedGame.game_state);
        setCurrentQuestionIndex(updatedGame.current_question_index);
        setQuestionStartedAt(updatedGame.question_started_at);

        // Si es una nueva pregunta, restablecer estados locales del jugador
        if (updatedGame.game_state === 'QUESTION' || updatedGame.game_state === 'INTRO') {
          setHasAnswered(false);
          setPointsEarnedThisRound(0);
          setMyLastAnswerCorrect(null);
        }
      })
      .subscribe((status) => {
        addLog(`[PLAYER] Canal de partida: ${status}`);
      });

    // Escuchar cambios en el ranking y puntaje general de la partida
    const playersChannel = supabase.channel(`player_players_${gId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `game_id=eq.${gId}`
      }, () => {
        // Cargar todo el listado para sincronizar posiciones
        supabase.from('players').select('*').eq('game_id', gId)
          .then(({ data }) => {
            if (data) {
              setPlayers(data);
              // Buscar mi propio jugador para actualizar mi UI local
              const me = data.find((p) => p.id === playerId);
              if (me) {
                setMyScore(me.score);
                setMyStreak(me.streak);
                setMyRank(me.rank);
              }
            }
          });
      })
      .subscribe((status) => {
        addLog(`[PLAYER] Canal de competidores: ${status}`);
      });

    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(playersChannel);
    };
  };

  // --- REVELAR RESPUESTAS (HOST) ---
  const revealAnswers = useCallback(async (currentAnswers) => {
    if (!isHost || !gameIdRef.current) return;
    addLog('[HOST] Revelando respuestas y computando puntajes...');

    setGameState('REVEAL');

    // 1. Actualizar estado de la partida en DB
    const { error: gError } = await supabase.from('games')
      .update({ game_state: 'REVEAL' })
      .eq('id', gameIdRef.current);
    
    if (gError) {
      addLog(`[ERROR] Error al cambiar estado a REVEAL: ${gError.message}`);
    }

    // 2. Calcular nuevos puntajes
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
          last_correct: isCorrect
        };
      });

      // Ordenar por puntaje y recalcular rankings
      const sorted = [...updatedPlayers].sort((a, b) => b.score - a.score);
      const ranked = sorted.map((p, idx) => ({ ...p, rank: idx + 1 }));

      // 3. Subir de golpe a Supabase todos los jugadores actualizados (Upsert masivo)
      supabase.from('players').upsert(ranked)
        .then(({ error }) => {
          if (error) {
            addLog(`[ERROR] Error al subir rankings: ${error.message}`);
          } else {
            addLog('[HOST] Rankings subidos a la base de datos correctamente.');
          }
        });

      return ranked;
    });
  }, [isHost, addLog]);

  // --- ACCIONES DEL INSTRUCTOR (HOST) ---
  const startLobby = useCallback(async () => {
    if (!isHost) return;
    addLog('[HOST] Creando nueva sesión de juego...');

    soundManager.startLobbyMusic();

    // Generar PIN de 6 dígitos
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    
    setPin(newPin);
    setGameState('LOBBY');
    setPlayers([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTimer(TOTAL_QUESTION_TIME);
    setQuestionStartedAt(null);

    // Si ya había una partida previa en esta pestaña, limpiarla para no dejar basura
    const oldGameId = sessionStorage.getItem('spc_host_game_id');
    if (oldGameId) {
      await supabase.from('games').delete().eq('id', oldGameId);
    }

    // Insertar nueva partida en Supabase
    const { data: newGame, error } = await supabase.from('games')
      .insert({
        pin: newPin,
        game_state: 'LOBBY',
        current_question_index: 0
      })
      .select()
      .single();

    if (error) {
      addLog(`[ERROR] Error al crear la partida en DB: ${error.message}`);
      alert('Error al crear la sesión en el servidor. Revisa tus logs.');
      return;
    }

    gameIdRef.current = newGame.id;
    sessionStorage.setItem('spc_host_game_id', newGame.id);
    addLog(`[HOST] Partida creada en el servidor. ID: ${newGame.id}, PIN: ${newPin}`);

    // Configurar suscripciones
    subscribeHostEvents(newGame.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, addLog]);

  const addBotPlayer = useCallback(async (botName) => {
    if (!isHost || !gameIdRef.current) return;
    
    const botId = 'bot_' + Math.random().toString(36).substr(2, 9);
    const newBot = {
      id: botId,
      game_id: gameIdRef.current,
      name: botName + ' (Bot)',
      score: 0,
      streak: 0,
      is_bot: true,
      last_correct: null,
      rank: stateRef.current.players.length + 1,
      avatar: 'robot'
    };

    addLog(`[HOST] Insertando Bot en la base de datos: ${newBot.name}`);
    const { error } = await supabase.from('players').insert(newBot);
    
    if (error) {
      addLog(`[ERROR] Error al insertar Bot en DB: ${error.message}`);
    }
  }, [isHost, addLog]);

  const startQuestion = useCallback(async () => {
    if (!isHost || !gameIdRef.current) return;
    addLog(`[HOST] Iniciando pregunta #${stateRef.current.currentQuestionIndex + 1}`);

    soundManager.stopLobbyMusic();
    setAnswers({});
    setTimer(TOTAL_QUESTION_TIME);
    setGameState('INTRO');

    // 1. Limpiar respuestas de la ronda anterior en DB y poner estado en INTRO
    await supabase.from('answers').delete().eq('game_id', gameIdRef.current);
    
    const { error } = await supabase.from('games')
      .update({
        game_state: 'INTRO',
        current_question_index: stateRef.current.currentQuestionIndex,
        question_started_at: null
      })
      .eq('id', gameIdRef.current);

    if (error) {
      addLog(`[ERROR] Error al iniciar INTRO en DB: ${error.message}`);
    }

    // 2. Esperar 4 segundos del banner de INTRO y pasar a QUESTION
    if (hostTimerTimeoutRef.current) clearTimeout(hostTimerTimeoutRef.current);
    
    hostTimerTimeoutRef.current = setTimeout(async () => {
      const startedTime = new Date().toISOString();
      setQuestionStartedAt(startedTime);
      setGameState('QUESTION');
      
      addLog(`[HOST] Cambiando estado a QUESTION. Temporizador corriendo.`);
      const { error: qError } = await supabase.from('games')
        .update({
          game_state: 'QUESTION',
          question_started_at: startedTime
        })
        .eq('id', gameIdRef.current);

      if (qError) {
        addLog(`[ERROR] Error al iniciar QUESTION en DB: ${qError.message}`);
      }

      // Simular respuestas de los bots
      simulateBotAnswers();
    }, 4000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, addLog]);

  // Simulación de Respuestas de Bots (Se ejecuta del lado del Host)
  const simulateBotAnswers = () => {
    const activeBots = stateRef.current.players.filter((p) => p.is_bot);
    const question = questionsData[stateRef.current.currentQuestionIndex];
    
    addLog(`[BOTS] Simulando respuestas para ${activeBots.length} bots...`);

    activeBots.forEach((bot) => {
      // Retardo aleatorio de respuesta entre 2 y 16 segundos
      const responseDelay = 2000 + Math.random() * 14000;
      
      setTimeout(async () => {
        // Validar que seguimos en la pregunta activa
        if (stateRef.current.gameState !== 'QUESTION') return;

        const timeTaken = responseDelay / 1000;
        const answerCorrectly = Math.random() < 0.75; // 75% precisión
        let chosenOptionIndex = 0;
        
        if (answerCorrectly) {
          chosenOptionIndex = question.answer;
        } else {
          const wrongOptions = [0, 1, 2, 3].filter((idx) => idx !== question.answer);
          chosenOptionIndex = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        }

        const isCorrect = chosenOptionIndex === question.answer;
        const remainingRatio = Math.max(0, Math.min(1, (TOTAL_QUESTION_TIME - timeTaken) / TOTAL_QUESTION_TIME));
        let points = 0;
        if (isCorrect) {
          points = Math.round(500 + 500 * remainingRatio);
        }

        const botAnswer = {
          game_id: gameIdRef.current,
          player_id: bot.id,
          question_index: stateRef.current.currentQuestionIndex,
          option_index: chosenOptionIndex,
          time_taken: timeTaken,
          is_correct: isCorrect,
          points: points
        };

        // Insertar respuesta del bot en DB
        supabase.from('answers').insert(botAnswer)
          .then(({ error }) => {
            if (error) {
              addLog(`[ERROR] Error al registrar respuesta del bot: ${error.message}`);
            }
          });

      }, responseDelay);
    });
  };

  const showLeaderboard = useCallback(async () => {
    if (!isHost || !gameIdRef.current) return;
    addLog('[HOST] Cambiando estado a LEADERBOARD');

    setGameState('LEADERBOARD');
    const { error } = await supabase.from('games')
      .update({ game_state: 'LEADERBOARD' })
      .eq('id', gameIdRef.current);
    
    if (error) {
      addLog(`[ERROR] Error al actualizar a LEADERBOARD en DB: ${error.message}`);
    }
  }, [isHost, addLog]);

  const nextQuestion = useCallback(async () => {
    if (!isHost || !gameIdRef.current) return;

    if (currentQuestionIndex + 1 < questionsData.length) {
      const nextIdx = currentQuestionIndex + 1;
      addLog(`[HOST] Avanzando a la pregunta #${nextIdx + 1}`);

      setCurrentQuestionIndex(nextIdx);
      setAnswers({});
      setTimer(TOTAL_QUESTION_TIME);
      setGameState('INTRO');
      setQuestionStartedAt(null);

      // Limpiar respuestas antiguas e iniciar intro en DB
      await supabase.from('answers').delete().eq('game_id', gameIdRef.current);
      
      const { error } = await supabase.from('games')
        .update({
          game_state: 'INTRO',
          current_question_index: nextIdx,
          question_started_at: null
        })
        .eq('id', gameIdRef.current);

      if (error) {
        addLog(`[ERROR] Error al cambiar a INTRO en DB: ${error.message}`);
      }

      // Esperar 4 segundos de intro y pasar a la pregunta real
      if (hostTimerTimeoutRef.current) clearTimeout(hostTimerTimeoutRef.current);

      hostTimerTimeoutRef.current = setTimeout(async () => {
        const startedTime = new Date().toISOString();
        setQuestionStartedAt(startedTime);
        setGameState('QUESTION');
        
        addLog(`[HOST] Pregunta #${nextIdx + 1} activa. Temporizador corriendo.`);
        const { error: qError } = await supabase.from('games')
          .update({
            game_state: 'QUESTION',
            question_started_at: startedTime
          })
          .eq('id', gameIdRef.current);

        if (qError) {
          addLog(`[ERROR] Error al iniciar QUESTION en DB: ${qError.message}`);
        }

        simulateBotAnswers();
      }, 4000);
      
    } else {
      addLog('[HOST] Fin del cuestionario. Mostrando PODIUM.');
      setGameState('PODIUM');
      soundManager.playFanfare();
      
      const { error } = await supabase.from('games')
        .update({ game_state: 'PODIUM' })
        .eq('id', gameIdRef.current);

      if (error) {
        addLog(`[ERROR] Error al cambiar a PODIUM en DB: ${error.message}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, currentQuestionIndex, addLog]);

  const showPodiumScreen = useCallback(async () => {
    if (!isHost || !gameIdRef.current) return;
    addLog('[HOST] Redirigiendo a pantalla de PODIUM');

    setGameState('PODIUM');
    soundManager.playFanfare();

    const { error } = await supabase.from('games')
      .update({ game_state: 'PODIUM' })
      .eq('id', gameIdRef.current);

    if (error) {
      addLog(`[ERROR] Error al cambiar a PODIUM en DB: ${error.message}`);
    }
  }, [isHost, addLog]);

  const joinGame = useCallback(async (targetPin, name) => {
    if (isHost) return;
    setJoinError('');
    addLog(`[PLAYER] Buscando partida con PIN: ${targetPin}...`);
    console.log("[GameSync] Game lookup - Buscando partida con PIN:", targetPin);

    // 1. Validar si la partida existe
    const { data: game, error } = await supabase.from('games')
      .select('*')
      .eq('pin', targetPin)
      .maybeSingle();

    if (error) {
      addLog(`[ERROR] Error al buscar partida en DB: ${error.message}`);
      console.error("[GameSync] Error en lookup de partida:", error.message);
      setJoinError('Error al buscar partida en el servidor.');
      alert(`Error al buscar la partida en el servidor.\n\n` +
            `Table: games\n\n` +
            `Payload:\n{\n  pin: "${targetPin}"\n}\n\n` +
            `Error:\n${error.message}`);
      return;
    }

    if (!game) {
      addLog(`[ERROR] No se encontró la partida con PIN: ${targetPin}`);
      console.log("[GameSync] Partida no encontrada con PIN:", targetPin);
      setJoinError('No existe una partida con ese PIN.');
      alert('No se encontró ninguna partida con ese PIN. Verifica el código e intenta de nuevo.');
      return;
    }

    if (game.game_state !== 'LOBBY') {
      addLog(`[WARN] La partida con PIN ${targetPin} ya comenzó (Estado: ${game.game_state})`);
      setJoinError('La partida ya ha comenzado.');
      alert('La partida ya ha comenzado y no se permiten nuevos ingresos.');
      return;
    }

    // 2. Verificar si el apodo ya existe
    const { data: existingPlayer, error: existError } = await supabase.from('players')
      .select('*')
      .eq('game_id', game.id)
      .eq('name', name.trim())
      .maybeSingle();

    if (existError) {
      addLog(`[ERROR] Error al verificar apodo en DB: ${existError.message}`);
      console.error("[GameSync] Error al verificar apodo en DB:", existError.message);
      setJoinError('Error de red al verificar apodo.');
      alert(`Error al verificar apodo en el servidor.\n\n` +
            `Table: players\n\n` +
            `Payload:\n{\n  game_id: "${game.id}",\n  name: "${name.trim()}"\n}\n\n` +
            `Error:\n${existError.message}`);
      return;
    }

    if (existingPlayer) {
      // Re-conexión del mismo jugador
      if (existingPlayer.id === playerId) {
        addLog(`[PLAYER] Reconexión permitida al mismo apodo: ${name}`);
      } else {
        addLog(`[WARN] El apodo ${name} ya está en uso por otro dispositivo`);
        setJoinError('Ese apodo ya está en uso en esta partida. Por favor elige otro.');
        alert('Ese apodo ya está en uso en esta partida. Por favor elige otro.');
        return;
      }
    }

    // Guardar avatar
    const selectedAvatar = sessionStorage.getItem(`avatar_${name.trim().toLowerCase()}`) || 'engineer';

    const playerData = {
      id: playerId,
      game_id: game.id,
      name: name.trim(),
      score: 0,
      streak: 0,
      is_bot: false,
      last_correct: null,
      rank: 1,
      avatar: selectedAvatar,
      last_seen: new Date().toISOString()
    };

    addLog(`[PLAYER] Registrando jugador en la base de datos: ${name}`);
    console.log("[GameSync] Player creation - Registrando jugador en Supabase:", playerData);
    const { error: pError } = await supabase.from('players').upsert(playerData);
    
    if (pError) {
      addLog(`[ERROR] Error al registrar jugador en DB: ${pError.message}`);
      console.error("[GameSync] Error al registrar jugador en DB:", pError.message);
      setJoinError('Error de conexión al unirse al servidor.');
      alert(`Error al unirse al juego en el servidor.\n\n` +
            `Table: players\n\n` +
            `Payload:\n{\n  nickname: "${name.trim()}",\n  avatar: "${selectedAvatar}",\n  game_id: "${game.id}"\n}\n\n` +
            `Error:\n${pError.message}`);
      return;
    }

    console.log("[GameSync] Jugador registrado con éxito en Supabase.");

    // Actualizar estados
    gameIdRef.current = game.id;
    setPin(targetPin);
    setPlayerName(name.trim());
    setGameState(game.game_state);
    setCurrentQuestionIndex(game.current_question_index);
    setQuestionStartedAt(game.question_started_at);
    setJoined(true);

    // Guardar sesión en Storage para soportar refrescos de página
    sessionStorage.setItem('spc_player_game_id', game.id);
    sessionStorage.setItem('spc_player_name', name.trim());

    addLog(`[PLAYER] ¡Te has unido exitosamente!`);

    // Configurar suscripciones del jugador
    subscribePlayerEvents(game.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, playerId, addLog, setJoinError]);

  const submitAnswer = useCallback(async (optionIndex) => {
    if (isHost || hasAnswered || !gameIdRef.current || !questionStartedAt) return;
    addLog(`[PLAYER] Enviando respuesta seleccionada: ${optionIndex}`);

    // Calcular el tiempo transcurrido en segundos
    const timeTaken = Math.max(0.1, (Date.now() - new Date(questionStartedAt).getTime()) / 1000);
    const question = questionsData[currentQuestionIndex];
    const isCorrect = optionIndex === question.answer;

    // Calcular puntos (Máx 1000: 500 precisión + 500 velocidad)
    const remainingRatio = Math.max(0, Math.min(1, (TOTAL_QUESTION_TIME - timeTaken) / TOTAL_QUESTION_TIME));
    let points = 0;
    if (isCorrect) {
      points = Math.round(500 + 500 * remainingRatio);
    }

    // Registrar en local inmediatamente
    setHasAnswered(true);
    setMyLastAnswerCorrect(isCorrect);
    setPointsEarnedThisRound(points);

    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }

    const answerData = {
      game_id: gameIdRef.current,
      player_id: playerId,
      question_index: currentQuestionIndex,
      option_index: optionIndex,
      time_taken: timeTaken,
      is_correct: isCorrect,
      points: points
    };

    // Subir respuesta a base de datos de Supabase
    const { error } = await supabase.from('answers').insert(answerData);
    if (error) {
      addLog(`[ERROR] Error al registrar respuesta en el servidor: ${error.message}`);
    } else {
      addLog('[PLAYER] Respuesta enviada y confirmada en el servidor.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, hasAnswered, currentQuestionIndex, questionStartedAt, playerId, addLog]);

  const clearLogs = useCallback(() => {
    setDebugLogs([]);
  }, []);

  const clearJoinError = useCallback(() => {
    setJoinError('');
  }, []);

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

    // Estado de Conexión & Debug
    connectionStatus,
    debugLogs,
    clearLogs,
    addLog,
    joinError,
    clearJoinError,

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
