import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Enemy, Projectile, GameState, WeaponSlot, EnemyType, WeaponType, Entity } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, SLOT_POSITIONS, ENEMY_STATS, WEAPON_STATS, SPAWN_X, INITIAL_GOLD, INITIAL_HP, WAVE_DELAY, TOWER_X } from '../constants';

interface GameContainerProps {
  onGameOver: (score: number) => void;
  gold: number;
  setGold: (g: number) => void;
  selectedSlot: number | null;
  setSelectedSlot: (i: number | null) => void;
  slots: WeaponSlot[];
  setSlots: React.Dispatch<React.SetStateAction<WeaponSlot[]>>;
  wave: number;
  setWave: (w: number) => void;
  hp: number;
  setHp: (h: number) => void;
}

const GameContainer: React.FC<GameContainerProps> = ({
  onGameOver,
  gold,
  setGold,
  selectedSlot,
  setSelectedSlot,
  slots,
  setSlots,
  wave,
  setWave,
  hp,
  setHp
}) => {
  // Game State Refs (Mutable for performance in loop)
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(0);
  const nextWaveTimerRef = useRef(0);
  const enemiesToSpawnRef = useRef<EnemyType[]>([]);
  const spawnTimerRef = useRef(0);
  
  // Refs to track props that are needed inside the closure
  const slotsRef = useRef(slots);
  const waveRef = useRef(wave);

  // Sync refs with props
  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  useEffect(() => {
    waveRef.current = wave;
  }, [wave]);
  
  // Visual state for React rendering (synced from refs occasionally or used for static elements)
  const [renderTrigger, setRenderTrigger] = useState(0); // Force re-render

  const gameLoopRef = useRef<number>();

  // Initialize slots only once
  useEffect(() => {
    if (slots.length === 0) {
      const initialSlots: WeaponSlot[] = SLOT_POSITIONS.map((_, i) => ({
        index: i,
        weaponType: null,
        cooldownTimer: 0,
        targetId: null,
        level: 1
      }));
      setSlots(initialSlots);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spawnEnemy = (type: EnemyType) => {
    const config = ENEMY_STATS[type];
    const yOffset = Math.random() * (GAME_HEIGHT - 200) + 100; // Random Y between 100 and height-100
    // Use window.innerWidth to ensure it spans at the right edge of the screen
    const actualSpawnX = Math.max(window.innerWidth, GAME_WIDTH) + 50; 
    
    // Use waveRef for scaling
    const currentWave = waveRef.current;
    
    const newEnemy: Enemy = {
      id: Date.now() + Math.random(),
      type,
      x: actualSpawnX,
      y: yOffset,
      hp: config.hp + (currentWave * 2), // HP scaling
      maxHp: config.hp + (currentWave * 2),
      speed: config.speed,
      frozen: 0
    };
    enemiesRef.current.push(newEnemy);
  };

  const prepareWave = (waveNum: number) => {
    const count = 5 + Math.floor(waveNum * 1.5);
    const queue: EnemyType[] = [];
    
    // Boss Wave
    if (waveNum % 5 === 0) {
        queue.push(EnemyType.BOSS);
        for(let i=0; i<count/2; i++) queue.push(EnemyType.ARMORED);
    } else {
        // Normal Wave Logic
        for (let i = 0; i < count; i++) {
            const rand = Math.random();
            if (waveNum > 2 && rand > 0.8) queue.push(EnemyType.ARMORED);
            else if (waveNum > 1 && rand > 0.6) queue.push(EnemyType.FAST);
            else queue.push(EnemyType.NORMAL);
        }
    }
    enemiesToSpawnRef.current = queue;
  };

  const gameTick = useCallback(() => {
    frameRef.current++;
    const currentWave = waveRef.current;
    const currentSlots = slotsRef.current;

    // 1. Spawning
    // Check start condition: Must have at least one weapon to start the first wave
    const hasBuiltFirstTower = currentSlots.some(s => s.weaponType !== null);
    
    // Only proceed with spawning logic if conditions are met
    // If it's wave 1, we wait for a tower. For later waves, we assume the game is ongoing.
    let spawningAllowed = true;
    if (currentWave === 1 && !hasBuiltFirstTower && enemiesRef.current.length === 0) {
        spawningAllowed = false;
    }

    if (spawningAllowed) {
        if (enemiesToSpawnRef.current.length > 0) {
            spawnTimerRef.current++;
            if (spawnTimerRef.current > 60) { // Spawn every second (approx)
                const type = enemiesToSpawnRef.current.shift();
                if (type) spawnEnemy(type);
                spawnTimerRef.current = 0;
            }
        } else {
            // Check if wave cleared
            if (enemiesRef.current.length === 0 && enemiesToSpawnRef.current.length === 0) {
                nextWaveTimerRef.current++;
                if (nextWaveTimerRef.current > WAVE_DELAY) {
                    const newWave = currentWave + 1;
                    setWave(newWave);
                    prepareWave(newWave);
                    nextWaveTimerRef.current = 0;
                }
            }
        }
    }

    // 2. Update Enemies
    enemiesRef.current.forEach(enemy => {
        enemy.x -= enemy.speed;
    });

    // Check Base Collision
    const survivingEnemies: Enemy[] = [];
    let dmgTaken = 0;
    
    enemiesRef.current.forEach(enemy => {
        if (enemy.x <= TOWER_X + 50) {
            // Hit base
            dmgTaken += 10;
        } else if (enemy.hp > 0) {
            survivingEnemies.push(enemy);
        } else {
            // Enemy Died
            scoreRef.current += ENEMY_STATS[enemy.type].reward * 10;
            setGold(prev => prev + ENEMY_STATS[enemy.type].reward);
        }
    });

    if (dmgTaken > 0) {
        setHp(prev => {
            const newHp = prev - dmgTaken;
            if (newHp <= 0) onGameOver(scoreRef.current);
            return newHp;
        });
    }
    enemiesRef.current = survivingEnemies;

    // 3. Weapons & Projectiles
    setSlots(prevSlots => {
        return prevSlots.map((slot, i) => {
            const pos = SLOT_POSITIONS[i];
            if (!slot.weaponType) return slot;

            const weapon = WEAPON_STATS[slot.weaponType];
            let newCooldown = slot.cooldownTimer > 0 ? slot.cooldownTimer - 1 : 0;
            let newTargetId = slot.targetId;
            
            // Level scaling
            const levelMultiplier = 1 + (slot.level - 1) * 0.5;
            const currentDamage = weapon.damage * levelMultiplier;
            
            // Dynamic Range Calculation
            // Ensure range is at least 75% of the larger screen dimension (Width or Height)
            // This covers "at least 2/3" (75% > 66%) and "vertical screen more" (height is used)
            const minEffectiveRange = Math.max(window.innerWidth, window.innerHeight) * 0.75;
            const currentRange = Math.max(weapon.range, minEffectiveRange);

            // Find Target
            if (slot.weaponType === WeaponType.LIGHTNING) {
                 // Beam Logic: Continuous damage if target is valid
                 const target = enemiesRef.current.find(e => e.id === slot.targetId);
                 if (target && target.x < pos.x + currentRange && target.x > pos.x) {
                    target.hp -= currentDamage;
                 } else {
                    // Find new target
                    const nearest = enemiesRef.current
                        .filter(e => e.x < pos.x + currentRange && e.x > pos.x)
                        .sort((a, b) => (a.x - pos.x) - (b.x - pos.x))[0];
                    newTargetId = nearest ? nearest.id : null;
                 }
            } else if (newCooldown === 0) {
                // Projectile Logic: Fire if enemy in range
                const nearest = enemiesRef.current
                    .filter(e => e.x < pos.x + currentRange && e.x > pos.x)
                    .sort((a, b) => (a.x - pos.x) - (b.x - pos.x))[0];

                if (nearest) {
                    newCooldown = weapon.cooldown; 
                    // Spawn Projectile
                    if (slot.weaponType === WeaponType.BOMB) {
                        projectilesRef.current.push({
                            id: Date.now() + Math.random(),
                            type: WeaponType.BOMB,
                            x: pos.x,
                            y: pos.y,
                            targetX: nearest.x,
                            targetY: nearest.y,
                            vx: 0, vy: 0,
                            sourceX: pos.x,
                            sourceY: pos.y,
                            progress: 0,
                            damage: currentDamage
                        });
                    } else if (slot.weaponType === WeaponType.GUN) {
                        // Calculate angle
                        const dx = nearest.x - pos.x;
                        const dy = nearest.y - pos.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        const speed = 10;
                        projectilesRef.current.push({
                            id: Date.now() + Math.random(),
                            type: WeaponType.GUN,
                            x: pos.x,
                            y: pos.y,
                            targetX: 0, targetY: 0,
                            vx: (dx / dist) * speed,
                            vy: (dy / dist) * speed,
                            sourceX: 0, sourceY: 0,
                            progress: 0,
                            damage: currentDamage
                        });
                    }
                }
            }

            return { ...slot, cooldownTimer: newCooldown, targetId: newTargetId };
        });
    });

    // 4. Update Projectiles
    const activeProjectiles: Projectile[] = [];
    const maxWidth = Math.max(window.innerWidth, GAME_WIDTH) + 200; 
    
    projectilesRef.current.forEach(proj => {
        if (proj.type === WeaponType.GUN) {
            proj.x += proj.vx;
            proj.y += proj.vy;

            // Simple Circle Collision
            const hit = enemiesRef.current.find(e => {
                const dx = e.x - proj.x;
                const dy = e.y - proj.y;
                return Math.sqrt(dx*dx + dy*dy) < 30; // Hitbox radius
            });

            if (hit) {
                hit.hp -= proj.damage;
                // Bullet destroyed
            } else if (proj.x < maxWidth && proj.x > 0 && proj.y < GAME_HEIGHT && proj.y > 0) {
                activeProjectiles.push(proj);
            }
        } else if (proj.type === WeaponType.BOMB) {
            proj.progress += 0.02;
            if (proj.progress >= 1) {
                // Boom
                enemiesRef.current.forEach(e => {
                    const dx = e.x - proj.targetX;
                    const dy = e.y - proj.targetY;
                    if (Math.sqrt(dx*dx + dy*dy) < 100) { // AoE Radius
                        e.hp -= proj.damage;
                    }
                });
            } else {
                // Parabolic math
                // Linear X
                const currX = proj.sourceX + (proj.targetX - proj.sourceX) * proj.progress;
                // Parabolic Y: Linear Y - Height factor
                const linearY = proj.sourceY + (proj.targetY - proj.sourceY) * proj.progress;
                const arcHeight = 150; // Max height of arc
                const arc = 4 * arcHeight * proj.progress * (1 - proj.progress); // 0 at start, max at 0.5, 0 at end
                proj.x = currX;
                proj.y = linearY - arc;
                activeProjectiles.push(proj);
            }
        }
    });
    projectilesRef.current = activeProjectiles;

    setRenderTrigger(prev => prev + 1);
    gameLoopRef.current = requestAnimationFrame(gameTick);
  }, [setGold, setHp, setWave, onGameOver, setSlots]); // removed 'gold', 'wave' etc from dependency to avoid loop recreation

  // Start Loop
  useEffect(() => {
    prepareWave(1);
    gameLoopRef.current = requestAnimationFrame(gameTick);
    return () => {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Render Helpers ---

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden shadow-inner cursor-crosshair">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-10 right-20 text-4xl opacity-20">🌙</div>
        <div className="absolute top-32 left-40 text-xs text-yellow-100 opacity-20">✨</div>
        <div className="absolute top-10 left-80 text-xs text-yellow-100 opacity-20">✨</div>

        {/* Huge Tower Emoji - Visual Only */}
        <div className="absolute -left-[50px] top-1/2 -translate-y-1/2 z-0 select-none pointer-events-none opacity-100 flex items-center justify-center">
             <div className="text-[600px] leading-none drop-shadow-[0_0_25px_rgba(236,72,153,0.3)] filter brightness-110">🗼</div>
        </div>

        {/* Health Bar - Repositioned to top-left fixed relative to container */}
        <div className="absolute top-20 left-4 z-10 w-48">
            <div className="bg-gray-800 w-full h-4 rounded-full border border-gray-600 overflow-hidden relative shadow-lg">
                <div 
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${(hp / INITIAL_HP) * 100}%` }}
                />
            </div>
            <div className="text-center text-white font-bold drop-shadow-md mt-1">
                Base HP: {Math.floor(hp)}
            </div>
        </div>

        {/* Weapon Slots */}
        {slots.map((slot, i) => {
            const pos = SLOT_POSITIONS[i];
            const isSelected = selectedSlot === i;
            const weapon = slot.weaponType ? WEAPON_STATS[slot.weaponType] : null;

            return (
                <div 
                    key={i}
                    onClick={() => setSelectedSlot(i)}
                    className={`absolute w-12 h-12 flex items-center justify-center rounded-lg cursor-pointer transition-transform z-20
                        ${isSelected ? 'ring-2 ring-yellow-400 scale-110 bg-white/10' : 'bg-black/20 hover:bg-white/5'}
                    `}
                    style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
                >
                    {weapon ? (
                        <div className="text-3xl relative">
                            {weapon.emoji}
                            
                            {/* Level Indicator */}
                            {slot.level > 1 && (
                                <div className="absolute -top-3 -right-3 bg-yellow-500 text-black text-[10px] font-bold px-1.5 rounded-full border border-white">
                                    Lv.{slot.level}
                                </div>
                            )}

                            {/* Cooldown overlay */}
                            {slot.cooldownTimer > 0 && (
                                <div className="absolute inset-0 bg-red-500/30 rounded-full animate-pulse"></div>
                            )}
                        </div>
                    ) : (
                        <div className="text-xl opacity-50 animate-pulse">⬜</div>
                    )}
                </div>
            );
        })}

        {/* Enemies */}
        {enemiesRef.current.map(enemy => (
            <div
                key={enemy.id}
                className="absolute transition-none flex flex-col items-center justify-center"
                style={{
                    left: enemy.x,
                    top: enemy.y,
                    transform: `translate(-50%, -50%) scale(${ENEMY_STATS[enemy.type].size})`,
                    zIndex: Math.floor(enemy.y)
                }}
            >
                {/* HP Bar */}
                <div className="w-10 h-1 bg-red-900 mb-1">
                    <div className="h-full bg-green-500" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
                </div>
                <div className="text-4xl relative">
                    {/* Render Armored enemies with a shield overlay */}
                    {enemy.type === EnemyType.ARMORED ? (
                         <span className="relative">
                            <span className="absolute left-[-5px] z-10">🛡️</span>
                            <span>⛄</span>
                         </span>
                    ) : (
                        ENEMY_STATS[enemy.type].emoji
                    )}
                </div>
            </div>
        ))}

        {/* Projectiles */}
        {projectilesRef.current.map(proj => (
            <div
                key={proj.id}
                className="absolute text-xl z-30 pointer-events-none"
                style={{
                    left: proj.x,
                    top: proj.y,
                    transform: `translate(-50%, -50%) ${proj.type === WeaponType.GUN ? `rotate(${Math.atan2(proj.vy, proj.vx)}rad)` : ''}`
                }}
            >
                {WEAPON_STATS[proj.type].emoji}
            </div>
        ))}

        {/* Lightning Beams (SVG Overlay) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            {slots.map((slot, i) => {
                if (slot.weaponType === WeaponType.LIGHTNING && slot.targetId) {
                    const target = enemiesRef.current.find(e => e.id === slot.targetId);
                    if (target) {
                        const start = SLOT_POSITIONS[i];
                        // Create a jagged path
                        const midX = (start.x + target.x) / 2;
                        const midY = (start.y + target.y) / 2 + (Math.random() * 20 - 10);
                        return (
                            <path 
                                key={`beam-${i}`}
                                d={`M ${start.x} ${start.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
                                stroke="#fde047"
                                strokeWidth="3"
                                fill="none"
                                className="drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
                            />
                        );
                    }
                }
                return null;
            })}
        </svg>
        
        {/* Wave Status */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 text-white px-6 py-2 rounded-full border border-white/20 backdrop-blur-sm z-50 flex gap-4">
            <div>
                <span className="font-bold text-yellow-400">WAVE {wave}</span>
                <span className="mx-2 text-gray-400">|</span>
                {enemiesToSpawnRef.current.length > 0 ? (
                    <span className="text-xs text-red-300 animate-pulse">Incoming: {enemiesToSpawnRef.current.length}</span>
                ) : (
                    <span className="text-xs text-green-300">Wave Cleared</span>
                )}
            </div>
            
            {/* Start hint */}
            {wave === 1 && !slots.some(s => s.weaponType) && (
                <div className="text-yellow-200 animate-pulse font-bold bg-pink-900/50 px-2 rounded">
                    ⚠️ Build a tower to start!
                </div>
            )}
        </div>

    </div>
  );
};

export default GameContainer;