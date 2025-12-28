import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CONFIG, GAME_CONSTANTS } from './constants';
import { ResourceMap, UpgradeMap, FloatingText, BuildingLevelMap } from './types';
import { playWoodBlock, playCoinSound, playAlertSound } from './utils/audio';
import StorePanel from './components/StorePanel';
import BuildingVisualizer from './components/BuildingVisualizer';
import FloatingTextLayer from './components/FloatingTextLayer';
import JesusEvent from './components/JesusEvent';

const App: React.FC = () => {
  // --- State ---
  const [merit, setMerit] = useState<number>(0);
  const [totalMerit, setTotalMerit] = useState<number>(0);
  const [buildings, setBuildings] = useState<ResourceMap>({});
  const [buildingLevels, setBuildingLevels] = useState<BuildingLevelMap>({});
  const [upgrades, setUpgrades] = useState<UpgradeMap>({});
  const [popups, setPopups] = useState<FloatingText[]>([]);
  
  // Event State
  const [jesusActive, setJesusActive] = useState<boolean>(false);

  // Animation Refs
  const lastTickRef = useRef<number>(Date.now());
  const popupIdRef = useRef<number>(0);
  const woodFishRef = useRef<HTMLDivElement>(null);

  // --- Calculations ---

  const getMultiplier = useCallback(() => {
    let mult = 1;
    // Apply global upgrade multipliers if any
    return mult;
  }, [upgrades]);

  const getClickValue = useCallback(() => {
    let val = 1;
    if (upgrades['gilded_fish']) val *= 2;
    if (upgrades['diamond_fish']) val *= 3;
    return val * getMultiplier();
  }, [upgrades, getMultiplier]);

  const getMPS = useCallback(() => {
    let mps = 0;
    CONFIG.buildings.forEach(b => {
      const count = buildings[b.id] || 0;
      const level = buildingLevels[b.id] || 1;
      
      // Production formula: Base * Count * (2^(Level-1))
      // Level 1: 1x, Level 2: 2x, Level 3: 4x ...
      const levelMultiplier = Math.pow(2, level - 1);
      
      mps += count * b.baseProduction * levelMultiplier;
    });
    return mps * getMultiplier();
  }, [buildings, buildingLevels, getMultiplier]);

  const getBuildingCost = (basePrice: number, count: number) => {
    // Rebalanced: Reduced scaling from 1.15 to 1.08 for faster progression
    return Math.floor(basePrice * Math.pow(1.08, count));
  };

  const getUpgradeCost = (baseUpgradeCost: number, currentLevel: number) => {
    // Upgrade cost scaling: Base * (2.5 ^ (Level - 1))
    return Math.floor(baseUpgradeCost * Math.pow(2.5, currentLevel - 1));
  };

  // --- Actions ---

  const addFloatingText = (text: string, x: number, y: number, color: string = '#fbbf24') => {
    const id = popupIdRef.current++;
    setPopups(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  const handleClickFish = (e: React.MouseEvent | React.TouchEvent) => {
    playWoodBlock();
    
    const val = getClickValue();
    setMerit(prev => prev + val);
    setTotalMerit(prev => prev + val);

    // Visuals
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    addFloatingText(`功德 +${val}`, clientX, clientY);
    
    if (woodFishRef.current) {
      woodFishRef.current.classList.remove('wood-fish-active');
      void woodFishRef.current.offsetWidth; // Trigger reflow
      woodFishRef.current.classList.add('wood-fish-active');
    }
  };

  const buyBuilding = (id: string) => {
    const b = CONFIG.buildings.find(x => x.id === id);
    if (!b) return;

    const count = buildings[id] || 0;
    const cost = getBuildingCost(b.baseCost, count);

    if (merit >= cost) {
      playCoinSound();
      setMerit(prev => prev - cost);
      setBuildings(prev => ({ ...prev, [id]: count + 1 }));
      
      // Initialize level if not present
      setBuildingLevels(prev => {
          if (!prev[id]) return { ...prev, [id]: 1 };
          return prev;
      });
    }
  };

  const buyBuildingUpgrade = (id: string) => {
    const b = CONFIG.buildings.find(x => x.id === id);
    if (!b) return;

    const currentLevel = buildingLevels[id] || 1;
    const cost = getUpgradeCost(b.baseUpgradeCost, currentLevel);
    
    // Check Requirement: 5 * currentLevel
    const buildingCount = buildings[id] || 0;
    if (buildingCount < 5 * currentLevel) return;

    if (merit >= cost) {
        playAlertSound(); // Distinct sound for upgrade
        setMerit(prev => prev - cost);
        setBuildingLevels(prev => ({ ...prev, [id]: currentLevel + 1 }));
        
        // Visual feedback centered
        addFloatingText(`${b.name} Lv.${currentLevel + 1}!`, window.innerWidth/2, window.innerHeight/2, '#a855f7');
    }
  };

  const buyUpgrade = (id: string) => {
    const u = CONFIG.clickUpgrades.find(x => x.id === id);
    if (!u) return;

    if (merit >= u.cost && !upgrades[id]) {
        playCoinSound();
        setMerit(prev => prev - u.cost);
        setUpgrades(prev => ({ ...prev, [id]: true }));
    }
  };

  const resolveJesus = () => {
      setJesusActive(false);
      const bonus = getMPS() * 60 + 1000;
      setMerit(prev => prev + bonus);
      playCoinSound();
      addFloatingText(`阿门! 功德 +${bonus.toFixed(0)}`, window.innerWidth/2 - 50, window.innerHeight/2, '#ef4444');
  };

  // --- Game Loop ---

  // Auto-clicker Effect
  useEffect(() => {
      if (!upgrades['auto_clicker_v1']) return;
      const interval = setInterval(() => {
         const val = getClickValue();
         setMerit(prev => prev + val);
         setTotalMerit(prev => prev + val);
      }, 1000);
      return () => clearInterval(interval);
  }, [upgrades, getClickValue]);

  // Main Ticker
  useEffect(() => {
    const tickRate = 100; // ms
    const timer = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      // 1. Passive Income
      const mps = getMPS();
      if (mps > 0) {
        const gain = mps * deltaSeconds;
        setMerit(prev => {
            if (jesusActive) {
                const drain = prev * GAME_CONSTANTS.JESUS_DRAIN_RATE * deltaSeconds;
                return Math.max(0, prev + gain - drain);
            }
            return prev + gain;
        });
        setTotalMerit(prev => prev + gain);
      }

      // 2. Jesus Event Trigger
      if (!jesusActive && Math.random() < GAME_CONSTANTS.JESUS_SPAWN_CHANCE) {
          setJesusActive(true);
          playAlertSound();
      }

    }, tickRate);

    return () => clearInterval(timer);
  }, [getMPS, jesusActive]);


  // --- Render ---

  // Determine Fish Icon
  let FishIcon = '🐟';
  if (upgrades['diamond_fish']) FishIcon = '💎';
  else if (upgrades['gilded_fish']) FishIcon = '🐡';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden text-slate-200 select-none">
      
      {/* --- Top Bar --- */}
      <header className="h-20 bg-slate-900 border-b border-amber-500/30 flex items-center justify-between px-6 z-20 shadow-lg relative">
        <div className="flex flex-col">
            <h1 className="text-2xl font-cyber text-amber-500 font-bold tracking-wider drop-shadow-md">
                功德模拟器 <span className="text-xs text-cyan-400 font-normal opacity-80">v2.2.0</span>
            </h1>
            <span className="text-slate-500 text-xs font-serif italic">Merit Simulator: Cyber Era</span>
        </div>
        
        <div className="flex flex-col items-end">
            <div className="text-4xl font-bold text-amber-400 font-mono drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                {Math.floor(merit).toLocaleString()}
            </div>
            <div className="text-sm text-cyan-500 font-mono">
                {getMPS().toFixed(1)} MPS (Merit/Sec)
            </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <div className="flex flex-1 overflow-hidden relative">
        <FloatingTextLayer items={popups} />
        <JesusEvent isVisible={jesusActive} onClick={resolveJesus} />

        {/* Left: Visualization */}
        <div className="hidden md:flex md:w-1/3 p-4 flex-col bg-slate-900/80 z-10">
            <BuildingVisualizer ownedBuildings={buildings} />
        </div>

        {/* Center: The Wooden Fish */}
        <div className="flex-1 flex items-center justify-center relative bg-radial-gradient">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                 <div className="w-[500px] h-[500px] border border-cyan-500 rounded-full animate-spin-slow" style={{ animationDuration: '20s' }}></div>
                 <div className="absolute w-[400px] h-[400px] border border-amber-500 rounded-full animate-spin-slow-reverse" style={{ animationDuration: '15s' }}></div>
            </div>

            <div 
                ref={woodFishRef}
                className="relative cursor-pointer transition-transform duration-100 ease-in-out hover:scale-105"
                onMouseDown={handleClickFish}
                onTouchStart={handleClickFish}
            >
                <div className={`
                    w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center text-8xl shadow-2xl
                    ${upgrades['diamond_fish'] 
                        ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-cyan-500/50 border-4 border-white' 
                        : upgrades['gilded_fish']
                            ? 'bg-gradient-to-br from-amber-300 to-yellow-600 shadow-amber-500/50 border-4 border-amber-200'
                            : 'bg-gradient-to-br from-red-900 to-slate-800 shadow-black border-4 border-slate-700'
                    }
                `}>
                    <span className="filter drop-shadow-lg">{FishIcon}</span>
                </div>
                
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-slate-400 font-cyber text-sm tracking-widest opacity-70">
                    CLICK TO PRAY
                </div>
            </div>
        </div>

        {/* Right: Store */}
        <StorePanel 
            merit={merit}
            ownedBuildings={buildings}
            ownedUpgrades={upgrades}
            buildingLevels={buildingLevels}
            onBuyBuilding={buyBuilding}
            onBuyUpgrade={buyUpgrade}
            onBuyBuildingUpgrade={buyBuildingUpgrade}
            calculateCost={getBuildingCost}
            calculateUpgradeCost={getUpgradeCost}
        />

      </div>
    </div>
  );
};

export default App;