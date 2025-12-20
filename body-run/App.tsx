import React, { useState } from 'react';
import { GameScene } from './components/GameScene';
import { Overlay } from './components/Overlay';
import { GameState, PlayerState } from './types';
import { INITIAL_WEIGHT, INITIAL_SCORE, INITIAL_Z } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [playerState, setPlayerState] = useState<PlayerState>({
    position: { x: 0, y: 0, z: INITIAL_Z },
    weight: INITIAL_WEIGHT,
    score: INITIAL_SCORE,
  });

  const startGame = () => setGameState(GameState.PLAYING);
  
  const resetGame = () => {
    setPlayerState({
      position: { x: 0, y: 0, z: INITIAL_Z },
      weight: INITIAL_WEIGHT,
      score: 0,
    });
    setGameState(GameState.START);
  };

  const handleGameOver = () => setGameState(GameState.GAMEOVER);
  const handleGameWon = () => {
    setGameState(GameState.WON);
  };

  return (
    <div className="relative w-full h-full bg-orange-50 overflow-hidden">
      <GameScene 
        gameState={gameState} 
        setPlayerState={setPlayerState}
        onGameOver={handleGameOver}
        onGameWon={handleGameWon}
      />
      <Overlay 
        gameState={gameState} 
        playerState={playerState} 
        onStart={startGame} 
        onRestart={resetGame} 
      />
    </div>
  );
};

export default App;