import React, { useEffect, useState } from 'react';
import { PianoKey } from './PianoKey';
import { Note } from '../types';
import { engine } from '../utils/AudioEngine';

// Define 1.5 octaves starting from C3 to G4
const generateNotes = (): Note[] => {
  const notes: Note[] = [];
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const keyboardMap = "awsedftgyhujkolp;[']"; 
  
  const keyMap: Record<number, string> = {
    48: 'Z', 49: 'S', 50: 'X', 51: 'D', 52: 'C', 53: 'V', 54: 'G', 55: 'B', 56: 'H', 57: 'N', 58: 'J', 59: 'M',
    60: 'Q', 61: '2', 62: 'W', 63: '3', 64: 'E', 65: 'R', 66: '5', 67: 'T', 68: '6', 69: 'Y', 70: '7', 71: 'U'
  };

  const startMidi = 48; // C3
  const endMidi = 72;   // C5

  for (let midi = startMidi; midi <= endMidi; midi++) {
    const octave = Math.floor(midi / 12) - 1;
    const nameIndex = midi % 12;
    const name = noteNames[nameIndex];
    const type = name.includes('#') ? 'black' : 'white';
    
    notes.push({
      name,
      octave,
      midi,
      type,
      keyboardShortcut: keyMap[midi] || ''
    });
  }
  return notes;
};

const NOTES = generateNotes();

export const Piano: React.FC = () => {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

  const playNote = (midi: number) => {
    if (!activeNotes.has(midi)) {
      engine.playNote(midi, 60); // 60 is C4 (Middle C) - our root sample pitch
      setActiveNotes(prev => new Set(prev).add(midi));
    }
  };

  const stopNote = (midi: number) => {
    engine.stopNote(midi);
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toUpperCase();
      const note = NOTES.find(n => n.keyboardShortcut === key);
      if (note) {
        playNote(note.midi);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const note = NOTES.find(n => n.keyboardShortcut === key);
      if (note) {
        stopNote(note.midi);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeNotes]);

  return (
    <div className="relative flex items-start justify-center p-4 select-none overflow-x-auto bg-gray-900/50 rounded-xl border border-gray-800 shadow-xl">
      {NOTES.map((note) => (
        <React.Fragment key={note.midi}>
           {note.type === 'white' && (
             <div className="relative">
                <PianoKey 
                  note={note} 
                  isPressed={activeNotes.has(note.midi)} 
                  onMouseDown={() => playNote(note.midi)}
                  onMouseUp={() => stopNote(note.midi)}
                />
                {NOTES.find(n => n.midi === note.midi + 1 && n.type === 'black') && (
                   <PianoKey 
                     note={NOTES.find(n => n.midi === note.midi + 1)!} 
                     isPressed={activeNotes.has(note.midi + 1)} 
                     onMouseDown={() => playNote(note.midi + 1)}
                     onMouseUp={() => stopNote(note.midi + 1)}
                   />
                )}
             </div>
           )}
        </React.Fragment>
      ))}
    </div>
  );
};