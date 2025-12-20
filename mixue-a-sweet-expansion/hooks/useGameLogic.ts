import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, ProvinceStatus, Tech, ProvinceData, TechCategory, Bubble } from '../types';
import { TECH_TREE_DATA, PROVINCE_ADJACENCY, PROVINCE_FLAVORS, WIN_THRESHOLD_PROVINCES, MAX_DAYS } from '../constants';

const TICK_RATE_MS = 1000; // Slower tick rate (1 second)
const BUBBLE_LIFETIME_MS = 8000; // Bubbles disappear after 8 seconds

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    money: 20, // Initial creative points
    day: 1,
    totalShops: 0,
    marketShare: 0,
    provinces: {},
    techs: TECH_TREE_DATA.reduce((acc, tech) => ({ ...acc, [tech.id]: tech }), {}),
    bubbles: [],
    news: ["欢迎来到《蜜雪冰城：甜蜜扩张》！请选择一个省份开始您的甜蜜征程。"],
    isRunning: false,
    gameWon: false,
    gameLost: false,
    selectedProvince: null,
    hasStarted: false,
  });

  const lastTickRef = useRef<number>(0);

  // Initialize Provinces based on GeoJSON data later, but for now we need an empty state waiting for selection
  const initializeProvinces = useCallback((provincesData: ProvinceData[]) => {
    setGameState(prev => {
      const newProvinces: Record<string, ProvinceData> = {};
      provincesData.forEach(p => {
        newProvinces[p.name] = p;
      });
      return { ...prev, provinces: newProvinces };
    });
  }, []);

  const selectProvince = useCallback((name: string) => {
      setGameState(prev => ({
          ...prev,
          selectedProvince: name
      }));
  }, []);

  const collectBubble = useCallback((id: string) => {
    setGameState(prev => {
      const bubble = prev.bubbles.find(b => b.id === id);
      if (!bubble) return prev;

      return {
        ...prev,
        money: prev.money + bubble.value,
        bubbles: prev.bubbles.filter(b => b.id !== id),
        // Optional: Add a little floating text effect logic here if we had a UI for it, 
        // for now just increasing money is enough.
      };
    });
  }, []);

  const startGame = useCallback((startProvinceName: string) => {
    setGameState(prev => {
      const newProvinces = { ...prev.provinces };
      if (newProvinces[startProvinceName]) {
        newProvinces[startProvinceName] = {
          ...newProvinces[startProvinceName],
          status: ProvinceStatus.INFECTED,
          infection: 1, // Start small
          shopCount: 10
        };
      }
      return {
        ...prev,
        provinces: newProvinces,
        isRunning: true,
        hasStarted: true,
        selectedProvince: startProvinceName,
        news: [...prev.news, `首家门店在 ${startProvinceName} 开业了！`, `新品发布: ${PROVINCE_FLAVORS.find(f => f.province === startProvinceName)?.name || '招牌柠檬水'}`]
      };
    });
  }, []);

  const purchaseTech = useCallback((techId: string) => {
    setGameState(prev => {
      const tech = prev.techs[techId];
      if (!tech || tech.purchased || prev.money < tech.cost) return prev;

      // Check parent requirements
      if (tech.parentId && !prev.techs[tech.parentId].purchased) return prev;

      const newTechs = { ...prev.techs, [techId]: { ...tech, purchased: true } };
      return {
        ...prev,
        money: prev.money - tech.cost,
        techs: newTechs,
        news: [ ...prev.news, `研发成功: ${tech.name}` ]
      };
    });
  }, []);

  // Game Loop
  useEffect(() => {
    if (!gameState.isRunning || gameState.gameWon || gameState.gameLost) return;

    const tick = setInterval(() => {
      setGameState(prev => {
        const now = Date.now();
        // Deep copy provinces
        const newProvinces: Record<string, ProvinceData> = {};
        for (const key in prev.provinces) {
          newProvinces[key] = { ...prev.provinces[key] };
        }

        let newMoney = prev.money;
        let totalShops = 0;
        let infectedCount = 0;
        let fullyConqueredCount = 0;
        const newNews = [...prev.news];
        let newBubbles = [...prev.bubbles];

        // Clean up old bubbles (auto-pop or just disappear? Usually disappear in Plague Inc style games if not clicked)
        // Let's make them disappear to encourage clicking
        // Using a simple counter based on tick might be better, but timestamp works if consistent
        // Actually, let's just use a simple lifetime counter if we stored it, but createdAt timestamp is fine.
        // Since we are in a setInterval, strictly speaking we should use the time delta, but for simplicity:
        // We won't filter them out here to avoid flickering, but maybe valid for 10 seconds.
        // Let's filter strict timeouts.
        // NOTE: In React strict mode, timestamps might be tricky with double invoke, but in setInterval it's fine.
        // Simplified: Remove bubbles older than X ticks (using day as proxy? No, day is game time).
        // Let's just keep them for now or remove randomly. 
        // Better: Remove bubbles if count > 5 to prevent clutter.
        if (newBubbles.length > 5) {
             newBubbles.shift(); // Remove oldest
        }

        // Calculate multipliers
        let spreadMultiplier = 1.0;
        let incomeMultiplier = 1.0;
        let crossBorder = false;

        Object.values(prev.techs).forEach((tech: Tech) => {
          if (tech.purchased) {
            if (tech.effectType === 'spread_rate') spreadMultiplier += tech.effectValue;
            if (tech.effectType === 'income_rate') incomeMultiplier += tech.effectValue;
            if (tech.effectType === 'cross_border') crossBorder = true;
          }
        });

        // 1. Expansion Logic
        const infectedProvinces = Object.values(newProvinces).filter((p: ProvinceData) => p.status !== ProvinceStatus.LOCKED);
        
        infectedProvinces.forEach((p: ProvinceData) => {
          // Internal Growth - SLOWED DOWN
          // Previous: (1 + Math.random() * 2)
          // New: (0.3 + Math.random() * 0.5)
          if (p.infection < 100) {
            const growth = (0.3 + Math.random() * 0.5) * spreadMultiplier;
            p.infection = Math.min(100, p.infection + growth);
            p.shopCount = Math.floor(p.infection * 10 * spreadMultiplier); 
          }

          if (p.infection >= 100 && p.status !== ProvinceStatus.CONQUERED) {
            p.status = ProvinceStatus.CONQUERED;
            newNews.push(`${p.name} 市场已完全占领！`);
            // Bonus points for conquering
            newMoney += 5; 
          }

          if (p.status === ProvinceStatus.CONQUERED) {
            fullyConqueredCount++;
          }
          
          infectedCount++;
          totalShops += p.shopCount;

          // Spread to neighbors
          // Threshold raised to 20% to slow down early snowball
          if (p.infection > 20) { 
            const neighbors = PROVINCE_ADJACENCY[p.name] || [];
            neighbors.forEach(neighborName => {
              if (newProvinces[neighborName] && newProvinces[neighborName].status === ProvinceStatus.LOCKED) {
                // Chance to infect - Reduced from 0.05 to 0.02
                if (Math.random() < 0.02 * spreadMultiplier) {
                  newProvinces[neighborName].status = ProvinceStatus.INFECTED;
                  newProvinces[neighborName].infection = 1;
                  newProvinces[neighborName].shopCount = 1;
                  
                  // SPAWN BUBBLE
                  if (newProvinces[neighborName].centroid) {
                      newBubbles.push({
                          id: `bubble-${Date.now()}-${Math.random()}`,
                          provinceName: neighborName,
                          coordinates: newProvinces[neighborName].centroid!,
                          value: Math.floor(2 + Math.random() * 3), // 2-4 points
                          createdAt: Date.now()
                      });
                  }

                  const flavor = PROVINCE_FLAVORS.find(f => f.province === neighborName);
                  if (flavor) {
                    newNews.push(`进军 ${neighborName}！推出新品：${flavor.name}`);
                  } else {
                    newNews.push(`品牌进入了 ${neighborName}！`);
                  }
                }
              }
            });
          }

          // Random cross border spread
          if (crossBorder && Math.random() < 0.005) { // Reduced from 0.01
             const allNames = Object.keys(newProvinces);
             const randomTarget = allNames[Math.floor(Math.random() * allNames.length)];
             if (newProvinces[randomTarget].status === ProvinceStatus.LOCKED) {
                newProvinces[randomTarget].status = ProvinceStatus.INFECTED;
                newProvinces[randomTarget].infection = 1;
                newProvinces[randomTarget].shopCount = 1;
                
                 // SPAWN BUBBLE
                 if (newProvinces[randomTarget].centroid) {
                    newBubbles.push({
                        id: `bubble-${Date.now()}-${Math.random()}`,
                        provinceName: randomTarget,
                        coordinates: newProvinces[randomTarget].centroid!,
                        value: Math.floor(3 + Math.random() * 3),
                        createdAt: Date.now()
                    });
                }

                newNews.push(`空降 ${randomTarget}！交通枢纽发挥作用。`);
             }
          }
        });

        // 2. Resource Generation
        // Reduced passive income significantly to prioritize bubbles
        // Only get passive income every 10 days instead of 5
        const income = (1 + (infectedCount * 0.2)) * incomeMultiplier;
        if (prev.day % 10 === 0) { 
             newMoney += Math.floor(income);
        }

        // 3. Win/Loss Check
        const day = prev.day + 1;
        let gameWon = fullyConqueredCount >= WIN_THRESHOLD_PROVINCES;
        let gameLost = day > MAX_DAYS && !gameWon;

        return {
          ...prev,
          day,
          money: newMoney,
          provinces: newProvinces,
          totalShops,
          marketShare: (fullyConqueredCount / WIN_THRESHOLD_PROVINCES) * 100,
          news: newNews.slice(-5), 
          bubbles: newBubbles,
          gameWon,
          gameLost,
          isRunning: !gameWon && !gameLost
        };
      });
    }, TICK_RATE_MS);

    return () => clearInterval(tick);
  }, [gameState.isRunning, gameState.gameWon, gameState.gameLost, purchaseTech]);

  return {
    gameState,
    startGame,
    purchaseTech,
    initializeProvinces,
    selectProvince,
    collectBubble
  };
};