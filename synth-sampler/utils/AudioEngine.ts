import { Midi } from '@tonejs/midi';

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private buffer: AudioBuffer | null = null;
  
  // Live playing sources (triggered by keyboard)
  private activeSources: Map<number, AudioBufferSourceNode> = new Map();
  
  // Sequenced sources (triggered by MIDI file)
  private scheduledSources: Set<AudioBufferSourceNode> = new Set();
  
  // Loop Configuration
  private isLooping: boolean = false;
  private loopStart: number = 0;
  private loopEnd: number = 0;

  constructor() {
    // Lazy initialization handled in init()
  }

  public init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.analyser = this.context.createAnalyser();
      
      this.masterGain.gain.value = 0.5;
      this.analyser.fftSize = 256;
      
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  public async loadAudioFromUrl(url: string): Promise<AudioBuffer> {
    this.init();
    if (!this.context) throw new Error("Audio Context not initialized");

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch audio from ${url}: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const decoded = await this.context.decodeAudioData(arrayBuffer);
    this.setBuffer(decoded);
    return decoded;
  }

  public createFallbackBuffer(): AudioBuffer {
      this.init();
      if (!this.context) throw new Error("Audio Context not initialized");

      const sampleRate = this.context.sampleRate;
      const length = sampleRate * 1.5; // 1.5 seconds for better decay
      const buffer = this.context.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Synthesis: Additive synthesis for a "Electric Piano" like sound
      // Fundamental + 2nd Harmonic (lower vol) + 3rd Harmonic (lower vol)
      const freq = 261.63; // C4
      
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const decay = Math.exp(-3 * t); // Exponential decay
        
        // Mix sine waves
        const fundamental = Math.sin(2 * Math.PI * freq * t);
        const harmonic2 = 0.5 * Math.sin(2 * Math.PI * freq * 2 * t);
        const harmonic3 = 0.25 * Math.sin(2 * Math.PI * freq * 3 * t);
        
        data[i] = (fundamental + harmonic2 + harmonic3) * decay * 0.5; 
      }
      this.setBuffer(buffer);
      return buffer;
  }

  public setLoopConfig(enabled: boolean, start: number, end: number) {
    this.isLooping = enabled;
    this.loopStart = start;
    this.loopEnd = end;
  }

  public getDuration(): number {
    return this.buffer ? this.buffer.duration : 0;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setVolume(val: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = val;
    }
  }

  public async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    this.init();
    if (!this.context) throw new Error("Audio Context not initialized");
    const decoded = await this.context.decodeAudioData(arrayBuffer);
    this.setBuffer(decoded);
    return decoded;
  }

  public setBuffer(buffer: AudioBuffer) {
    this.buffer = buffer;
    // Reset loop defaults to full buffer duration
    this.loopStart = 0;
    this.loopEnd = buffer.duration;
  }

  public getContext(): AudioContext | null {
      return this.context;
  }

  // --- MIDI SEQUENCER LOGIC ---

  public async playMidiData(midiArrayBuffer: ArrayBuffer) {
    this.init();
    if (!this.context) return;
    
    // Stop any existing MIDI playback
    this.stopMidi();

    const midi = new Midi(midiArrayBuffer);
    const now = this.context.currentTime;
    const startDelay = 0.1; // slight buffer

    midi.tracks.forEach(track => {
      track.notes.forEach(note => {
        // note.midi, note.time (in seconds), note.duration (in seconds)
        this.scheduleNote(note.midi, now + startDelay + note.time, note.duration, 60);
      });
    });
  }

  public stopMidi() {
    this.scheduledSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // ignore if already stopped
      }
    });
    this.scheduledSources.clear();
  }

  private scheduleNote(midiNote: number, startTime: number, duration: number, rootNoteMidi: number) {
    if (!this.context || !this.buffer || !this.masterGain) return;

    // Calculate pitch shift ratio
    const semitones = midiNote - rootNoteMidi;
    const ratio = Math.pow(2, semitones / 12);

    const source = this.context.createBufferSource();
    source.buffer = this.buffer;

    // Apply Loop Settings
    if (this.isLooping) {
        source.loop = true;
        source.loopStart = this.loopStart;
        source.loopEnd = this.loopEnd;
    }

    // Envelope
    const envelope = this.context.createGain();
    // Start silence
    envelope.gain.setValueAtTime(0, startTime);
    // Attack
    envelope.gain.linearRampToValueAtTime(1, startTime + 0.02);
    // Release (at the end of duration)
    envelope.gain.setValueAtTime(1, startTime + duration - 0.05);
    envelope.gain.linearRampToValueAtTime(0, startTime + duration);

    // Standard Sampler behavior: Pitch = Playback Rate
    source.playbackRate.value = ratio;
    source.connect(envelope);

    envelope.connect(this.masterGain);
    
    source.start(startTime);
    source.stop(startTime + duration + 0.1); // Add slight buffer for release

    this.scheduledSources.add(source);

    source.onended = () => {
      this.scheduledSources.delete(source);
    };
  }

  // --- LIVE PLAY LOGIC ---

  public playNote(midiNote: number, rootNoteMidi: number = 60) {
    this.init();
    if (!this.context || !this.buffer || !this.masterGain) return;

    const semitones = midiNote - rootNoteMidi;
    const ratio = Math.pow(2, semitones / 12);

    const source = this.context.createBufferSource();
    source.buffer = this.buffer;

    // Apply Loop Settings
    if (this.isLooping) {
        source.loop = true;
        source.loopStart = this.loopStart;
        source.loopEnd = this.loopEnd;
    }

    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(0, this.context.currentTime);
    envelope.gain.linearRampToValueAtTime(1, this.context.currentTime + 0.02);

    // Standard Sampler behavior: Pitch = Playback Rate
    source.playbackRate.value = ratio;
    source.connect(envelope);

    envelope.connect(this.masterGain);
    source.start(0);

    this.activeSources.set(midiNote, source);

    source.onended = () => {
      this.activeSources.delete(midiNote);
    };
  }

  public stopNote(midiNote: number) {
     const source = this.activeSources.get(midiNote);
     if (source && this.context) {
         try {
            source.stop(this.context.currentTime + 0.1); 
         } catch (e) {
             console.error(e);
         }
     }
  }
}

export const engine = new AudioEngine();