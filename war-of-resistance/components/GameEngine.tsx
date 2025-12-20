import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActiveEnemy, EnemyType, GameStats, LevelConfig, WeaponType } from '../types';
import { ENEMIES, WEAPONS, SKILLS } from '../constants';
import { Target, Zap, Clock, RefreshCcw, Heart, AlertCircle, Skull } from 'lucide-react';

interface GameEngineProps {
  level: LevelConfig;
  selectedWeapon: WeaponType;
  onGameOver: (stats: GameStats) => void;
  onExit: () => void;
}

const MAX_HP = 100;

export const GameEngine: React.FC<GameEngineProps> = ({ level, selectedWeapon, onGameOver, onExit }) => {
  // Game State
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [timeLeft, setTimeLeft] = useState(level.duration);
  const [ammo, setAmmo] = useState(WEAPONS[selectedWeapon].magSize);
  const [isReloading, setIsReloading] = useState(false);
  const [combo, setCombo] = useState(0);
  const [enemies, setEnemies] = useState<ActiveEnemy[]>([]);
  const [feedback, setFeedback] = useState<{ id: number; x: number; y: number; text: string; color: string; scale?: number }[]>([]);
  const [damageFlash, setDamageFlash] = useState(false);
  
  // Skills State
  const [timeSlowActive, setTimeSlowActive] = useState(false);
  const [autoAimActive, setAutoAimActive] = useState(false);
  const [skillCooldowns, setSkillCooldowns] = useState({ timeSlow: 0, autoAim: 0 });

  // Refs
  const gameStateRef = useRef({
    score: 0,
    hp: MAX_HP,
    combo: 0,
    enemiesHit: 0,
    enemiesMissed: 0,
    shotsFired: 0,
    isPlaying: true,
    lastSpawn: 0,
    lastShot: 0,
    lastAutoAimShot: 0
  });

  const requestRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Weapon Stats
  const weaponConfig = WEAPONS[selectedWeapon];

  // Helper: Spawn Enemy
  const spawnEnemy = useCallback(() => {
    const types = Object.values(EnemyType);
    let type = EnemyType.INFANTRY;
    const rand = Math.random();
    
    if (rand > 0.95) type = EnemyType.SPECIAL;
    else if (rand > 0.85) type = EnemyType.CAVALRY;
    else if (rand > 0.70) type = EnemyType.MACHINE_GUNNER;
    else if (rand > 0.55) type = EnemyType.OFFICER;

    const newEnemy: ActiveEnemy = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: Math.random() * 80 + 10,
      y: Math.random() * 50 + 25,
      createdAt: Date.now(),
      maxDuration: ENEMIES[type].duration * 1000,
      hp: ENEMIES[type].hp,
      isDead: false,
      lastHit: 0
    };
    
    setEnemies(prev => [...prev, newEnemy]);
  }, []);

  // Helper: Add Feedback Text
  const addFeedback = (x: number, y: number, text: string, color: string = 'text-white', scale: number = 1) => {
    const id = Date.now() + Math.random();
    setFeedback(prev => [...prev, { id, x, y, text, color, scale }]);
    setTimeout(() => {
      setFeedback(prev => prev.filter(f => f.id !== id));
    }, 1000);
  };

  // Helper: Fire Weapon Logic
  const fireWeapon = useCallback((targetId?: string, clientX?: number, clientY?: number) => {
    const now = Date.now();
    
    // Fire Rate Check
    if (now - gameStateRef.current.lastShot < (60000 / weaponConfig.rpm)) return;
    
    // Reload Check
    if (isReloading || ammo <= 0) {
      if (ammo <= 0 && !isReloading) reload();
      return;
    }

    gameStateRef.current.lastShot = now;
    gameStateRef.current.shotsFired++;
    setAmmo(prev => prev - 1);
    
    // Recoil Visual
    if (containerRef.current) {
        containerRef.current.style.transform = `scale(1.02)`;
        setTimeout(() => {
            if(containerRef.current) containerRef.current.style.transform = `scale(1)`;
        }, 50);
    }

    if (ammo - 1 <= 0) {
      reload();
    }

    // Hit Detection
    let hitEnemy: ActiveEnemy | undefined;
    let isHeadshot = false;

    if (targetId) {
       // Auto aim always hits body for now (could randomize)
       hitEnemy = enemies.find(e => e.id === targetId);
    } else if (clientX && clientY && containerRef.current) {
        // DOM Check
        const elements = document.elementsFromPoint(clientX, clientY);
        // Check for specific parts
        const headElement = elements.find(el => el.getAttribute('data-part') === 'head');
        const bodyElement = elements.find(el => el.getAttribute('data-part') === 'body');
        const enemyElement = elements.find(el => el.getAttribute('data-enemy-id'));
        
        if (enemyElement) {
            const id = enemyElement.getAttribute('data-enemy-id');
            hitEnemy = enemies.find(e => e.id === id);
            
            if (headElement && hitEnemy) {
                isHeadshot = true;
            }
        }
    }

    if (hitEnemy && !hitEnemy.isDead) {
        // Damage Calculation
        const weaponDamage = weaponConfig.damage;
        let finalDamage = weaponDamage;
        
        if (isHeadshot) {
            finalDamage = 9999; // Instakill
        }

        // Apply Damage locally to determine outcome before state update
        const newHp = hitEnemy.hp - finalDamage;
        const isDead = newHp <= 0;

        // Update State
        setEnemies(prev => prev.map(e => {
            if (e.id === hitEnemy!.id) {
                return { ...e, hp: newHp, lastHit: Date.now() };
            }
            return e;
        }).filter(e => e.hp > 0)); // Remove if dead

        // Scoring & Feedback
        if (isDead) {
            const baseScore = ENEMIES[hitEnemy.type].score;
            let points = baseScore;
            
            // Combo
            const comboMult = Math.min(1 + (gameStateRef.current.combo * 0.1), 5); 
            points = Math.floor(points * comboMult);

            // Bonuses
            if (isHeadshot) points += 15;
            const progress = (now - hitEnemy.createdAt) / hitEnemy.maxDuration;
            if (progress > 0.7) points += 10; // Close range kill

            gameStateRef.current.score += points;
            gameStateRef.current.enemiesHit++;
            gameStateRef.current.combo++;
            
            setScore(gameStateRef.current.score);
            setCombo(gameStateRef.current.combo);

            addFeedback(
                hitEnemy.x, 
                hitEnemy.y - 10, 
                isHeadshot ? '爆头! FATAL' : `+${points}`, 
                isHeadshot ? 'text-yellow-400 font-black text-4xl drop-shadow-[0_2px_2px_rgba(255,0,0,0.8)]' : 'text-white',
                isHeadshot ? 1.5 : 1
            );
        } else {
            // Hit but not dead
            addFeedback(hitEnemy.x, hitEnemy.y, `${isHeadshot ? 'CRIT' : ''} -${finalDamage}`, 'text-red-400 font-bold', 0.8);
        }

    } else {
        // Miss logic
        gameStateRef.current.combo = 0;
        setCombo(0);
        if (!targetId && gameStateRef.current.score > 0) {
             gameStateRef.current.score = Math.max(0, gameStateRef.current.score - 5);
             setScore(gameStateRef.current.score);
        }
    }

  }, [ammo, isReloading, enemies, weaponConfig]);

  // Reload Action
  const reload = () => {
    if (isReloading) return;
    setIsReloading(true);
    setTimeout(() => {
      setAmmo(weaponConfig.magSize);
      setIsReloading(false);
    }, weaponConfig.reloadTime * 1000);
  };

  // Skill: Time Slow
  const activateTimeSlow = () => {
    if (skillCooldowns.timeSlow > 0 || timeSlowActive) return;
    setTimeSlowActive(true);
    setTimeout(() => setTimeSlowActive(false), SKILLS.TIME_SLOW.duration);
    setSkillCooldowns(prev => ({ ...prev, timeSlow: SKILLS.TIME_SLOW.cooldown }));
  };

  // Skill: Auto Aim
  const activateAutoAim = () => {
    if (skillCooldowns.autoAim > 0 || autoAimActive) return;
    setAutoAimActive(true);
    setTimeout(() => setAutoAimActive(false), SKILLS.AUTO_AIM.duration);
    setSkillCooldowns(prev => ({ ...prev, autoAim: SKILLS.AUTO_AIM.cooldown }));
  };

  // Game End Logic
  const finishGame = useCallback((outcome: 'VICTORY' | 'DEFEAT') => {
    gameStateRef.current.isPlaying = false;
    const stats: GameStats = {
        score: gameStateRef.current.score,
        maxCombo: gameStateRef.current.combo,
        enemiesHit: gameStateRef.current.enemiesHit,
        enemiesMissed: gameStateRef.current.enemiesMissed,
        accuracy: gameStateRef.current.shotsFired > 0 
            ? (gameStateRef.current.enemiesHit / gameStateRef.current.shotsFired) 
            : 0,
        outcome: outcome,
        hpRemaining: gameStateRef.current.hp
    };
    onGameOver(stats);
  }, [onGameOver]);

  // Main Game Loop
  const tick = useCallback((time: number) => {
    if (!gameStateRef.current.isPlaying) return;

    setSkillCooldowns(prev => ({
        timeSlow: Math.max(0, prev.timeSlow - 16),
        autoAim: Math.max(0, prev.autoAim - 16)
    }));

    const now = Date.now();
    const spawnRate = level.spawnRate; 
    if (now - gameStateRef.current.lastSpawn > spawnRate) {
        spawnEnemy();
        gameStateRef.current.lastSpawn = now;
    }

    setEnemies(prev => {
        const nextEnemies = [];
        let tookDamage = false;

        for (const enemy of prev) {
            const timeAlive = now - enemy.createdAt;
            const maxDur = timeSlowActive ? enemy.maxDuration * 2 : enemy.maxDuration;
            
            if (timeAlive > maxDur) {
                gameStateRef.current.enemiesMissed++;
                gameStateRef.current.combo = 0;
                setCombo(0);
                
                const dmg = ENEMIES[enemy.type].damage;
                gameStateRef.current.hp = Math.max(0, gameStateRef.current.hp - dmg);
                setHp(gameStateRef.current.hp);
                
                tookDamage = true;
                addFeedback(50, 50, `受到伤害! -${dmg}`, 'text-red-600 font-black text-4xl');

            } else {
                nextEnemies.push(enemy);
            }
        }

        if (tookDamage) {
            setDamageFlash(true);
            setTimeout(() => setDamageFlash(false), 200);
            if (gameStateRef.current.hp <= 0) {
                finishGame('DEFEAT');
            }
        }

        return nextEnemies;
    });

    if (autoAimActive) {
        if (now - gameStateRef.current.lastAutoAimShot > 300) { 
             if (enemies.length > 0) {
                 const sorted = [...enemies].sort((a, b) => {
                     const progA = (now - a.createdAt) / a.maxDuration;
                     const progB = (now - b.createdAt) / b.maxDuration;
                     return progB - progA;
                 });
                 // Auto aim hits center, usually body
                 fireWeapon(sorted[0].id);
                 gameStateRef.current.lastAutoAimShot = now;
             }
        }
    }

    if (gameStateRef.current.isPlaying) {
        requestRef.current = requestAnimationFrame(tick);
    }
  }, [level.spawnRate, timeSlowActive, autoAimActive, enemies, fireWeapon, spawnEnemy, finishGame]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    const timerInterval = setInterval(() => {
        if (!gameStateRef.current.isPlaying) return;
        setTimeLeft(prev => {
            if (prev <= 1) {
                clearInterval(timerInterval);
                finishGame('VICTORY');
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        clearInterval(timerInterval);
    };
  }, [tick, finishGame]);

  const handleClick = (e: React.MouseEvent) => {
      fireWeapon(undefined, e.clientX, e.clientY);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none cursor-none" onClick={handleClick}>
      
      {/* Background Layer */}
      <div className={`absolute inset-0 ${level.background} transition-colors duration-1000 opacity-90`} />
      
      {/* Game Area Container */}
      <div ref={containerRef} className="absolute inset-0 z-10 perspective-[1000px]">
          {enemies.map(enemy => {
              const enemyConfig = ENEMIES[enemy.type];
              const now = Date.now();
              const maxDur = timeSlowActive ? enemy.maxDuration * 2 : enemy.maxDuration;
              const progress = Math.min(1, (now - enemy.createdAt) / maxDur);
              const scale = 0.2 + (0.8 * progress);
              const isAttacking = progress > enemyConfig.attackStartPct;
              
              // Hit Effect Logic
              const isHitRecently = now - enemy.lastHit < 100;
              
              return (
                <div
                    key={enemy.id}
                    data-enemy-id={enemy.id}
                    className={`absolute flex items-end justify-center transform-gpu select-none`}
                    style={{
                        left: `${enemy.x}%`,
                        top: `${enemy.y}%`,
                        width: `${enemyConfig.width}vw`, 
                        height: `${enemyConfig.height}vh`,
                        maxWidth: '200px',
                        maxHeight: '200px',
                        transform: `translate(-50%, -50%) scale(${scale})`,
                        zIndex: Math.floor(scale * 100),
                        transition: 'transform 0.1s linear',
                        filter: isHitRecently ? 'brightness(3) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none'
                    }}
                >
                    {/* ENEMY BODY STRUCTURE */}
                    <div className="relative w-full h-full flex flex-col items-center">
                        
                        {/* Head - Critical Hit Area */}
                        <div 
                            data-part="head"
                            data-enemy-id={enemy.id}
                            className={`
                                relative z-20 w-[40%] h-[25%] -mb-1 rounded-full border border-black/20
                                bg-stone-300
                                ${isAttacking ? 'animate-pulse' : ''}
                            `}
                            style={{
                                backgroundColor: '#d4b49c', // Skin-ish tone
                                boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.3)'
                            }}
                        >
                            {/* Simple cap/helmet visualization */}
                             <div className="absolute top-0 inset-x-0 h-1/2 bg-yellow-900 rounded-t-full" />
                        </div>

                        {/* Body - Normal Hit Area */}
                        <div 
                            data-part="body"
                            data-enemy-id={enemy.id}
                            className={`
                                relative z-10 w-full h-[75%] rounded-t-lg shadow-lg border-2 border-black/30
                                ${enemyConfig.color}
                                ${isAttacking ? 'ring-2 ring-red-500 shadow-[0_0_15px_rgba(220,38,38,0.6)]' : ''}
                            `}
                        >
                            <div className="text-white/40 text-[10px] font-bold text-center mt-2 pointer-events-none">
                                {enemyConfig.name.substring(0, 2)}
                            </div>
                            
                            {/* HP Bar visible on hit or aim */}
                            {enemy.hp < enemyConfig.hp && (
                                <div className="absolute -bottom-3 left-0 w-full h-1 bg-black/50 rounded overflow-hidden">
                                    <div 
                                        className="h-full bg-red-500 transition-all duration-200"
                                        style={{ width: `${(enemy.hp / enemyConfig.hp) * 100}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              );
          })}

          {/* Feedback Text */}
          {feedback.map(f => (
              <div 
                key={f.id}
                className={`absolute pointer-events-none animate-[bounce_0.5s_ease-out] ${f.color} font-black z-50 whitespace-nowrap`}
                style={{ 
                    left: `${f.x}%`, 
                    top: `${f.y}%`, 
                    transform: `translate(-50%, -50%) scale(${f.scale || 1})`,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                  {f.text}
              </div>
          ))}
      </div>

      {/* Screen Effects */}
      {timeSlowActive && <div className="absolute inset-0 bg-blue-500 bg-opacity-10 pointer-events-none z-20 backdrop-blur-sm transition-all" />}
      {autoAimActive && <div className="absolute inset-0 border-4 border-red-500 pointer-events-none z-20 opacity-50" />}
      {damageFlash && <div className="absolute inset-0 bg-red-600 z-50 animate-ping-slow opacity-50" />}
      
      {isReloading && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <div className="bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg flex items-center gap-3 animate-pulse">
                  <RefreshCcw className="animate-spin" />
                  <span className="text-xl font-bold">装填中...</span>
              </div>
          </div>
      )}

      {/* HUD Layer */}
      <div className="absolute inset-0 pointer-events-none z-40 p-6 flex flex-col justify-between">
          
          <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                  <div className="bg-black bg-opacity-60 text-white p-4 rounded-br-2xl border-l-4 border-red-700 backdrop-blur-md min-w-[200px]">
                      <p className="text-sm text-gray-300 mb-1">生命值 HEALTH</p>
                      <div className="flex items-center gap-1">
                          {Array.from({length: Math.ceil(MAX_HP/20)}).map((_, i) => (
                              <Heart 
                                key={i} 
                                size={24} 
                                className={`${(i + 1) * 20 <= hp ? 'fill-red-600 text-red-600' : 'text-gray-600'}`} 
                              />
                          ))}
                          <span className="ml-2 text-xl font-bold">{hp}%</span>
                      </div>
                  </div>
                  
                  <div className="bg-black bg-opacity-60 text-white p-2 px-4 rounded-r-lg border-l-4 border-yellow-600 backdrop-blur-md w-fit">
                      <p className="text-xs text-gray-300">得分</p>
                      <p className="text-2xl font-black">{score.toLocaleString()}</p>
                  </div>
              </div>

              <div className={`bg-black bg-opacity-60 text-white p-4 rounded-bl-2xl border-r-4 border-red-700 backdrop-blur-md min-w-[150px] flex flex-col items-end ${timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}`}>
                  <p className="text-sm text-gray-300">坚守倒计时</p>
                  <div className="flex items-center gap-2">
                      <Clock size={24} />
                      <p className="text-4xl font-black">{timeLeft}s</p>
                  </div>
              </div>
          </div>

          <div className="flex justify-between items-end">
              <div className="bg-black bg-opacity-60 text-white p-4 rounded-tr-2xl border-l-4 border-red-700 backdrop-blur-md">
                   <p className="text-xl font-bold mb-1">{weaponConfig.name}</p>
                   <div className="flex gap-1 mb-2">
                       {Array.from({length: weaponConfig.magSize}).map((_, i) => (
                           <div key={i} className={`h-4 w-1.5 rounded-sm ${i < ammo ? 'bg-yellow-400' : 'bg-gray-700'}`} />
                       ))}
                   </div>
                   <p className="text-sm text-gray-400">{ammo} / {weaponConfig.magSize}</p>
              </div>

              <div className="flex gap-4 pointer-events-auto">
                   <button 
                     onClick={(e) => { e.stopPropagation(); activateTimeSlow(); }}
                     disabled={skillCooldowns.timeSlow > 0}
                     className="relative group bg-slate-800 p-3 rounded-full border-2 border-blue-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                   >
                       <Clock className="text-blue-400" size={32} />
                       {skillCooldowns.timeSlow > 0 && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-full text-white font-bold text-xs">
                               {(skillCooldowns.timeSlow / 1000).toFixed(0)}
                           </div>
                       )}
                   </button>
                   
                   <button 
                     onClick={(e) => { e.stopPropagation(); activateAutoAim(); }}
                     disabled={skillCooldowns.autoAim > 0}
                     className="relative group bg-slate-800 p-3 rounded-full border-2 border-red-500 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                   >
                       <Target className="text-red-500" size={32} />
                       {skillCooldowns.autoAim > 0 && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-full text-white font-bold text-xs">
                               {(skillCooldowns.autoAim / 1000).toFixed(0)}
                           </div>
                       )}
                   </button>
              </div>

              <div className={`bg-black bg-opacity-60 text-white p-4 rounded-tl-2xl border-r-4 border-yellow-500 backdrop-blur-md transition-all ${combo > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                  <p className="text-yellow-500 font-black italic text-right">COMBO</p>
                  <p className="text-5xl font-black text-yellow-400 drop-shadow-lg">x{combo}</p>
              </div>
          </div>
      </div>

      <div 
        className="fixed pointer-events-none z-50 mix-blend-difference"
        style={{
            left: -16,
            top: -16,
            transform: `translate(${useMousePosition().x}px, ${useMousePosition().y}px)`
        }}
      >
        <Target size={32} className="text-red-500 opacity-80" />
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onExit(); }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white/50 px-2 py-1 text-xs hover:bg-red-900/80 hover:text-white rounded pointer-events-auto"
      >
        退出关卡
      </button>

    </div>
  );
};

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  React.useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);
  return mousePosition;
};