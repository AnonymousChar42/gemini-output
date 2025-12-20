import React, { useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { Piano } from './components/Piano';
import { Visualizer } from './components/Visualizer';
import { engine } from './utils/AudioEngine';

const App: React.FC = () => {

  // Load a default beep sound on mount so it works out of the box
  useEffect(() => {
    const createDefaultBeep = () => {
       // Create a simple generated buffer for immediate playability
       engine.init();
       const ctx = engine.getContext();
       if (ctx) {
         const sampleRate = ctx.sampleRate;
         const length = sampleRate * 0.5; // 0.5 seconds
         const buffer = ctx.createBuffer(1, length, sampleRate);
         const data = buffer.getChannelData(0);
         
         // Simple decayed sine wave (Pluck sound)
         for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            // Frequency 261.63 (Middle C)
            data[i] = Math.sin(2 * Math.PI * 261.63 * t) * Math.exp(-5 * t); 
         }
         engine.setBuffer(buffer);
       }
    };

    // User interaction is often required to start AudioContext fully
    const unlockAudio = () => {
      engine.init();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    // Initialize default sound
    try {
        createDefaultBeep();
    } catch(e) {
        console.error("Audio context not ready yet", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-synth-dark flex flex-col items-center py-10 px-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-synth-neon via-purple-500 to-blue-500 tracking-tight mb-2 drop-shadow-[0_0_10px_rgba(233,69,96,0.5)]">
          SYNTH SAMPLER
        </h1>
        <p className="text-gray-400 font-mono text-sm tracking-widest">
          WEB AUDIO SAMPLE MANIPULATOR
        </p>
      </header>

      {/* Main Content */}
      <Visualizer />
      
      <ControlPanel 
        onSampleLoaded={(name, type) => console.log(`Loaded ${type}: ${name}`)} 
      />

      <div className="w-full max-w-6xl overflow-x-auto pb-8">
        <Piano />
      </div>

      <footer className="mt-12 text-gray-600 text-xs text-center font-mono">
        <p>USE KEYBOARD TO PLAY: [Q-U] for UPPER OCTAVE, [Z-M] for LOWER OCTAVE</p>
        <p className="mt-2">Powered by React & Web Audio API</p>
      </footer>
    </div>
  );
};

export default App;