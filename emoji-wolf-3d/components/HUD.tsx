
import React from 'react';

interface HUDProps {
  health: number;
  ammo: number;
  score: number;
}

const HUD: React.FC<HUDProps> = ({ health, ammo, score }) => {
  return (
    <div className="bg-[#444] border-t-8 border-gray-600 p-4 grid grid-cols-4 gap-4 text-center font-mono text-white shadow-inner">
      <div className="bg-gray-800 p-2 border-4 border-gray-500 rounded flex flex-col items-center justify-center">
        <span className="text-xs text-blue-300 uppercase">Score</span>
        <span className="text-2xl font-bold text-yellow-400">{score.toString().padStart(6, '0')}</span>
      </div>
      
      <div className="bg-gray-800 p-2 border-4 border-gray-500 rounded flex flex-col items-center justify-center">
        <span className="text-xs text-blue-300 uppercase">Health</span>
        <div className="flex items-center gap-2">
           <span className="text-3xl">👤</span>
           <span className={`text-3xl font-bold ${health < 25 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{health}%</span>
        </div>
      </div>

      <div className="bg-gray-800 p-2 border-4 border-gray-500 rounded flex flex-col items-center justify-center">
        <span className="text-xs text-blue-300 uppercase">Ammo</span>
        <div className="flex items-center gap-2">
           <span className="text-3xl">🔋</span>
           <span className="text-3xl font-bold text-green-400">{ammo}</span>
        </div>
      </div>

      <div className="bg-gray-800 p-2 border-4 border-gray-500 rounded flex items-center justify-center">
        <div className="text-left leading-tight text-[10px] text-gray-400 font-sans uppercase">
           WASD: Move / Turn<br/>
           SPACE: Shoot<br/>
           GOAL: KILL 😈 & GET 💰
        </div>
      </div>
    </div>
  );
};

export default HUD;
