import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ENEMY_TYPES, LEVEL_1, TOWER_TYPES, TILE_SIZE, FPS } from '../constants';
import { Enemy, GameState, Projectile, TileType, Tower, Wave, Particle } from '../types';
import { getDistance, getEntityPosition } from '../utils/gameLogic';
import { MapRenderer } from './MapRenderer';
import { EntityLayer } from './EntityLayer';
import { UIOverlay } from './UIOverlay';

interface GameProps {
  onGameOver: (victory: boolean) => void;
  onExit: () => void;
}

export const Game: React.FC<GameProps> = ({ onGameOver, onExit }) => {
  const lastTimeRef = useRef<number>(0);
  const enemiesRef = useRef<Enemy[]>([]);
  const towersRef = useRef<Tower[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const incomeTimerRef = useRef<number>(0);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const waveStateRef = useRef({
    waveIndex: 0,
    enemiesSpawned: 0,
    timeSinceLastSpawn: 0,
    waveComplete: false,
    gameWon: false,
    gameLost: false
  });
  
  const [gold, setGold] = useState(LEVEL_1.startingGold);
  const [lives, setLives] = useState(LEVEL_1.startingLives);
  const [currentWave, setCurrentWave] = useState(1);
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number} | null>(null);
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [hoveredTowerId, setHoveredTowerId] = useState<string | null>(null);
  const [uiRefresh, setUiRefresh] = useState(0);

  const spawnEnemy = (typeId: string) => {
    const typeDef = ENEMY_TYPES[typeId];
    const newEnemy: Enemy = {
      id: Math.random().toString(36).substr(2, 9),
      typeId,
      hp: typeDef.maxHp,
      maxHp: typeDef.maxHp,
      x: LEVEL_1.path[0].x,
      y: LEVEL_1.path[0].y,
      pathIndex: 0,
      progress: 0,
      frozenFactor: 1,
      effects: [],
      lastHitTime: 0
    };
    enemiesRef.current.push(newEnemy);
  };

  const createParticle = (x: number, y: number, emoji: string, count: number = 1, baseScale: number = 1.0) => {
    for(let i = 0; i < count; i++) {
        particlesRef.current.push({
            id: Math.random().toString(),
            x,
            y,
            emoji,
            life: 1.0,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            scale: (0.3 + Math.random() * 0.5) * baseScale
        });
    }
  };

  const handleGameLoop = useCallback((timestamp: number) => {
    if (waveStateRef.current.gameLost || waveStateRef.current.gameWon) return;

    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    const frameDt = Math.min(dt, 0.1);

    // 1. Spawning Logic
    const currentWaveConfig = LEVEL_1.waves[waveStateRef.current.waveIndex];
    if (currentWaveConfig) {
      waveStateRef.current.timeSinceLastSpawn += frameDt;
      const isInitialDelayOver = waveStateRef.current.enemiesSpawned > 0 || waveStateRef.current.timeSinceLastSpawn > currentWaveConfig.initialDelay;
      
      if (isInitialDelayOver && waveStateRef.current.enemiesSpawned < currentWaveConfig.count) {
        if (waveStateRef.current.timeSinceLastSpawn > currentWaveConfig.interval) {
          spawnEnemy(currentWaveConfig.enemyTypeId);
          waveStateRef.current.enemiesSpawned++;
          waveStateRef.current.timeSinceLastSpawn = 0;
        }
      } else if (waveStateRef.current.enemiesSpawned >= currentWaveConfig.count && enemiesRef.current.length === 0) {
        if (waveStateRef.current.waveIndex < LEVEL_1.waves.length - 1) {
          waveStateRef.current.waveIndex++;
          waveStateRef.current.enemiesSpawned = 0;
          waveStateRef.current.timeSinceLastSpawn = 0;
          setCurrentWave(w => w + 1);
        } else {
          waveStateRef.current.gameWon = true;
          onGameOver(true);
        }
      }
    }

    // 2. Tower & Economy Logic
    incomeTimerRef.current += frameDt;
    let goldToGain = 0;
    const isIncomeTick = incomeTimerRef.current >= 1.0;
    if (isIncomeTick) incomeTimerRef.current -= 1.0;

    towersRef.current.forEach(tower => {
      tower.lastShotTime += frameDt;
      if (tower.firePulse > 0) tower.firePulse -= frameDt * 10; 
      if (tower.firePulse < 0) tower.firePulse = 0;

      const def = TOWER_TYPES[tower.typeId];

      // Handle Passive Income
      if (isIncomeTick && def.type === 'ECONOMY' && def.income) {
          goldToGain += def.income;
          createParticle(tower.x, tower.y, '✨', 1, 0.5);
      }

      // Handle Combat
      if (def.type !== 'ECONOMY' && tower.lastShotTime >= def.cooldown) {
        let target: Enemy | null = null;
        let maxProgress = -1;

        for (const enemy of enemiesRef.current) {
          const dist = getDistance(tower, enemy);
          if (dist <= def.range) {
            const totalProgress = enemy.pathIndex + enemy.progress;
            if (totalProgress > maxProgress) {
              maxProgress = totalProgress;
              target = enemy;
            }
          }
        }

        if (target) {
          projectilesRef.current.push({
            id: Math.random().toString(),
            x: tower.x,
            y: tower.y,
            startX: tower.x,
            startY: tower.y,
            targetId: target.id,
            damage: def.damage,
            speed: 12, 
            emoji: def.type === 'SLOW' ? '❄️' : (def.type === 'AREA' ? '💣' : '💩'),
            splashRadius: def.type === 'AREA' ? 1.5 : 0,
            effect: def.type === 'SLOW' ? { type: 'SLOW', duration: 2, value: 0.5 } : undefined,
            progress: 0
          });
          tower.lastShotTime = 0;
          tower.firePulse = 1.0; 
        }
      }
    });

    if (goldToGain > 0) setGold(g => g + goldToGain);

    // 3. Projectile Logic
    for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
      const p = projectilesRef.current[i];
      const target = enemiesRef.current.find(e => e.id === p.targetId);
      
      let targetX = p.x;
      let targetY = p.y;

      if (target) {
        targetX = target.x;
        targetY = target.y;
      } else if (p.progress < 1) {
         if (p.splashRadius === 0) {
           projectilesRef.current.splice(i, 1);
           continue;
         }
      }

      const dist = getDistance(p, {x: targetX, y: targetY});
      const moveDist = p.speed * frameDt;

      if (dist <= moveDist) {
        if (p.splashRadius && p.splashRadius > 0) {
            createParticle(targetX, targetY, '💥', 3, 1.2);
            enemiesRef.current.forEach(e => {
                if (getDistance({x: targetX, y: targetY}, e) <= p.splashRadius!) {
                    hitEnemy(e, p.damage, p.effect);
                }
            });
        } else if (target) {
            hitEnemy(target, p.damage, p.effect);
        }
        projectilesRef.current.splice(i, 1);
      } else {
        const angle = Math.atan2(targetY - p.y, targetX - p.x);
        p.x += Math.cos(angle) * moveDist;
        p.y += Math.sin(angle) * moveDist;
      }
    }

    // 4. Enemy Logic
    for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
      const enemy = enemiesRef.current[i];
      const typeDef = ENEMY_TYPES[enemy.typeId];
      
      if (enemy.lastHitTime > 0) enemy.lastHitTime -= frameDt * 10;
      
      enemy.frozenFactor = 1;
      enemy.effects = enemy.effects.filter(e => {
        e.duration -= frameDt;
        if (e.type === 'SLOW') enemy.frozenFactor = e.value;
        return e.duration > 0;
      });

      const moveSpeed = typeDef.speed * enemy.frozenFactor * frameDt;
      enemy.progress += moveSpeed;

      if (enemy.progress >= 1) {
        enemy.pathIndex++;
        enemy.progress -= 1;
      }

      if (enemy.pathIndex >= LEVEL_1.path.length - 1) {
        setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
                waveStateRef.current.gameLost = true;
                onGameOver(false);
            }
            return newLives;
        });
        enemiesRef.current.splice(i, 1);
      } else {
        const pos = getEntityPosition(LEVEL_1.path, enemy.pathIndex, enemy.progress);
        enemy.x = pos.x;
        enemy.y = pos.y;
      }
    }

    // 5. Particles Logic
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life -= frameDt * 5; 
        p.x += p.vx * frameDt;
        p.y += p.vy * frameDt;
        if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
        }
    }

    setUiRefresh(prev => prev + 1);
    requestAnimationFrame(handleGameLoop);
  }, [onGameOver]);

  useEffect(() => {
    requestAnimationFrame((time) => {
        lastTimeRef.current = time;
        handleGameLoop(time);
    });
  }, [handleGameLoop]);

  const hitEnemy = (enemy: Enemy, damage: number, effect?: any) => {
    enemy.hp -= damage;
    enemy.lastHitTime = 1.0;
    createParticle(enemy.x, enemy.y, '💢', 1, 0.6);
    
    if (effect) {
        const existing = enemy.effects.find(e => e.type === effect.type);
        if (existing) {
            existing.duration = Math.max(existing.duration, effect.duration);
        } else {
            enemy.effects.push({...effect});
        }
    }
    
    if (enemy.hp <= 0) {
      setGold(g => g + ENEMY_TYPES[enemy.typeId].reward);
      createParticle(enemy.x, enemy.y, '✨', 4, 1.0);
      const idx = enemiesRef.current.indexOf(enemy);
      if (idx > -1) enemiesRef.current.splice(idx, 1);
    }
  };

  const handleTileClick = (x: number, y: number) => {
    const existingTower = towersRef.current.find(t => t.x === x && t.y === y);
    if (existingTower) {
        setSelectedTowerId(existingTower.id);
        setSelectedTile(null);
    } else {
        if (LEVEL_1.map[y][x] === 0) {
            setSelectedTile({x, y});
            setSelectedTowerId(null);
        } else {
            setSelectedTile(null);
            setSelectedTowerId(null);
        }
    }
  };

  const handleTileHover = (x: number, y: number) => {
    const existingTower = towersRef.current.find(t => t.x === x && t.y === y);
    setHoveredTowerId(existingTower ? existingTower.id : null);
  };

  const handleBuild = (towerTypeId: string) => {
    if (!selectedTile) return;
    const def = TOWER_TYPES[towerTypeId];
    if (gold >= def.cost) {
      setGold(g => g - def.cost);
      towersRef.current.push({
        id: Math.random().toString(),
        typeId: towerTypeId,
        x: selectedTile.x,
        y: selectedTile.y,
        lastShotTime: 0,
        totalDamageDealt: 0,
        firePulse: 0
      });
      setSelectedTile(null);
    }
  };

  const handleUpgrade = (upgradeId: string) => {
    const tower = towersRef.current.find(t => t.id === selectedTowerId);
    if (!tower) return;
    const def = TOWER_TYPES[upgradeId];
    if (gold >= def.cost) {
        setGold(g => g - def.cost);
        tower.typeId = upgradeId;
        setSelectedTowerId(null);
    }
  };

  const handleSell = () => {
     const towerIdx = towersRef.current.findIndex(t => t.id === selectedTowerId);
     if (towerIdx > -1) {
         const tower = towersRef.current[towerIdx];
         const def = TOWER_TYPES[tower.typeId];
         setGold(g => g + Math.floor(def.cost * 0.5));
         towersRef.current.splice(towerIdx, 1);
         setSelectedTowerId(null);
         setHoveredTowerId(null);
     }
  };

  // Calculate Wave Stats
  const totalWaves = LEVEL_1.waves.length;
  const currentWaveConfig = LEVEL_1.waves[waveStateRef.current.waveIndex];
  const waveEnemiesTotal = currentWaveConfig ? currentWaveConfig.count : 0;
  
  // Active enemies + Enemies yet to spawn in this wave
  const enemiesAlive = enemiesRef.current.length;
  const enemiesToSpawn = currentWaveConfig ? Math.max(0, currentWaveConfig.count - waveStateRef.current.enemiesSpawned) : 0;
  const waveEnemiesRemaining = enemiesAlive + enemiesToSpawn;

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-900">
        <div className="flex-grow relative overflow-hidden flex justify-center items-center">
            <div ref={mapRef} className="relative shadow-2xl border-4 border-gray-700 rounded-lg overflow-hidden bg-gray-800" style={{ width: 10 * TILE_SIZE, height: 10 * TILE_SIZE }}>
                <MapRenderer 
                    map={LEVEL_1.map} 
                    tileSize={TILE_SIZE} 
                    onTileClick={handleTileClick}
                    onTileHover={handleTileHover}
                    selectedPos={selectedTile}
                    selectedTowerPos={selectedTowerId ? towersRef.current.find(t => t.id === selectedTowerId) : undefined}
                />
                <EntityLayer 
                    enemies={enemiesRef.current} 
                    towers={towersRef.current} 
                    projectiles={projectilesRef.current}
                    particles={particlesRef.current}
                    tileSize={TILE_SIZE}
                    selectedTowerId={selectedTowerId}
                    hoveredTowerId={hoveredTowerId}
                    mapRef={mapRef}
                />
            </div>
        </div>

        <UIOverlay 
            gold={gold} 
            lives={lives} 
            wave={currentWave}
            totalWaves={totalWaves}
            waveEnemiesRemaining={waveEnemiesRemaining}
            waveEnemiesTotal={waveEnemiesTotal}
            selectedTile={selectedTile}
            selectedTower={selectedTowerId ? towersRef.current.find(t => t.id === selectedTowerId) : null}
            onBuild={handleBuild}
            onUpgrade={handleUpgrade}
            onSell={handleSell}
            onDeselect={() => { setSelectedTile(null); setSelectedTowerId(null); }}
            onExit={onExit}
        />
    </div>
  );
};