import { SynthParams } from '../types';

class Voice {
  private ctx: AudioContext;
  private output: AudioNode;
  private oscillators: OscillatorNode[] = [];
  private gains: GainNode[] = [];
  private masterGain: GainNode;

  constructor(ctx: AudioContext, destination: AudioNode, freq: number, params: SynthParams) {
    this.ctx = ctx;
    this.output = destination;
    
    this.masterGain = ctx.createGain();
    this.masterGain.connect(this.output);
    this.masterGain.gain.setValueAtTime(0, ctx.currentTime);

    // Physical Modeling Approximation (Modal Synthesis)
    // A bar (glockenspiel) creates inharmonic overtones.
    // Base ratios for a clamped bar are approx: 1, 2.76, 5.4, 8.93
    
    // We interpolate ratios based on "material"
    // Wood (0) -> more harmonic (1, 2, 3, 4)
    // Metal (1) -> inharmonic (1, 2.76, 5.4, 8.93)
    
    const metalRatios = [1, 2.756, 5.404, 8.933, 13.34];
    const woodRatios = [1, 2.0, 3.0, 4.0, 5.0]; // Simplified harmonic series
    
    const blend = params.material;
    
    const numPartials = 5;

    for (let i = 0; i < numPartials; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Interpolate ratio
      const ratio = woodRatios[i] * (1 - blend) + metalRatios[i] * blend;
      
      // Apply detune (inharmonicity stretch)
      const finalFreq = freq * ratio * (1 + (i * params.detune * 0.05));
      
      osc.frequency.setValueAtTime(finalFreq, ctx.currentTime);
      
      // Choose waveform: Sine is best for bells/glockenspiel
      // Triangle adds a bit more grit for "hardness"
      osc.type = i === 0 ? 'sine' : (params.hardness > 0.8 ? 'triangle' : 'sine');

      // Gain Envelope
      // Higher partials decay faster in real physics
      const partialDecay = params.decay / (1 + i * 1.5); 
      
      // Amplitude: Higher partials are quieter, modulated by "brightness"
      let amp = (1 / (i + 1));
      if (i > 0) {
        amp *= params.brightness;
      }
      
      // Hardness increases initial transient of high partials
      const attackTime = 0.001 + (1 - params.hardness) * 0.02;

      gain.connect(this.masterGain);
      osc.connect(gain);
      
      // Envelope
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(amp, now + attackTime);
      gain.gain.exponentialRampToValueAtTime(0.001, now + attackTime + partialDecay);

      osc.start(now);
      // Clean up osc after decay
      osc.stop(now + attackTime + partialDecay + 1);

      this.oscillators.push(osc);
      this.gains.push(gain);
    }
    
    // Master envelope (gate)
    this.masterGain.gain.setValueAtTime(0.3, ctx.currentTime); // Master volume
  }

  stop() {
    // For percussive sounds like glockenspiel, we usually let them ring out 
    // based on the natural decay calculated in constructor.
    // But if we wanted to choke the sound:
    // const now = this.ctx.currentTime;
    // this.masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  }
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private activeVoices: Map<string, Voice> = new Map();

  constructor() {
    // Lazy initialization handled in init()
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    if (!this.ctx) return;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.85;

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -10;
    this.compressor.ratio.value = 4;
    
    // Chain: Voices -> Compressor -> Analyser -> Output
    this.compressor.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  getAnalyser() {
    return this.analyser;
  }

  async resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  trigger(freq: number, params: SynthParams) {
    if (!this.ctx || !this.compressor) {
      this.init();
    }
    this.resume();
    
    if (!this.ctx || !this.compressor) return;

    // Create a new voice
    // Ideally we manage voice stealing, but for simple glockenspiel, overlap is good
    new Voice(this.ctx, this.compressor, freq, params);
  }
}

export const audioEngine = new AudioEngine();