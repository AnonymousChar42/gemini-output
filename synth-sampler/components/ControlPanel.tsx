import React, { useState, useEffect } from 'react';
import { engine } from '../utils/AudioEngine';
import { SoundSourceType } from '../types';

interface ControlPanelProps {
  onSampleLoaded: (name: string, type: SoundSourceType) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onSampleLoaded }) => {
  const [fileName, setFileName] = useState<string>("Default Sine Wave (Loading...)");
  const [volume, setVolume] = useState(0.5);
  
  // Loop State
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(0);
  const [sampleDuration, setSampleDuration] = useState(0);

  const [midiFileName, setMidiFileName] = useState<string | null>(null);
  const [midiBuffer, setMidiBuffer] = useState<ArrayBuffer | null>(null);
  const [isPlayingMidi, setIsPlayingMidi] = useState(false);

  // Poll for default duration on mount (hacky but simple since App sets it)
  useEffect(() => {
    const checkDuration = () => {
        const d = engine.getDuration();
        if (d > 0 && sampleDuration === 0) {
            setSampleDuration(d);
            setLoopEnd(d);
            engine.setLoopConfig(false, 0, d);
        }
    };
    const timer = setInterval(checkDuration, 500);
    return () => clearInterval(timer);
  }, [sampleDuration]);

  const updateLoopEngine = (enabled: boolean, start: number, end: number) => {
    engine.setLoopConfig(enabled, start, end);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await engine.decodeAudioData(arrayBuffer);
      setFileName(file.name);
      
      // Update Loop Limits
      setSampleDuration(buffer.duration);
      setLoopStart(0);
      setLoopEnd(buffer.duration);
      updateLoopEngine(isLooping, 0, buffer.duration);

      onSampleLoaded(file.name, SoundSourceType.UPLOAD);
    } catch (err) {
      console.error("Error loading file:", err);
      alert("Could not load audio file.");
    }
  };

  const handleMidiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      setMidiBuffer(arrayBuffer);
      setMidiFileName(file.name);
    } catch (err) {
      console.error("Error loading MIDI:", err);
      alert("Could not load MIDI file.");
    }
  };

  const playMidi = async () => {
    if (midiBuffer) {
      setIsPlayingMidi(true);
      await engine.playMidiData(midiBuffer);
    }
  };

  const stopMidi = () => {
    engine.stopMidi();
    setIsPlayingMidi(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    engine.setVolume(v);
  };

  const handleLoopToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setIsLooping(val);
    updateLoopEngine(val, loopStart, loopEnd);
  };

  const handleLoopStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (val >= loopEnd) val = loopEnd - 0.01;
    if (val < 0) val = 0;
    setLoopStart(val);
    updateLoopEngine(isLooping, val, loopEnd);
  };

  const handleLoopEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (val <= loopStart) val = loopStart + 0.01;
    if (val > sampleDuration) val = sampleDuration;
    setLoopEnd(val);
    updateLoopEngine(isLooping, loopStart, val);
  };

  return (
    <div className="bg-synth-panel p-6 rounded-xl border border-synth-accent shadow-2xl w-full max-w-4xl mb-8">
      <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
        
        {/* Sample Loader */}
        <div className="flex-1 w-full space-y-4">
          <h3 className="text-synth-neon font-bold uppercase tracking-wider text-sm">1. Load Instrument (Audio)</h3>
          
          <div className="bg-synth-dark p-4 rounded-lg border border-gray-700/50">
             <label className="block mb-2 text-gray-300 text-xs font-mono">Upload Audio File (wav/mp3)</label>
             <input
               type="file"
               accept="audio/*"
               onChange={handleFileUpload}
               className="block w-full text-sm text-gray-400
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0
                 file:text-sm file:font-semibold
                 file:bg-synth-neon file:text-white
                 hover:file:bg-red-600
                 cursor-pointer"
             />
          </div>

          <h3 className="text-synth-neon font-bold uppercase tracking-wider text-sm mt-4">2. Load Sequence (MIDI)</h3>
          
          <div className="bg-synth-dark p-4 rounded-lg border border-gray-700/50">
             <label className="block mb-2 text-gray-300 text-xs font-mono">Upload MIDI File (.mid)</label>
             <input
               type="file"
               accept=".mid,.midi"
               onChange={handleMidiUpload}
               className="block w-full text-sm text-gray-400
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0
                 file:text-sm file:font-semibold
                 file:bg-synth-glow file:text-white
                 hover:file:bg-purple-600
                 cursor-pointer"
             />
             
             <div className="mt-4 flex gap-2">
                <button
                  onClick={playMidi}
                  disabled={!midiBuffer}
                  className={`flex-1 py-2 rounded text-sm font-bold text-white transition-all
                    ${!midiBuffer 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-500 shadow-[0_0_10px_rgba(22,163,74,0.5)]'}`}
                >
                  ▶ PLAY MIDI
                </button>
                <button
                  onClick={stopMidi}
                  disabled={!midiBuffer}
                  className={`px-4 py-2 rounded text-sm font-bold text-white transition-colors border border-red-500/50
                    ${!midiBuffer 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-red-900/50 hover:bg-red-600'}`}
                >
                  STOP
                </button>
             </div>
             {midiFileName && <p className="mt-2 text-[10px] text-gray-400 font-mono text-center">Loaded: {midiFileName}</p>}
          </div>
        </div>

        {/* Display & Volume */}
        <div className="flex-1 w-full space-y-4">
          <h3 className="text-synth-neon font-bold uppercase tracking-wider text-sm">3. Configuration</h3>
          
          <div className="bg-black/30 p-4 rounded-lg min-h-[100px] flex flex-col justify-center items-center border border-dashed border-gray-600">
             <span className="text-gray-400 text-xs mb-1">Active Instrument</span>
             <p className="text-white font-mono text-center break-all">{fileName}</p>
             <span className="text-gray-500 text-[10px] mt-2">Mapped to Middle C (C4). Duration: {sampleDuration.toFixed(2)}s</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Master Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-synth-neon"
              />
            </div>

            {/* Loop Controls */}
            <div className="bg-synth-dark p-3 rounded-lg border border-gray-700/50 space-y-3">
               <div className="flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-white text-xs font-bold">Loop Sample</span>
                     <span className="text-[10px] text-gray-500">Repeat section infinitely</span>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={isLooping}
                        onChange={handleLoopToggle}
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-synth-neon"></div>
                   </label>
               </div>

               {isLooping && (
                   <div className="space-y-3 pt-2 border-t border-gray-700/50 animate-pulse-fast/10 transition-all">
                       <div className="space-y-1">
                           <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                               <span>Start: {loopStart.toFixed(2)}s</span>
                           </div>
                           <input
                            type="range"
                            min="0"
                            max={sampleDuration}
                            step="0.01"
                            value={loopStart}
                            onChange={handleLoopStartChange}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-400"
                           />
                       </div>
                       <div className="space-y-1">
                           <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                               <span>End: {loopEnd.toFixed(2)}s</span>
                           </div>
                           <input
                            type="range"
                            min="0"
                            max={sampleDuration}
                            step="0.01"
                            value={loopEnd}
                            onChange={handleLoopEndChange}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-400"
                           />
                       </div>
                   </div>
               )}
            </div>
            
            <div className="text-[10px] text-gray-500 font-mono border-t border-gray-800 pt-2">
                <p>INFO:</p>
                <p>- MIDI playback uses the currently loaded Audio File as the instrument.</p>
                <p>- Enable Looping to sustain short samples.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};