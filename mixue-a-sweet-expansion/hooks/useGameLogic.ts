import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, ProvinceStatus, Tech, ProvinceData, TechCategory, Bubble, Flight } from '../types';
import { TECH_TREE_DATA, PROVINCE_ADJACENCY, PROVINCE_FLAVORS, MAX_DAYS } from '../constants';

const TICK_RATE_MS = 1000; // Base tick rate (1 second)
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
    flights: [],
    news: ["欢迎来到《蜜雪冰城：甜蜜扩张》！请选择一个省份开始您的甜蜜征程。"],
    isRunning: false,
    gameWon: false,
    gameLost: false,
    selectedProvince: null,
    hasStarted: false,
    timeScale: 1,
    totalTargetProvinces: 0,
  });

  // Expose Debug Function
  useEffect(() => {
    (window as any).setGameSpeed = (speed: number) => {
        setGameState(prev => ({ ...prev, timeScale: speed }));
        console.log(`[Debug] Game speed set to ${speed}x`);
    };
  }, []);

  const lastTickRef = useRef<number>(0);

  // Initialize Provinces based on GeoJSON data
  const initializeProvinces = useCallback((provincesData: ProvinceData[]) => {
    setGameState(prev => {
      const newProvinces: Record<string, ProvinceData> = {};
      provincesData.forEach(p => {
        newProvinces[p.name] = p;
      });
      
      // Calculate target based on Adjacency list
      const targetCount = Object.keys(PROVINCE_ADJACENCY).length;

      return { 
          ...prev, 
          provinces: newProvinces,
          totalTargetProvinces: targetCount 
      };
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

    // Use timeScale to determine interval duration
    const intervalDuration = TICK_RATE_MS / (gameState.timeScale || 1);

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
        const newNews = [...prev.news];
        let newBubbles = [...prev.bubbles];
        
        // Clean up old bubbles
        if (newBubbles.length > 5) {
             newBubbles.shift(); 
        }

        // Clean up finished flights
        let newFlights = prev.flights.filter(f => now < f.startTime + f.duration);

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
        const infectedNames = infectedProvinces.map(p => p.name);
        
        infectedProvinces.forEach((p: ProvinceData) => {
          // Internal Growth
          if (p.infection < 100) {
            const growth = (0.3 + Math.random() * 0.5) * spreadMultiplier;
            p.infection = Math.min(100, p.infection + growth);
            p.shopCount = Math.floor(p.infection * 10 * spreadMultiplier); 
          }

          if (p.infection >= 100 && p.status !== ProvinceStatus.CONQUERED) {
            p.status = ProvinceStatus.CONQUERED;
            newNews.push(`${p.name} 市场已完全占领！`);
            newMoney += 5; 
          }
          
          infectedCount++;
          totalShops += p.shopCount;

          // Spread to neighbors
          if (p.infection > 20) { 
            const neighbors = PROVINCE_ADJACENCY[p.name] || [];
            neighbors.forEach(neighborName => {
              if (newProvinces[neighborName] && newProvinces[neighborName].status === ProvinceStatus.LOCKED) {
                // Chance to infect
                if (Math.random() < 0.02 * spreadMultiplier) {
                  newProvinces[neighborName].status = ProvinceStatus.INFECTED;
                  newProvinces[neighborName].infection = 1;
                  newProvinces[neighborName].shopCount = 1;
                  
                  // SPAWN BUBBLE
                  if (newProvinces[neighborName].centroid) {
                      newBubbles.push({
                          id: `bubble-${now}-${Math.random()}`,
                          provinceName: neighborName,
                          coordinates: newProvinces[neighborName].centroid!,
                          value: Math.floor(2 + Math.random() * 3),
                          createdAt: now
                      });
                  }

                  // SPAWN FLIGHT (Expansion)
                  newFlights.push({
                    id: `flight-exp-${now}-${p.name}-${neighborName}`,
                    from: p.name,
                    to: neighborName,
                    startTime: now,
                    duration: 6000 // Increased from 4000 to allow longer stay
                  });

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
          if (crossBorder && Math.random() < 0.005) { 
             const allNames = Object.keys(newProvinces);
             const randomTarget = allNames[Math.floor(Math.random() * allNames.length)];
             if (newProvinces[randomTarget].status === ProvinceStatus.LOCKED) {
                newProvinces[randomTarget].status = ProvinceStatus.INFECTED;
                newProvinces[randomTarget].infection = 1;
                newProvinces[randomTarget].shopCount = 1;
                
                 // SPAWN BUBBLE
                 if (newProvinces[randomTarget].centroid) {
                    newBubbles.push({
                        id: `bubble-${now}-${Math.random()}`,
                        provinceName: randomTarget,
                        coordinates: newProvinces[randomTarget].centroid!,
                        value: Math.floor(3 + Math.random() * 3),
                        createdAt: now
                    });
                }
                
                // SPAWN FLIGHT (Long Distance)
                newFlights.push({
                    id: `flight-cross-${now}-${p.name}-${randomTarget}`,
                    from: p.name,
                    to: randomTarget,
                    startTime: now,
                    duration: 8000 // Increased for visual effect
                });

                newNews.push(`空降 ${randomTarget}！交通枢纽发挥作用。`);
             }
          }
        });

        // 2. Random Logistics Flights (Visuals only)
        // Spawn a random supply line between two infected provinces occasionally
        if (infectedNames.length > 1 && Math.random() < 0.3) {
            const from = infectedNames[Math.floor(Math.random() * infectedNames.length)];
            const to = infectedNames[Math.floor(Math.random() * infectedNames.length)];
            if (from !== to) {
                 newFlights.push({
                    id: `flight-logi-${now}-${Math.random()}`,
                    from,
                    to,
                    startTime: now,
                    duration: 5000 // Increased for visual effect
                 });
            }
        }

        // 3. Resource Generation
        const income = (1 + (infectedCount * 0.2)) * incomeMultiplier;
        if (prev.day % 10 === 0) { 
             newMoney += Math.floor(income);
        }

        // 4. Win/Loss Check
        const day = prev.day + 1;
        
        // Use a strict Set match against the Adjacency List for victory
        const targetSet = new Set(Object.keys(PROVINCE_ADJACENCY));
        let conqueredCount = 0;
        let allTargetsConquered = true;

        targetSet.forEach(targetName => {
            const province = newProvinces[targetName];
            // Check if the province exists in current game state AND is fully conquered
            if (province && province.status === ProvinceStatus.CONQUERED) {
                conqueredCount++;
            } else {
                allTargetsConquered = false;
            }
        });
        
        const totalTargets = targetSet.size;
        let gameWon = totalTargets > 0 && allTargetsConquered;
        let gameLost = day > MAX_DAYS && !gameWon;

        return {
          ...prev,
          day,
          money: newMoney,
          provinces: newProvinces,
          totalShops,
          // Market share is now based strictly on the target list
          marketShare: totalTargets > 0 ? (conqueredCount / totalTargets) * 100 : 0,
          news: newNews.slice(-5), 
          bubbles: newBubbles,
          flights: newFlights,
          gameWon,
          gameLost,
          isRunning: !gameWon && !gameLost
        };
      });
    }, intervalDuration);

    return () => clearInterval(tick);
  }, [gameState.isRunning, gameState.gameWon, gameState.gameLost, purchaseTech, gameState.timeScale]);

  return {
    gameState,
    startGame,
    purchaseTech,
    initializeProvinces,
    selectProvince,
    collectBubble
  };
};