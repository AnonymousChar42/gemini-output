import React, { useState, useEffect, useRef } from 'react';
import { engine } from '../utils/AudioEngine';
import { SoundSourceType } from '../types';

interface ControlPanelProps {
  onSampleLoaded: (name: string, type: SoundSourceType) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onSampleLoaded }) => {
  const [fileName, setFileName] = useState<string>("Initializing...");
  const [volume, setVolume] = useState(0.5);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  // Loop State
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(0);
  const [sampleDuration, setSampleDuration] = useState(0);

  const [midiFileName, setMidiFileName] = useState<string | null>(null);
  const [midiBuffer, setMidiBuffer] = useState<ArrayBuffer | null>(null);
  const [isPlayingMidi, setIsPlayingMidi] = useState(false);

  // Initial Load Effect
  useEffect(() => {
    const loadDefaults = async () => {
      // 1. Try to load default Audio (fa.mp3)
      try {
        const buffer = await engine.loadAudioFromUrl('fa.mp3');
        setFileName("fa.mp3");
        setSampleDuration(buffer.duration);
        setLoopEnd(buffer.duration);
        engine.setLoopConfig(false, 0, buffer.duration);
        onSampleLoaded("fa.mp3", SoundSourceType.DEFAULT);
      } catch (e) {
        console.warn("Could not load 'fa.mp3'. Falling back to synthetic beep.", e);
        handleClearAudio(); // Fallback to synth
      }

      // 2. Try to load default MIDI (Flight_of_the_Bumblebee.mid)
      try {
        const res = await fetch('Flight_of_the_Bumblebee.mid');
        if (res.ok) {
            const buffer = await res.arrayBuffer();
            setMidiBuffer(buffer);
            setMidiFileName("Flight_of_the_Bumblebee.mid");
        } else {
            console.warn("Could not find default MIDI file.");
        }
      } catch (e) {
        console.warn("Error loading default MIDI file", e);
      }
    };

    loadDefaults();
  }, [onSampleLoaded]);

  const updateLoopEngine = (enabled: boolean, start: number, end: number) => {
    engine.setLoopConfig(enabled, start, end);
  };

  const handleClearAudio = () => {
    try {
        const buffer = engine.createFallbackBuffer();
        setFileName("Synthesizer (Basic Piano)");
        setSampleDuration(buffer.duration);
        setLoopStart(0);
        setLoopEnd(buffer.duration);
        
        // Reset loop state to false when clearing
        setIsLooping(false);
        updateLoopEngine(false, 0, buffer.duration);

        if (audioInputRef.current) {
            audioInputRef.current.value = "";
        }
    } catch (err) {
        console.error("Failed to reset audio", err);
    }
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
      // Keep previous loop state if user wants, but safer to reset or clamp
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
             <label className="block mb-2 text-gray-300 text-xs font-mono">Current Instrument Source</label>
             
             {/* Custom File Input UI */}
             <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-md border border-gray-600">
                <div className="bg-synth-neon/20 p-2 rounded text-synth-neon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{fileName}</p>
                    <p className="text-[10px] text-gray-400">Audio / Wav / Mp3</p>
                </div>
                
                {/* Hidden Input */}
                <input
                   ref={audioInputRef}
                   type="file"
                   accept="audio/*"
                   onChange={handleFileUpload}
                   className="hidden"
                />

                <button 
                    onClick={() => audioInputRef.current?.click()}
                    className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    title="Upload new file"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                </button>

                {fileName !== "Synthesizer (Basic Piano)" && (
                  <button 
                      onClick={handleClearAudio}
                      className="p-2 text-red-400 hover:text-red-200 hover:bg-red-900/30 rounded transition-colors"
                      title="Clear Audio (Reset to Piano)"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </button>
                )}
             </div>
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
             {midiFileName && (
                 <p className="mt-2 text-[10px] text-gray-400 font-mono text-center truncate">
                    Loaded: {midiFileName.replace("Default: ", "")}
                 </p>
             )}
          </div>
        </div>

        {/* Display & Volume */}
        <div className="flex-1 w-full space-y-4">
          <h3 className="text-synth-neon font-bold uppercase tracking-wider text-sm">3. Configuration</h3>
          
          <div className="bg-black/30 p-4 rounded-lg min-h-[100px] flex flex-col justify-center items-center border border-dashed border-gray-600 relative">
             <span className="text-gray-400 text-xs mb-1">Active Instrument</span>
             <p className="text-white font-mono text-center break-all text-lg font-bold text-synth-neon drop-shadow-sm">{fileName}</p>
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