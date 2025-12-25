
import React, { useState } from 'react';
import GameView from './components/GameView';
import HUD from './components/HUD';

const App: React.FC = () => {
  const [hudData, setHudData] = useState({
    health: 100,
    ammo: 32,
    score: 0
  });

  const handleUpdateHUD = (health: number, ammo: number, score: number) => {
    setHudData({ health, ammo, score });
  };

  return (
    <div className="min-h-screen bg-[#222] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full flex flex-col gap-0 select-none">
        
        {/* Title Bar */}
        <div className="bg-gray-800 p-2 text-center border-b-4 border-gray-900">
            <h1 className="text-2xl font-black text-red-600 tracking-widest uppercase italic">
                EMOJI WOLF <span className="text-gray-400">3D</span>
            </h1>
        </div>

        {/* Main Game Area */}
        <GameView onUpdateHUD={handleUpdateHUD} />

        {/* HUD Area */}
        <HUD 
          health={hudData.health} 
          ammo={hudData.ammo} 
          score={hudData.score} 
        />

        {/* Mobile / Control Disclaimer */}
        <div className="mt-4 text-center text-gray-500 text-sm">
            Powered by Raycasting Engine & Emojis 🚀
        </div>
      </div>
    </div>
  );
};

export default App;
