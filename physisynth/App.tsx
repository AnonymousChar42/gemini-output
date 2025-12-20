import React, { useState, useCallback } from 'react';
import { Visualizer } from './components/Visualizer';
import { ControlKnob } from './components/ControlKnob';
import { PianoKey } from './components/PianoKey';
import { audioEngine } from './services/audioEngine';
import { SynthParams, DEFAULT_PARAMS } from './types';

// Scale definition (C Major + accidentals for a basic range)
const NOTES = [
  { note: 'C4', freq: 261.63, type: 'white' },
  { note: 'C#4', freq: 277.18, type: 'black' },
  { note: 'D4', freq: 293.66, type: 'white' },
  { note: 'D#4', freq: 311.13, type: 'black' },
  { note: 'E4', freq: 329.63, type: 'white' },
  { note: 'F4', freq: 349.23, type: 'white' },
  { note: 'F#4', freq: 369.99, type: 'black' },
  { note: 'G4', freq: 392.00, type: 'white' },
  { note: 'G#4', freq: 415.30, type: 'black' },
  { note: 'A4', freq: 440.00, type: 'white' },
  { note: 'A#4', freq: 466.16, type: 'black' },
  { note: 'B4', freq: 493.88, type: 'white' },
  { note: 'C5', freq: 523.25, type: 'white' },
];

export default function App() {
  const [params, setParams] = useState<SynthParams>(DEFAULT_PARAMS);

  // Initialize audio on first interaction
  const handleUserInteraction = () => {
    audioEngine.resume();
  };

  const updateParam = (key: keyof SynthParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const randomizeParams = () => {
    setParams({
      decay: 0.1 + Math.random() * 4.9,
      material: Math.random(),
      hardness: Math.random(),
      brightness: Math.random(),
      detune: Math.random() * 0.5 
    });
    // Trigger a short blip to hear the new sound immediately? 
    // Maybe better to let user play.
  };

  const playNote = useCallback((freq: number) => {
    audioEngine.trigger(freq, params);
  }, [params]);

  return (
    <div 
      className="min-h-screen bg-neon-dark text-white p-4 md:p-8 flex flex-col items-center gap-6 font-sans selection:bg-neon-pink selection:text-white"
      onClick={handleUserInteraction}
    >
      {/* Header */}
      <header className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple tracking-tighter">
            PHYSI<span className="text-white">SYNTH</span>
          </h1>
          <p className="text-slate-400 font-mono text-sm tracking-widest mt-1">PHYSICAL MODELING ENGINE // v1.0</p>
        </div>
      </header>

      {/* Main Control Panel */}
      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Visuals */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Visualizer */}
          <Visualizer />

          {/* Keyboard */}
          <div className="glass-panel p-6 rounded-xl border border-slate-700 flex justify-center overflow-x-auto">
            <div className="flex">
              {NOTES.map((n, i) => (
                <PianoKey
                  key={i}
                  note={n.note}
                  isBlack={n.type === 'black'}
                  onDown={() => playNote(n.freq)}
                  onUp={() => {}} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Parameters */}
        <div className="md:col-span-4 glass-panel p-6 rounded-xl border border-neon-blue/30 flex flex-col gap-2 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-2">
                <h2 className="text-neon-blue font-bold font-mono text-lg">
                    PHYSICAL PARAMS
                </h2>
                <button 
                  onClick={randomizeParams}
                  className="group relative px-3 py-1 bg-slate-900 border border-neon-pink/50 rounded overflow-hidden hover:border-neon-pink transition-colors"
                >
                  <div className="absolute inset-0 bg-neon-pink/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative font-mono text-[10px] tracking-widest text-neon-pink group-hover:text-white">
                    RANDOM
                  </span>
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 h-full relative z-10">
                <ControlKnob 
                    label="DECAY" 
                    value={params.decay} 
                    min={0.1} max={5.0} step={0.1} 
                    onChange={(v) => updateParam('decay', v)}
                    color="neon-blue"
                />
                <ControlKnob 
                    label="MATERIAL" 
                    value={params.material} 
                    min={0.0} max={1.0} step={0.01} 
                    onChange={(v) => updateParam('material', v)}
                    color="neon-purple"
                />
                <ControlKnob 
                    label="HARDNESS" 
                    value={params.hardness} 
                    min={0.0} max={1.0} step={0.01} 
                    onChange={(v) => updateParam('hardness', v)}
                    color="neon-pink"
                />
                <ControlKnob 
                    label="BRIGHTNESS" 
                    value={params.brightness} 
                    min={0.0} max={1.0} step={0.01} 
                    onChange={(v) => updateParam('brightness', v)}
                    color="neon-blue"
                />
                <div className="col-span-2 flex justify-center mt-2">
                     <ControlKnob 
                        label="DETUNE" 
                        value={params.detune} 
                        min={0.0} max={0.5} step={0.01} 
                        onChange={(v) => updateParam('detune', v)}
                        color="neon-purple"
                    />
                </div>
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-slate-600 text-xs font-mono max-w-4xl w-full text-center">
        WEB AUDIO API • REACT
      </footer>
    </div>
  );
}