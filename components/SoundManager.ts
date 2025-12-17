/**
 * Retro Sound Synthesizer using Web Audio API
 * Avoids external asset dependencies by generating waveforms in real-time.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private ambianceOsc: OscillatorNode | null = null;
  private ambianceGain: GainNode | null = null;
  private windNoise: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  private getCtx() {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    return this.ctx!;
  }

  playScan() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  playItemUse() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  playCollect() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  playCaught() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  playVictory() {
    const ctx = this.getCtx();
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.5);
    });
  }

  startAmbiance() {
    if (this.ambianceOsc) return;
    const ctx = this.getCtx();
    
    // 1. Deep Urban Hum (Sawtooth base)
    this.ambianceOsc = ctx.createOscillator();
    this.ambianceGain = ctx.createGain();
    const humFilter = ctx.createBiquadFilter();

    this.ambianceOsc.type = 'sawtooth';
    this.ambianceOsc.frequency.value = 42; // Low E hum
    
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 80;
    humFilter.Q.value = 8;

    this.ambianceGain.gain.value = 0.04;

    this.ambianceOsc.connect(humFilter);
    humFilter.connect(this.ambianceGain);
    this.ambianceGain.connect(ctx.destination);

    this.ambianceOsc.start();

    // 2. Procedural Wind/Traffic (White Noise)
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    this.windNoise = ctx.createBufferSource();
    this.windNoise.buffer = noiseBuffer;
    this.windNoise.loop = true;

    this.windGain = ctx.createGain();
    const windFilter = ctx.createBiquadFilter();
    
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 400;
    windFilter.Q.value = 1;

    // Modulate the wind filter frequency to simulate gusts or passing distant cars
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15; // Slow movement
    lfoGain.gain.value = 200; // Swing range

    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);
    lfo.start();

    this.windGain.gain.value = 0.02;

    this.windNoise.connect(windFilter);
    windFilter.connect(this.windGain);
    this.windGain.connect(ctx.destination);

    this.windNoise.start();
  }

  stopAmbiance() {
    if (this.ambianceOsc) {
      this.ambianceOsc.stop();
      this.ambianceOsc = null;
    }
    if (this.windNoise) {
        this.windNoise.stop();
        this.windNoise = null;
    }
  }
}

export const soundManager = new SoundManager();
