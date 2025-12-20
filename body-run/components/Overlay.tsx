import React from 'react';
import { GameState, PlayerState } from '../types';
import { Play, RotateCcw, Utensils, Trophy } from 'lucide-react';

interface OverlayProps {
  gameState: GameState;
  playerState: PlayerState;
  onStart: () => void;
  onRestart: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ gameState, playerState, onStart, onRestart }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* HUD */}
      <div className="flex justify-between items-start w-full">
        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-orange-200">
           <div className="text-orange-600 font-bold text-lg flex items-center gap-2">
             <Utensils size={20} />
             Weight: {playerState.weight}kg
           </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-blue-200">
           <div className="text-blue-600 font-bold text-lg">
             Score: {playerState.score}
           </div>
        </div>
      </div>

      {/* Start Screen */}
      {gameState === GameState.START && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-orange-500/20 backdrop-blur-sm pointer-events-auto">
          <h1 className="text-6xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)] tracking-tighter text-center italic mb-4 rotate-[-3deg]">
            BODY<br/>RUN
          </h1>
          <div className="bg-white/90 p-6 rounded-2xl mb-8 text-center shadow-xl max-w-sm">
             <p className="font-black text-orange-600 text-lg mb-2">🍔 GET AS FAT AS YOU CAN!</p>
             <p className="text-gray-700 text-sm mb-4">Higher Weight = Higher Score Bonus</p>
             <div className="text-left space-y-2 text-sm bg-orange-50 p-4 rounded-lg">
               <p className="flex items-center gap-2">🚪 <span className="font-bold">Heavy Gates:</span> Need FAT to break.</p>
               <p className="flex items-center gap-2">🤏 <span className="font-bold">Narrow Gates:</span> Squeeze through (Cost: -2 Weight).</p>
             </div>
          </div>
          <button 
            onClick={onStart}
            className="group relative px-8 py-4 bg-orange-600 text-white rounded-full font-black text-2xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:scale-110 transition-all active:scale-95"
          >
            <span className="flex items-center gap-2">
              START RUN <Play fill="currentColor" />
            </span>
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === GameState.GAMEOVER && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md pointer-events-auto">
          <h2 className="text-5xl font-bold text-white mb-2">TOO THIN!</h2>
          <p className="text-white text-xl mb-8">You lost all your weight!</p>
          <button 
            onClick={onRestart}
            className="px-8 py-3 bg-orange-500 text-white rounded-full font-bold text-xl hover:bg-orange-400 transition-colors flex items-center gap-2 shadow-lg"
          >
            <RotateCcw /> TRY AGAIN
          </button>
        </div>
      )}

      {/* Won Screen */}
      {gameState === GameState.WON && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-500/40 backdrop-blur-md pointer-events-auto">
          <Trophy className="w-24 h-24 text-yellow-300 drop-shadow-lg mb-4" />
          <h2 className="text-5xl font-bold text-white mb-2">LEGEND!</h2>
          <p className="text-white text-xl mb-8">Level Complete</p>
          <div className="bg-white/90 p-6 rounded-2xl shadow-xl mb-8 text-center min-w-[200px]">
            <p className="text-gray-500 text-sm uppercase font-bold">Final Score</p>
            <p className="text-5xl font-black text-orange-600">{playerState.score}</p>
            <div className="mt-2 text-sm text-gray-500">
              (Includes Weight Bonus)
            </div>
          </div>
          <button 
            onClick={onRestart}
            className="px-8 py-3 bg-white text-orange-600 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-xl"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};