import React, { useState } from 'react';
import { Game } from './components/Game';
import { MainMenu } from './components/MainMenu';
import { GameState } from './types';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [lastResult, setLastResult] = useState<boolean | null>(null);

  const handleStart = () => {
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (victory: boolean) => {
    setLastResult(victory);
    setGameState(victory ? GameState.VICTORY : GameState.GAME_OVER);
  };

  const handleExit = () => {
      setGameState(GameState.MENU);
  };

  return (
    <div className="w-full h-full">
      {gameState === GameState.MENU && <MainMenu onStart={handleStart} />}
      
      {gameState === GameState.PLAYING && (
        <Game onGameOver={handleGameOver} onExit={handleExit} />
      )}

      {(gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
           <div className="bg-gray-800 p-8 rounded-2xl border-4 border-white text-center shadow-2xl animate-bounce">
              <div className="text-6xl mb-4">
                  {gameState === GameState.VICTORY ? '🏆' : '💀'}
              </div>
              <h2 className={`text-4xl font-black mb-2 ${gameState === GameState.VICTORY ? 'text-yellow-400' : 'text-red-500'}`}>
                  {gameState === GameState.VICTORY ? 'VICTORY!' : 'DEFEAT'}
              </h2>
              <p className="text-gray-300 mb-8">
                  {gameState === GameState.VICTORY ? 'The Emoji Realm is safe.' : 'The Kaomojis took over...'}
              </p>
              <button 
                  onClick={() => setGameState(GameState.MENU)}
                  className="bg-white text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition"
              >
                  Main Menu
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

export default App;