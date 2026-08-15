// Procedural Web Audio API sound generator for meadow atmosphere and bunny interactions

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private streamGain: GainNode | null = null;
  private cricketsGain: GainNode | null = null;
  private birdTimer: number | null = null;
  private cricketTimer: number | null = null;
  private initialized: boolean = false;

  public init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupWind();
      this.setupStream();
      this.setupCrickets();
      this.scheduleBirds();

      this.initialized = true;
    } catch {
      // Audio context might fail if blocked by browser policy until interaction
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.initialized && !muted) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended' && !muted) {
      this.ctx.resume();
    }
    if (this.masterGain && this.ctx) {
      const target = muted ? 0.0001 : 0.4;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(target, this.ctx.currentTime + 0.5);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public updateTimeOfDay(timeOfDay: string) {
    if (!this.ctx) return;
    const isNight = timeOfDay === 'night' || timeOfDay === 'twilight';
    const now = this.ctx.currentTime;

    if (this.cricketsGain) {
      this.cricketsGain.gain.cancelScheduledValues(now);
      this.cricketsGain.gain.linearRampToValueAtTime(isNight ? 0.25 : 0.0, now + 1.0);
    }
  }

  private setupWind() {
    if (!this.ctx || !this.masterGain) return;
    // White noise filtered as soft wind
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    // LFO to modulate wind swell
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    whiteNoise.start();
    lfo.start();
  }

  private setupStream() {
    if (!this.ctx || !this.masterGain) return;
    // Babbling water stream sound via pink noise + bandpass
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.5;
    }

    const streamNoise = this.ctx.createBufferSource();
    streamNoise.buffer = buffer;
    streamNoise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(650, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.streamGain = this.ctx.createGain();
    this.streamGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    streamNoise.connect(bandpass);
    bandpass.connect(this.streamGain);
    this.streamGain.connect(this.masterGain);

    streamNoise.start();
  }

  private setupCrickets() {
    if (!this.ctx || !this.masterGain) return;
    this.cricketsGain = this.ctx.createGain();
    this.cricketsGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.cricketsGain.connect(this.masterGain);

    const triggerCricketPulse = () => {
      if (!this.ctx || !this.cricketsGain || this.isMuted) {
        this.cricketTimer = window.setTimeout(triggerCricketPulse, 800);
        return;
      }
      try {
        const osc = this.ctx.createOscillator();
        const pulseGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4600 + Math.random() * 400, this.ctx.currentTime);

        const now = this.ctx.currentTime;
        pulseGain.gain.setValueAtTime(0, now);
        pulseGain.gain.linearRampToValueAtTime(0.1, now + 0.02);
        pulseGain.gain.linearRampToValueAtTime(0, now + 0.06);

        osc.connect(pulseGain);
        pulseGain.connect(this.cricketsGain);
        osc.start(now);
        osc.stop(now + 0.07);
      } catch {
        // ignore
      }
      this.cricketTimer = window.setTimeout(triggerCricketPulse, 120 + Math.random() * 80);
    };

    triggerCricketPulse();
  }

  private scheduleBirds() {
    const playChirp = () => {
      if (this.ctx && !this.isMuted && this.masterGain) {
        this.playBirdChirp();
      }
      const nextDelay = 3000 + Math.random() * 6000;
      this.birdTimer = window.setTimeout(playChirp, nextDelay);
    };
    this.birdTimer = window.setTimeout(playChirp, 2000);
  }

  private playBirdChirp() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const baseFreq = 2200 + Math.random() * 800;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.1, now + 0.18);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playHopSound() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // ignore
    }
  }

  public playCrunchSound() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(3.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
    } catch {
      // ignore
    }
  }

  public playHappyChime() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
      notes.forEach((freq, idx) => {
        const now = this.ctx!.currentTime + idx * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch {
      // ignore
    }
  }

  public dispose() {
    if (this.birdTimer) window.clearTimeout(this.birdTimer);
    if (this.cricketTimer) window.clearTimeout(this.cricketTimer);
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const soundFx = new AudioSynthesizer();
