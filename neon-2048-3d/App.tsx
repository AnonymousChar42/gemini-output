import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Scene } from './components/Scene';
import { ScoreBoard } from './components/ScoreBoard';
import { initializeGame, moveTiles, spawnTile, checkGameOver } from './logic';
import { GameState, Vector3 } from './types';
import { RefreshCw, Trophy, Gamepad2, Zap, Keyboard } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    tiles: [],
    score: 0,
    gameOver: false,
    won: false,
  });

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayIndexRef = useRef(0);

  // Keep a ref to tiles to access latest state in event listeners if needed, 
  // though functional update setGameState(prev => ...) is usually sufficient.
  // We use a processing flag to prevent rapid-fire moves messing up animations/logic
  const isProcessing = useRef(false);

  // Initialize game on mount
  useEffect(() => {
    const { tiles, score } = initializeGame();
    setGameState({ tiles, score, gameOver: false, won: false });
  }, []);

  const handleMove = useCallback((direction: Vector3) => {
    if (isProcessing.current) return;
    
    setGameState((prev) => {
      if (prev.gameOver) return prev;

      isProcessing.current = true;
      const { tiles: newTiles, scoreIncrease, moved } = moveTiles(prev.tiles, direction);

      if (moved) {
        // Delay spawning slightly to allow slide animation to start? 
        // For simple logic, we just update state. 
        // The React Spring in Tile will handle the interpolation.
        
        const tilesWithSpawn = spawnTile(newTiles);
        const isGameOver = checkGameOver(tilesWithSpawn);
        
        // Check win condition (reaching 2048) - Optional, usually game continues
        const hasWon = !prev.won && tilesWithSpawn.some(t => t.value === 2048);

        setTimeout(() => {
            isProcessing.current = false;
        }, 150); // Small throttle

        return {
          tiles: tilesWithSpawn,
          score: prev.score + scoreIncrease,
          gameOver: isGameOver,
          won: hasWon || prev.won,
        };
      } else {
        isProcessing.current = false;
        return prev;
      }
    });
  }, []);

  // Auto-play Logic (Cyclic)
  useEffect(() => {
    let intervalId: any;
    if (isAutoPlaying && !gameState.gameOver) {
      intervalId = setInterval(() => {
        // Updated Sequence: Up, Left, Forward, Down, Right, Back (上左前下右后)
        const moves: Vector3[] = [
          [0, 1, 0],   // Up (上)
          [-1, 0, 0],  // Left (左)
          [0, 0, -1],  // Forward/Into (前) - assuming -Z is forward/in
          [0, -1, 0],  // Down (下)
          [1, 0, 0],   // Right (右)
          [0, 0, 1]    // Back/Out (后) - assuming +Z is back/out
        ];
        
        // Get next move in sequence
        const currentMove = moves[autoPlayIndexRef.current];
        handleMove(currentMove);
        
        // Update index for next tick
        autoPlayIndexRef.current = (autoPlayIndexRef.current + 1) % moves.length;
      }, 200);
    } else if (gameState.gameOver) {
      setIsAutoPlaying(false);
    }
    return () => clearInterval(intervalId);
  }, [isAutoPlaying, gameState.gameOver, handleMove]);


  const resetGame = () => {
    setIsAutoPlaying(false);
    autoPlayIndexRef.current = 0;
    const { tiles, score } = initializeGame();
    setGameState({ tiles, score, gameOver: false, won: false });
  };

  const toggleAutoPlay = () => {
    if (gameState.gameOver) return;
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for keys
      if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight", "PageUp", "PageDown", " "].indexOf(e.code) > -1) {
        e.preventDefault();
      }

      // Stop auto play if user interacts
      if (isAutoPlaying) {
         // Optional: setIsAutoPlaying(false); 
      }

      switch (e.key) {
        // X Axis (Left/Right)
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleMove([-1, 0, 0]); 
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleMove([1, 0, 0]);
          break;

        // Y Axis (Up/Down)
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleMove([0, 1, 0]);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleMove([0, -1, 0]);
          break;

        // Z Axis (Depth)
        case 'PageUp':
        case 'q':
        case 'Q':
            handleMove([0, 0, -1]); // Back / Away
            break;
        case 'PageDown':
        case 'e':
        case 'E':
            handleMove([0, 0, 1]); // Front / Towards
            break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, isAutoPlaying]);


  return (
    <div className="relative w-full h-full bg-black text-white overflow-hidden select-none">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Scene tiles={gameState.tiles} />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-12">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
              2048<span className="text-2xl align-top">3D</span>
            </h1>
            <p className="text-cyan-200/70 text-sm mt-2 tracking-widest font-mono">HYPERCUBE EDITION</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* New Animated ScoreBoard */}
            <ScoreBoard score={gameState.score} />
            
            <div className="flex gap-2 pointer-events-auto mt-2">
                <button 
                    onClick={toggleAutoPlay}
                    className={`flex items-center gap-2 px-4 py-2 border rounded transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] ${
                        isAutoPlaying 
                        ? 'bg-green-500/20 border-green-500/50 text-green-200 animate-pulse' 
                        : 'bg-cyan-600/20 hover:bg-cyan-600/40 border-cyan-500/50 text-cyan-200'
                    }`}
                >
                    <Zap size={18} className={isAutoPlaying ? "fill-current" : ""} /> 
                    {isAutoPlaying ? "AUTO ON" : "AUTO"}
                </button>

                <button 
                    onClick={resetGame} 
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 rounded text-purple-200 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                >
                    <RefreshCw size={18} /> Reset
                </button>
            </div>
          </div>
        </div>

        {/* Controls Hint */}
        <div className="self-start bg-black/40 backdrop-blur-sm border border-white/10 p-4 rounded-xl text-xs md:text-sm text-gray-300 font-mono space-y-3 min-w-[280px]">
            <div className="text-cyan-400 font-bold border-b border-white/10 pb-2 mb-2">CONTROL SYSTEMS</div>
            
            {/* Mode 1 */}
            <div className="flex items-start gap-3">
                <Gamepad2 className="text-purple-400 mt-1" size={20} />
                <div className="flex flex-col">
                    <span className="text-white font-bold text-xs uppercase tracking-wider mb-1">Standard</span>
                    <div className="grid grid-cols-[60px_1fr] gap-x-2 gap-y-1 text-[11px] text-gray-400">
                        <span className="text-cyan-200">ARROWS</span> <span>X / Y Axis</span>
                        <span className="text-cyan-200">PgUp/Dn</span> <span>Z Axis (Depth)</span>
                    </div>
                </div>
            </div>

            {/* Mode 2 */}
            <div className="flex items-start gap-3 mt-2">
                <Keyboard className="text-purple-400 mt-1" size={20} />
                 <div className="flex flex-col">
                    <span className="text-white font-bold text-xs uppercase tracking-wider mb-1">WASD</span>
                    <div className="grid grid-cols-[60px_1fr] gap-x-2 gap-y-1 text-[11px] text-gray-400">
                        <span className="text-cyan-200">A / D</span> <span>Left / Right</span>
                        <span className="text-cyan-200">W / S</span> <span>Up / Down</span>
                        <span className="text-cyan-200">Q / E</span> <span>Fwd / Back</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Game Over / Win Overlay */}
        {gameState.gameOver && (
            <div className="pointer-events-auto absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="text-center p-8 border-2 border-red-500/50 bg-black/90 rounded-2xl shadow-[0_0_50px_rgba(255,0,0,0.3)]">
                    <h2 className="text-5xl font-bold text-red-500 mb-4 tracking-widest">GAME OVER</h2>
                    <p className="text-gray-400 mb-8 font-mono">GRID LOCKED // SYSTEM FAILURE</p>
                    <button 
                        onClick={resetGame}
                        className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                    >
                        REBOOT SYSTEM
                    </button>
                </div>
            </div>
        )}
      </div>
      
      {/* Victory Toast */}
      {gameState.won && !gameState.gameOver && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
              <div className="animate-bounce bg-yellow-500/20 border border-yellow-400/50 backdrop-blur-md px-8 py-4 rounded-full text-yellow-300 font-bold text-2xl shadow-[0_0_30px_rgba(250,204,21,0.4)] flex items-center gap-3">
                  <Trophy /> 2048 REACHED
              </div>
          </div>
      )}
    </div>
  );
};

export default App;