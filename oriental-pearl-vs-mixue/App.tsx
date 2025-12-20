import React, { useState } from 'react';
import GameContainer from './components/GameContainer';
import Shop from './components/Shop';
import { INITIAL_GOLD, INITIAL_HP, WEAPON_STATS } from './constants';
import { WeaponSlot, WeaponType } from './types';

function App() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [gold, setGold] = useState(INITIAL_GOLD);
  const [hp, setHp] = useState(INITIAL_HP);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [slots, setSlots] = useState<WeaponSlot[]>([]);

  const startGame = () => {
    setGameState('PLAYING');
    setGold(INITIAL_GOLD);
    setHp(INITIAL_HP);
    setWave(1);
    setScore(0);
    setSlots([]);
    setSelectedSlotIndex(null);
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    setGameState('GAMEOVER');
  };

  const handleBuyWeapon = (type: WeaponType) => {
    if (selectedSlotIndex === null) return;
    const cost = WEAPON_STATS[type].cost;
    
    if (gold >= cost) {
      setGold(prev => prev - cost);
      setSlots(prev => prev.map((slot, i) => {
        if (i === selectedSlotIndex) {
          return { ...slot, weaponType: type, cooldownTimer: 0, level: 1 };
        }
        return slot;
      }));
    }
  };

  const handleUpgradeWeapon = (index: number) => {
    const slot = slots[index];
    if (!slot || !slot.weaponType) return;
    
    const config = WEAPON_STATS[slot.weaponType];
    const cost = Math.floor(config.cost * slot.level);

    if (gold >= cost) {
        setGold(prev => prev - cost);
        setSlots(prev => prev.map((s, i) => {
            if (i === index) {
                return { ...s, level: s.level + 1 };
            }
            return s;
        }));
    }
  };

  const handleRemoveWeapon = (index: number) => {
      const slot = slots[index];
      if (slot && slot.weaponType) {
          const config = WEAPON_STATS[slot.weaponType];
          // Refund half of base cost + half of estimated upgrade costs (simplified)
          let totalSpent = config.cost;
          for (let l = 1; l < slot.level; l++) {
              totalSpent += Math.floor(config.cost * l);
          }
          const refund = Math.floor(totalSpent * 0.5);
          
          setGold(prev => prev + refund);
          setSlots(prev => prev.map((s, i) => {
              if (i === index) return { ...s, weaponType: null, targetId: null, level: 1 };
              return s;
          }));
      }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-900 text-white font-sans">
      
      {/* Header */}
      <header className="bg-slate-950 p-2 flex justify-between items-center shadow-md z-30">
        <h1 className="text-lg font-bold flex items-center gap-2">
            <span className="text-2xl">🗼</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                Oriental Pearl vs Mixue
            </span>
            <span className="text-2xl">⛄</span>
        </h1>
        <div className="flex gap-4 text-sm font-mono">
             <div>SCORE: {Math.floor(score)}</div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        
        {/* Game Layer */}
        {gameState === 'PLAYING' && (
          <div className="flex-1 relative">
             <GameContainer 
                onGameOver={handleGameOver}
                gold={gold}
                setGold={setGold}
                selectedSlot={selectedSlotIndex}
                setSelectedSlot={setSelectedSlotIndex}
                slots={slots}
                setSlots={setSlots}
                wave={wave}
                setWave={setWave}
                hp={hp}
                setHp={setHp}
             />
             
             {/* Shop Layer - Stick to bottom */}
             <div className="absolute bottom-0 w-full z-40">
                <Shop 
                    gold={gold} 
                    onBuy={handleBuyWeapon} 
                    onRemove={handleRemoveWeapon}
                    onUpgrade={handleUpgradeWeapon}
                    selectedSlotIndex={selectedSlotIndex}
                    slots={slots}
                />
             </div>
          </div>
        )}

        {/* Start Screen */}
        {gameState === 'START' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-50">
                <div className="text-8xl mb-4 animate-bounce">🗼 ⚡ ⛄</div>
                <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    Defend the Pearl!
                </h1>
                <p className="text-gray-300 mb-8 max-w-md text-center">
                    The Mixue Snowmen army is invading Shanghai! <br/>
                    Build weapons on the Oriental Pearl Tower slots to stop them.
                </p>
                <button 
                    onClick={startGame}
                    className="px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-full text-xl shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all hover:scale-105"
                >
                    START GAME ▶
                </button>
            </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'GAMEOVER' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 z-50 backdrop-blur-sm">
                <div className="text-8xl mb-4">💀</div>
                <h2 className="text-5xl font-bold text-red-500 mb-2">GAME OVER</h2>
                <p className="text-2xl text-white mb-8">Score: {Math.floor(score)}</p>
                
                <div className="flex gap-4">
                    <button 
                        onClick={startGame}
                        className="px-8 py-3 bg-white text-red-900 font-bold rounded-full text-xl hover:bg-gray-200 shadow-lg"
                    >
                        Try Again ↺
                    </button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

export default App;