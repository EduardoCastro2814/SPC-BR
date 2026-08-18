// Servicio de Síntesis de Sonido en tiempo real mediante Web Audio API
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.lobbyInterval = null;
    this.lobbyStep = 0;
    this.isPlayingLobby = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  }

  setMuted(val) {
    this.muted = val;
    if (val) {
      this.stopLobbyMusic();
    } else if (this.isPlayingLobby) {
      this.startLobbyMusic();
    }
  }

  // Reproduce un sonido de "Tick" metálico para la cuenta regresiva
  playTick() {
    this.init();
    if (this.muted || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Reproduce una campanada de acierto (Arpegio Mayor rápido)
  playCorrect() {
    this.init();
    if (this.muted || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // Do5, Mi5, Sol5, Do6

    notes.forEach((freq, index) => {
      const time = now + index * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.0, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.35);
    });
  }

  // Reproduce un zumbador de error (Sawtooth grave descendente)
  playWrong() {
    this.init();
    if (this.muted || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.45);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    // Un filtro pasabajos para quitarle lo chillón e imitar un buzzer industrial
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Reproduce una fanfarria triunfal ascendente y brillante (Podio)
  playFanfare() {
    this.init();
    if (this.muted || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    // Secuencia de arpegios para un final de victoria
    const melody = [
      { f: 261.63, d: 0.15 }, // Do4
      { f: 329.63, d: 0.15 }, // Mi4
      { f: 392.00, d: 0.15 }, // Sol4
      { f: 523.25, d: 0.3 },  // Do5
      { f: 440.00, d: 0.15 }, // La4
      { f: 523.25, d: 0.15 }, // Do5
      { f: 587.33, d: 0.15 }, // Re5
      { f: 783.99, d: 0.6 }   // Sol5
    ];

    let accumTime = now;
    melody.forEach((note) => {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator(); // Doble oscilador para efecto chorus
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(note.f, accumTime);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(note.f + 2, accumTime); // Desafinado ligeramente

      gain.gain.setValueAtTime(0.0, accumTime);
      gain.gain.linearRampToValueAtTime(0.08, accumTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, accumTime + note.d);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, accumTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(accumTime);
      osc2.start(accumTime);

      osc1.stop(accumTime + note.d);
      osc2.stop(accumTime + note.d);

      accumTime += note.d - 0.02; // Superponer levemente
    });
  }

  // Música del Lobby: Un loop industrial/electrónico minimalista
  // Genera beats y bajos sintetizados secuenciados por código
  startLobbyMusic() {
    this.isPlayingLobby = true;
    this.init();
    if (this.muted || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.lobbyInterval) return;

    const tempo = 120; // BPM
    const stepDuration = 60 / tempo / 2; // Semicorcheas (0.125s)

    this.lobbyStep = 0;
    this.lobbyInterval = setInterval(() => {
      if (!this.ctx || this.muted) return;
      const now = this.ctx.currentTime;

      // 1. Kick en pasos 0, 4, 8, 12 (4/4 Beat)
      if (this.lobbyStep % 4 === 0) {
        this.synthKick(now);
      }

      // 2. Hi-Hat en pasos 2, 6, 10, 14 (Offbeat)
      if (this.lobbyStep % 4 === 2) {
        this.synthHat(now);
      }

      // 3. Bajo sintetizado (Línea de bajo industrial oscura)
      // Escala: La menor (A, C, D, G)
      const bassPattern = [55.0, 55.0, 65.4, 55.0, 73.4, 73.4, 98.0, 73.4];
      if (this.lobbyStep % 2 === 0) {
        const bassFreq = bassPattern[Math.floor(this.lobbyStep / 2) % bassPattern.length];
        this.synthBass(bassFreq, now, stepDuration * 1.5);
      }

      this.lobbyStep = (this.lobbyStep + 1) % 16;
    }, stepDuration * 1000);
  }

  stopLobbyMusic() {
    if (this.lobbyInterval) {
      clearInterval(this.lobbyInterval);
      this.lobbyInterval = null;
    }
    this.isPlayingLobby = false;
  }

  // Sintetizador de Bombo (Kick)
  synthKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.15); // Caída de tono rápida

    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.16);
  }

  // Sintetizador de Hi-hat (Ruido filtrado)
  synthHat(time) {
    // Generar un buffer de ruido blanco de 0.05 segundos
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time); // Cortar frecuencias bajas

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.03, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.06);
  }

  // Sintetizador de Bajo Industrial
  synthBass(freq, time, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + duration);

    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }
}

export const soundManager = new SoundManager();
