import React from 'react';

interface MainMenuProps {
  onStart: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-wrap content-center justify-center gap-8 text-6xl select-none">
         {Array.from({length: 50}).map((_,i) => (
             <span key={i} className="animate-pulse" style={{animationDelay: `${Math.random()*2}s`}}>
                {['(・ω・)', '💩', '🔥', 'ᕕ( ᐛ )ᕗ'][i % 4]}
             </span>
         ))}
      </div>

      <div className="z-10 bg-gray-800/80 p-8 rounded-2xl border-4 border-yellow-500 shadow-2xl backdrop-blur text-center max-w-md w-full">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
          Emoji Defense
        </h1>
        <h2 className="text-xl text-gray-300 mb-8 font-bold tracking-wider">
          Kaomoji Invasion
        </h2>

        <div className="space-y-4 mb-8 text-left bg-gray-900/50 p-4 rounded-lg text-sm text-gray-300">
            <p>1. Build <span className="text-2xl">💩</span> towers to defend.</p>
            <p>2. Stop the <span className="text-white font-bold">(・ω・)</span> army.</p>
            <p>3. Upgrade to <span className="text-2xl">🌞</span> and <span className="text-2xl">⛄️</span>!</p>
        </div>

        <button 
          onClick={onStart}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-black text-xl py-4 rounded-xl shadow-lg transform transition hover:scale-105 active:scale-95"
        >
          START GAME
        </button>
      </div>
    </div>
  );
};