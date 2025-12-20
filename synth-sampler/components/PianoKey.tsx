import React from 'react';
import { Note } from '../types';

interface PianoKeyProps {
  note: Note;
  isPressed: boolean;
  onMouseDown: (note: Note) => void;
  onMouseUp: (note: Note) => void;
}

export const PianoKey: React.FC<PianoKeyProps> = ({ note, isPressed, onMouseDown, onMouseUp }) => {
  const isBlack = note.type === 'black';

  // Base styles
  const baseStyle = isBlack
    ? "absolute z-10 h-32 w-10 -ml-5 bg-gray-900 border-2 border-gray-800 rounded-b-lg shadow-lg text-white"
    : "relative h-48 w-14 bg-white border border-gray-300 rounded-b-lg shadow-md text-gray-900 z-0";

  // Active styles (pressed)
  const activeStyle = isPressed
    ? isBlack
      ? "bg-synth-neon border-synth-neon shadow-[0_0_15px_#e94560] translate-y-1"
      : "bg-gray-100 shadow-[inset_0_-5px_10px_rgba(0,0,0,0.2)] border-b-4 border-synth-neon translate-y-1"
    : isBlack
      ? "hover:bg-gray-800"
      : "hover:bg-gray-50";

  return (
    <div
      className={`${baseStyle} ${activeStyle} cursor-pointer transition-all duration-75 flex flex-col justify-end items-center pb-2 select-none`}
      onMouseDown={() => onMouseDown(note)}
      onMouseUp={() => onMouseUp(note)}
      onMouseLeave={() => onMouseUp(note)}
      onTouchStart={(e) => { e.preventDefault(); onMouseDown(note); }}
      onTouchEnd={(e) => { e.preventDefault(); onMouseUp(note); }}
    >
      <span className={`text-xs font-bold ${isBlack ? 'text-gray-400' : 'text-gray-400'} mb-1`}>
        {note.keyboardShortcut}
      </span>
      <span className="text-xs opacity-50 font-mono">
        {note.name}{note.octave}
      </span>
    </div>
  );
};