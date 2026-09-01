/**
 * The Blade & Crown - Audio Soundscape Engine
 * Web Audio API synthesizer for ambient barbershop soundscapes & micro-interactions
 */

class SoundscapeEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.isAmbientPlaying = false;
    this.ambientGain = null;
    this.sfxGain = null;
    this.ambientNodes = [];
    this.analyser = null;
    this.equalizerAnimId = null;
    this.initListeners();
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master Gains
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // Analyser for visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 32;
      this.ambientGain.connect(this.analyser);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initListeners() {
    // Enable audio on first user gesture
    const unlock = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
  }

  /**
   * Scissor Snip Sound Effect (Blade metallic snip)
   */
  playScissorSnip() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    // White noise burst for shear friction
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(3200, t);
    filter.Q.setValueAtTime(4.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    // High metal ring resonance
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(4800, t);
    osc.frequency.exponentialRampToValueAtTime(3500, t + 0.06);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.25, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    noise.start(t);
    osc.start(t);
    noise.stop(t + 0.09);
    osc.stop(t + 0.07);
  }

  /**
   * Soft Blade Hover Sound (subtle metallic ping)
   */
  playHoverBlade() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.04);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Razor Buzz Sound Effect
   */
  playRazorBuzz() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, t);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  /**
   * Start Ambient Barbershop Jazz & Vinyl Drone Soundscape
   */
  startAmbientSoundscape() {
    this.ensureContext();
    if (this.isAmbientPlaying) return;
    this.isAmbientPlaying = true;
    const t = this.ctx.currentTime;

    // Warm chords generator (F minor / Eb major luxury jazz chord drones)
    const freqs = [174.61, 220.0, 261.63, 349.23, 440.0]; // F3, A3, C4, F4, A4
    this.ambientNodes = [];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, t);

      // Add gentle detuning/chorus for lush warmth
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.15 + idx * 0.05;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 1.2;
      lfo.connect(osc.frequency);
      lfo.start();

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 650;

      const oscGain = this.ctx.createGain();
      oscGain.gain.value = 0.06 / freqs.length;

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.ambientGain);

      osc.start();
      this.ambientNodes.push(osc, lfo);
    });

    // Vinyl Crackle Noise Generator
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      // Periodic dust pops
      if (Math.random() < 0.002) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.4;
      } else {
        noiseData[i] = (Math.random() * 2 - 1) * 0.015;
      }
    }
    const vinylSource = this.ctx.createBufferSource();
    vinylSource.buffer = noiseBuffer;
    vinylSource.loop = true;

    const vinylFilter = this.ctx.createBiquadFilter();
    vinylFilter.type = "highpass";
    vinylFilter.frequency.value = 1000;

    const vinylGain = this.ctx.createGain();
    vinylGain.gain.value = 0.12;

    vinylSource.connect(vinylFilter);
    vinylFilter.connect(vinylGain);
    vinylGain.connect(this.ambientGain);

    vinylSource.start();
    this.ambientNodes.push(vinylSource);

    // Fade in ambient
    this.ambientGain.gain.setValueAtTime(0.001, t);
    this.ambientGain.gain.linearRampToValueAtTime(0.35, t + 2);

    this.startVisualizer();
  }

  stopAmbientSoundscape() {
    if (!this.isAmbientPlaying || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.ambientGain.gain.linearRampToValueAtTime(0.001, t + 1);

    setTimeout(() => {
      this.ambientNodes.forEach(node => {
        try { node.stop(); } catch(e) {}
        try { node.disconnect(); } catch(e) {}
      });
      this.ambientNodes = [];
      this.isAmbientPlaying = false;
      this.stopVisualizer();
    }, 1050);
  }

  toggleSound(muteBtn) {
    this.ensureContext();
    this.isMuted = !this.isMuted;

    if (!this.isMuted) {
      this.startAmbientSoundscape();
      this.playScissorSnip();
      muteBtn?.classList.add('playing');
      muteBtn?.setAttribute('aria-label', 'Mute Barbershop Ambience');
      muteBtn?.setAttribute('title', 'Mute Barbershop Ambience');
    } else {
      this.stopAmbientSoundscape();
      muteBtn?.classList.remove('playing');
      muteBtn?.setAttribute('aria-label', 'Play Barbershop Ambience');
      muteBtn?.setAttribute('title', 'Play Barbershop Ambience');
    }

    return !this.isMuted;
  }

  startVisualizer() {
    const bars = document.querySelectorAll('.eq-bar');
    if (!bars.length || !this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const update = () => {
      if (!this.isAmbientPlaying) return;
      this.analyser.getByteFrequencyData(dataArray);

      bars.forEach((bar, i) => {
        const val = dataArray[i % dataArray.length] || 30;
        const scale = Math.max(0.15, val / 255);
        bar.style.transform = `scaleY(${scale})`;
      });

      this.equalizerAnimId = requestAnimationFrame(update);
    };

    update();
  }

  stopVisualizer() {
    if (this.equalizerAnimId) {
      cancelAnimationFrame(this.equalizerAnimId);
      this.equalizerAnimId = null;
    }
    const bars = document.querySelectorAll('.eq-bar');
    bars.forEach(bar => {
      bar.style.transform = 'scaleY(0.2)';
    });
  }
}

export const soundscape = new SoundscapeEngine();
