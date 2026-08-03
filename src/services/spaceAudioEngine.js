import { SPACE_DATA } from '../data/spaceData';

class SpaceAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.masterGain = null;
    this.osc1 = null;
    this.osc2 = null;
    this.subOsc = null;
    this.filter = null;
    this.delayNode = null;
    this.feedbackGain = null;
    this.analyser = null;

    this.bodyFreqs = {
      sun: { base: 110.0, chord: 164.81, sub: 55.0, filter: 800 },
      solarsystem: { base: 55.0, chord: 82.41, sub: 27.5, filter: 600 },
      mercury: { base: 146.83, chord: 220.00, sub: 73.4, filter: 600 },
      venus: { base: 130.81, chord: 196.00, sub: 65.4, filter: 500 },
      earth: { base: 174.61, chord: 261.63, sub: 87.3, filter: 1000 },
      moon: { base: 155.56, chord: 233.08, sub: 77.8, filter: 700 },
      mars: { base: 98.00, chord: 146.83, sub: 49.0, filter: 450 },
      jupiter: { base: 65.41, chord: 98.00, sub: 32.7, filter: 350 },
      saturn: { base: 82.41, chord: 123.47, sub: 41.2, filter: 400 },
      uranus: { base: 123.47, chord: 185.00, sub: 61.7, filter: 900 },
      neptune: { base: 116.54, chord: 174.61, sub: 58.2, filter: 1100 },
      galaxy: { base: 220.00, chord: 329.63, sub: 110.0, filter: 1800 },
      kuiperbelt: { base: 80.0, chord: 120.0, sub: 40.0, filter: 350 },
      andromeda: { base: 200.0, chord: 300.0, sub: 100.0, filter: 1600 },
      blackhole: { base: 40.0, chord: 60.0, sub: 20.0, filter: 200 },
      nebula: { base: 180.0, chord: 270.0, sub: 90.0, filter: 1400 },
      pluto: { base: 90.0, chord: 135.0, sub: 45.0, filter: 400 }
    };

    this.currentBody = 'earth';
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    // Cosmic Echo Delay Loop
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.35, this.ctx.currentTime);

    this.feedbackGain = this.ctx.createGain();
    this.feedbackGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    this.delayNode.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delayNode);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;

    this.filter.connect(this.masterGain);
    this.filter.connect(this.delayNode);
    this.delayNode.connect(this.masterGain);

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.startSpaceDrones();
  }

  startSpaceDrones() {
    const freqs = this.bodyFreqs[this.currentBody] || this.bodyFreqs.earth;

    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sine';
    this.osc1.frequency.setValueAtTime(freqs.base, this.ctx.currentTime);

    const gain1 = this.ctx.createGain();
    gain1.gain.value = 0.25;
    this.osc1.connect(gain1);
    gain1.connect(this.filter);
    this.osc1.start();

    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'triangle';
    this.osc2.frequency.setValueAtTime(freqs.chord, this.ctx.currentTime);

    const gain2 = this.ctx.createGain();
    gain2.gain.value = 0.15;
    this.osc2.connect(gain2);
    gain2.connect(this.filter);
    this.osc2.start();

    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(freqs.sub, this.ctx.currentTime);

    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.4;
    this.subOsc.connect(subGain);
    subGain.connect(this.filter);
    this.subOsc.start();
  }

  setBody(bodyKey) {
    if (!this.bodyFreqs[bodyKey]) return;
    this.currentBody = bodyKey;
    if (!this.ctx) return;

    const freqs = this.bodyFreqs[bodyKey];
    const now = this.ctx.currentTime;

    this.osc1.frequency.exponentialRampToValueAtTime(freqs.base, now + 1.5);
    this.osc2.frequency.exponentialRampToValueAtTime(freqs.chord, now + 1.5);
    this.subOsc.frequency.exponentialRampToValueAtTime(freqs.sub, now + 1.5);
    this.filter.frequency.exponentialRampToValueAtTime(freqs.filter, now + 1.5);
  }

  toggleMute() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.isMuted = !this.isMuted;
    const targetGain = this.isMuted ? 0 : 0.4;
    this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.5);
    return !this.isMuted;
  }

  playChime(freq = 880, duration = 0.4) {
    if (this.isMuted || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  drawVisualizer(canvas) {
    if (!canvas || !this.analyser) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      requestAnimationFrame(render);
      if (this.isMuted) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, width, height);

      const activeColor = (SPACE_DATA[this.currentBody] && SPACE_DATA[this.currentBody].colorHex) || '#00e1ab';
      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        ctx.fillStyle = activeColor;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };
    render();
  }
}

export const spaceAudioEngine = new SpaceAudioEngine();
