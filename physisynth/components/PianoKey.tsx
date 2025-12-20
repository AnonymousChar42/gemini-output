import React from 'react';

interface PianoKeyProps {
  note: string;
  isBlack: boolean;
  onDown: () => void;
  onUp: () => void;
}

export const PianoKey: React.FC<PianoKeyProps> = ({ note, isBlack, onDown, onUp }) => {
  const baseClasses = "relative select-none cursor-pointer transition-all duration-100 flex items-end justify-center pb-2 rounded-b-md";
  const whiteClasses = "bg-slate-200 hover:bg-white text-slate-900 h-32 w-10 md:w-12 border-b-4 border-slate-400 active:border-b-0 active:translate-y-1 active:bg-neon-blue active:shadow-[0_0_15px_#00f3ff] z-0";
  const blackClasses = "bg-slate-900 hover:bg-slate-800 text-slate-300 h-20 w-8 -mx-4 border-b-4 border-black active:border-b-0 active:translate-y-1 active:bg-neon-pink active:shadow-[0_0_15px_#ff00ff] z-10 text-xs";

  return (
    <button
      className={`${baseClasses} ${isBlack ? blackClasses : whiteClasses}`}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={(e) => { e.preventDefault(); onDown(); }}
      onTouchEnd={(e) => { e.preventDefault(); onUp(); }}
    >
      <span className="opacity-50 font-mono text-[10px]">{note}</span>
    </button>
  );
};