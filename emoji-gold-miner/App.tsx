import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGame } from './game/phaserGame';
import { EventBus, GameEvents } from './game/EventBus';
import { GAME_WIDTH, GAME_HEIGHT } from './game/Constants';

enum AppState {
  MENU,
  PLAYING,
  LEVEL_COMPLETE,
  GAME_OVER
}

const App: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.MENU);
  
  // Game Stats
  const [score, setScore] = useState(0);
  const [targetScore, setTargetScore] = useState(650); // Matches level 1 target
  const [timeLeft, setTimeLeft] = useState(30);
  const [level, setLevel] = useState(1);

  // Initialize Phaser
  useEffect(() => {
    // Only init game once, but we might want to delay it until "Start" is pressed or just keep it running
    // For this flow, we mount the game container always, but scene might be paused or restarted.
    if (!gameRef.current) {
        gameRef.current = createGame('game-container');
    }

    // Event Listeners
    const onScoreChange = (data: { score: number, target: number }) => {
      setScore(data.score);
      setTargetScore(data.target);
    };
    
    const onTimeChange = (time: number) => {
      setTimeLeft(time);
    };

    const onLevelChange = (lvl: number) => {
        setLevel(lvl);
    };

    const onLevelComplete = (data: { score: number, level: number }) => {
        setScore(data.score);
        setLevel(data.level);
        setAppState(AppState.LEVEL_COMPLETE);
    };

    const onGameOver = (data: { score: number }) => {
        setScore(data.score);
        setAppState(AppState.GAME_OVER);
    };

    EventBus.on(GameEvents.SCORE_CHANGE, onScoreChange);
    EventBus.on(GameEvents.TIME_CHANGE, onTimeChange);
    EventBus.on(GameEvents.LEVEL_CHANGE, onLevelChange);
    EventBus.on(GameEvents.LEVEL_COMPLETE, onLevelComplete);
    EventBus.on(GameEvents.GAME_OVER, onGameOver);

    return () => {
      EventBus.off(GameEvents.SCORE_CHANGE, onScoreChange);
      EventBus.off(GameEvents.TIME_CHANGE, onTimeChange);
      EventBus.off(GameEvents.LEVEL_CHANGE, onLevelChange);
      EventBus.off(GameEvents.LEVEL_COMPLETE, onLevelComplete);
      EventBus.off(GameEvents.GAME_OVER, onGameOver);
      
      // Cleanup game on unmount
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const startGame = () => {
    setAppState(AppState.PLAYING);
    setScore(0);
    setLevel(1);
    
    // Restart Phaser Scene
    const scene = gameRef.current?.scene.getScene('MainScene');
    if (scene) {
        scene.scene.restart({ level: 1, score: 0 });
    }
  };

  const nextLevel = () => {
      setAppState(AppState.PLAYING);
      const scene = gameRef.current?.scene.getScene('MainScene');
      if (scene) {
          scene.scene.restart({ level: level + 1, score: score });
      }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 flex justify-center items-center font-sans overflow-hidden">
        
        {/* Game Container */}
        <div id="game-container" className="shadow-2xl rounded-lg overflow-hidden" style={{ maxWidth: GAME_WIDTH, maxHeight: GAME_HEIGHT }}></div>

        {/* UI Overlay: HUD */}
        {appState === AppState.PLAYING && (
            <div className="absolute top-4 left-0 right-0 max-w-[800px] mx-auto px-4 flex justify-between items-start pointer-events-none">
                <div className="bg-slate-800/80 p-3 rounded-lg text-white border-2 border-yellow-500 shadow-lg backdrop-blur-sm">
                    <div className="text-xl font-bold text-yellow-400">Target: ${targetScore}</div>
                    <div className="text-3xl font-black">Score: ${score}</div>
                </div>
                
                <div className="flex flex-col gap-2">
                    <div className="bg-slate-800/80 p-3 rounded-lg text-white border-2 border-blue-400 shadow-lg backdrop-blur-sm">
                         <div className="text-sm text-gray-300">Level {level}</div>
                         <div className={`text-3xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            ⏱️ {timeLeft}
                         </div>
                    </div>
                </div>
            </div>
        )}

        {/* Start Screen */}
        {appState === AppState.MENU && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
                 <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border-4 border-yellow-500 transform transition-all scale-100 hover:scale-105">
                     <div className="text-6xl mb-4">🤠💰</div>
                     <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Emoji Gold Miner</h1>
                     <p className="text-gray-600 mb-8 text-lg">Swing your hook using <kbd className="bg-gray-200 px-2 py-1 rounded">Space</kbd>, <kbd className="bg-gray-200 px-2 py-1 rounded">↓</kbd> or <span className="font-bold">Click</span> to collect treasures!</p>
                     
                     <button 
                        onClick={startGame}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-bold text-2xl py-4 px-8 rounded-xl transition-colors shadow-lg active:translate-y-1"
                     >
                        Start Mining
                     </button>
                 </div>
             </div>
        )}

        {/* Level Complete Screen */}
        {appState === AppState.LEVEL_COMPLETE && (
             <div className="absolute inset-0 flex items-center justify-center bg-green-900/80 backdrop-blur-sm z-50">
                 <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border-4 border-green-500 animate-bounce-short">
                     <div className="text-6xl mb-4">🎉💎</div>
                     <h2 className="text-3xl font-bold text-green-600 mb-2">Level Complete!</h2>
                     <p className="text-gray-600 mb-6 text-xl">Current Score: <span className="font-bold text-black">${score}</span></p>
                     
                     <button 
                        onClick={nextLevel}
                        className="w-full bg-green-500 hover:bg-green-400 text-white font-bold text-2xl py-4 px-8 rounded-xl transition-colors shadow-lg active:translate-y-1"
                     >
                        Next Level ➡️
                     </button>
                 </div>
             </div>
        )}

        {/* Game Over Screen */}
        {appState === AppState.GAME_OVER && (
             <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 backdrop-blur-sm z-50">
                 <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border-4 border-red-500">
                     <div className="text-6xl mb-4">☠️🥀</div>
                     <h2 className="text-4xl font-bold text-red-600 mb-2">Game Over</h2>
                     <p className="text-gray-600 mb-8 text-xl">You finished with <span className="font-bold text-black">${score}</span></p>
                     
                     <button 
                        onClick={startGame}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold text-2xl py-4 px-8 rounded-xl transition-colors shadow-lg active:translate-y-1"
                     >
                        Try Again ↺
                     </button>
                 </div>
             </div>
        )}

        {/* Controls Hint */}
        {appState === AppState.PLAYING && (
          <div className="absolute bottom-4 text-white/50 text-sm font-medium select-none">
            Click or Press Space to Launch Hook
          </div>
        )}
    </div>
  );
};

export default App;