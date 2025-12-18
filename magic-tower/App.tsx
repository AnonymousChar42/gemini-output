import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TileType, 
  PlayerState, 
  MonsterDef, 
  CombatResult,
  GameMap
} from './types';
import { 
  BOARD_SIZE, 
  INITIAL_MAPS, 
  INITIAL_PLAYER_STATE, 
  MONSTERS, 
  ITEM_VALUES,
  TILE_INFO
} from './constants';

// --- Helper Components ---

interface TileRenderProps {
  type: TileType;
  x: number;
  y: number;
  onHover: (type: TileType, e: React.MouseEvent) => void;
  onLeave: () => void;
}

const TileRender: React.FC<TileRenderProps> = React.memo(({ type, onHover, onLeave }) => {
  let content = "";
  let className = "w-full h-full flex items-center justify-center text-xl md:text-2xl select-none transition-all duration-200";
  
  // Backgrounds
  let bgClass = "bg-slate-800"; // Empty floor

  switch (type) {
    case TileType.WALL:
      bgClass = "bg-slate-600 border border-slate-500 shadow-inner";
      content = ""; 
      break;
    case TileType.HERO:
      content = "🧙‍♂️";
      break;
    case TileType.STAIRS_UP:
      content = "⏫";
      break;
    case TileType.STAIRS_DOWN:
      content = "⏬";
      break;
    case TileType.KEY_YELLOW:
      content = "🔑";
      className += " text-yellow-400 drop-shadow-md";
      break;
    case TileType.KEY_BLUE:
      content = "🔑";
      className += " text-blue-400 drop-shadow-md";
      break;
    case TileType.KEY_RED:
      content = "🔑";
      className += " text-red-500 drop-shadow-md";
      break;
    case TileType.DOOR_YELLOW:
      bgClass = "bg-yellow-900 border border-yellow-600";
      content = "🚪";
      break;
    case TileType.DOOR_BLUE:
      bgClass = "bg-blue-900 border border-blue-600";
      content = "🚪";
      break;
    case TileType.DOOR_RED:
      bgClass = "bg-red-900 border border-red-600";
      content = "🚪";
      break;
    case TileType.POTION_RED:
      content = "🍷";
      break;
    case TileType.POTION_BLUE:
      content = "🧪";
      break;
    case TileType.GEM_RED:
      content = "💎";
      className += " text-red-500";
      break;
    case TileType.GEM_BLUE:
      content = "💎";
      className += " text-blue-400";
      break;
    case TileType.SWORD:
      content = "🗡️";
      break;
    case TileType.SHIELD:
      content = "🛡️";
      break;
    case TileType.NPC_MERCHANT:
      content = "🎅";
      break;
    default:
      if (MONSTERS[type]) {
        content = MONSTERS[type].symbol;
        className += ` ${MONSTERS[type].color} animate-pulse`;
      }
      break;
  }
  
  // Add cursor-help if it's an interactive item or monster
  if (MONSTERS[type] || TILE_INFO[type]) {
      className += " cursor-help";
  }

  return (
    <div 
      className={`${className} ${bgClass}`} 
      onMouseEnter={(e) => onHover(type, e)}
      onMouseLeave={onLeave}
    >
      {content}
    </div>
  );
});

// --- Tooltip Component ---

interface TooltipProps {
  tileType: TileType;
  player: PlayerState;
  position: { x: number, y: number };
  calculateCombat: (mid: number, p: PlayerState) => CombatResult;
}

const InfoTooltip: React.FC<TooltipProps> = ({ tileType, player, position, calculateCombat }) => {
  const monster = MONSTERS[tileType];
  const tileInfo = TILE_INFO[tileType];

  if (!monster && !tileInfo) return null;

  return (
    <div 
      className="fixed z-50 pointer-events-none min-w-[150px] max-w-[200px] bg-black/90 border border-slate-500 rounded-lg p-3 shadow-2xl text-white text-sm"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -110%)' // Center horizontally, sit above the cursor
      }}
    >
      {/* Monster Tooltip */}
      {monster && (
        <>
          <div className="flex items-center gap-2 border-b border-slate-700 pb-2 mb-2">
            <span className="text-2xl">{monster.symbol}</span>
            <span className={`font-bold ${monster.color}`}>{monster.name}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-y-1 mb-2">
            <div className="text-red-400">HP: <span className="text-white">{monster.hp}</span></div>
            <div className="text-yellow-400">Gold: <span className="text-white">{monster.gold}</span></div>
            <div className="text-orange-400">ATK: <span className="text-white">{monster.atk}</span></div>
            <div className="text-purple-400">XP: <span className="text-white">{monster.xp}</span></div>
            <div className="text-blue-400">DEF: <span className="text-white">{monster.def}</span></div>
          </div>

          <div className="border-t border-slate-700 pt-2 text-center">
            {(() => {
                const result = calculateCombat(tileType, player);
                const playerDmg = player.atk - monster.def;
                if (playerDmg <= 0) return <div className="text-red-500 font-bold uppercase">Undefeatable</div>;
                if (result.canBeat) return (
                  <div className="text-green-400">
                    Lose <span className="font-bold">{result.damageTaken}</span> HP 
                    <span className="text-yellow-400 ml-1 text-xs">(+{monster.gold}G)</span>
                  </div>
                );
                return <div className="text-red-500 font-bold uppercase">Too Dangerous</div>;
            })()}
          </div>
        </>
      )}

      {/* Item/Prop Tooltip */}
      {!monster && tileInfo && (
          <div className="text-center">
             <div className="font-bold text-yellow-500 border-b border-slate-700 pb-1 mb-1">{tileInfo.name}</div>
             <div className="text-slate-300">{tileInfo.description}</div>
          </div>
      )}
    </div>
  );
};

// --- Shop Component ---

interface ShopProps {
  player: PlayerState;
  onBuy: (cost: number, stat: 'hp' | 'atk' | 'def', amount: number) => void;
  onClose: () => void;
}

const ShopModal: React.FC<ShopProps> = ({ player, onBuy, onClose }) => {
  const PRICE = 25;
  const HP_GAIN = 400;
  const ATK_GAIN = 4;
  const DEF_GAIN = 4;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-800 border-4 border-yellow-600 rounded-lg p-6 max-w-md w-full shadow-2xl relative">
        <h2 className="text-3xl text-yellow-500 font-bold text-center mb-2">🎅 Greedy Merchant</h2>
        <p className="text-slate-300 text-center mb-6 italic">"Gold makes you stronger! What will it be?"</p>
        
        <div className="bg-black/50 p-3 rounded mb-6 flex justify-between items-center">
           <span className="text-xl">Your Gold:</span>
           <span className="text-2xl font-bold text-yellow-400">{player.gold}</span>
        </div>

        <div className="space-y-3">
          <button 
            disabled={player.gold < PRICE}
            onClick={() => onBuy(PRICE, 'hp', HP_GAIN)}
            className="w-full flex justify-between items-center p-4 bg-red-900/50 hover:bg-red-800 border border-red-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-bold text-red-200">Increase HP (+{HP_GAIN})</span>
            <span className="text-yellow-400 font-mono font-bold">{PRICE} G</span>
          </button>

          <button 
            disabled={player.gold < PRICE}
            onClick={() => onBuy(PRICE, 'atk', ATK_GAIN)}
            className="w-full flex justify-between items-center p-4 bg-orange-900/50 hover:bg-orange-800 border border-orange-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-bold text-orange-200">Increase ATK (+{ATK_GAIN})</span>
            <span className="text-yellow-400 font-mono font-bold">{PRICE} G</span>
          </button>

          <button 
             disabled={player.gold < PRICE}
             onClick={() => onBuy(PRICE, 'def', DEF_GAIN)}
             className="w-full flex justify-between items-center p-4 bg-blue-900/50 hover:bg-blue-800 border border-blue-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-bold text-blue-200">Increase DEF (+{DEF_GAIN})</span>
            <span className="text-yellow-400 font-mono font-bold">{PRICE} G</span>
          </button>
        </div>

        <button 
          onClick={onClose}
          className="mt-6 w-full py-3 bg-slate-700 hover:bg-slate-600 rounded text-white font-bold"
        >
          Leave Shop
        </button>
      </div>
    </div>
  );
};


// --- Main App ---

export default function App() {
  // --- State ---
  const [maps, setMaps] = useState<number[][][]>(() => 
    // Deep copy initial maps to allow modification
    JSON.parse(JSON.stringify(INITIAL_MAPS))
  );
  
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [messages, setMessages] = useState<string[]>(["Welcome to the Magic Tower!"]);
  const [shake, setShake] = useState(false); // For damage feedback
  const [showShop, setShowShop] = useState(false);
  
  // Hover State
  const [hoveredTile, setHoveredTile] = useState<{ type: TileType, rect: DOMRect } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const log = (msg: string) => {
    setMessages(prev => [...prev.slice(-4), msg]);
  };

  const getTile = (floor: number, x: number, y: number) => {
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return TileType.WALL;
    return maps[floor][y][x];
  };

  const setTile = (floor: number, x: number, y: number, type: TileType) => {
    setMaps(prev => {
      const newMaps = [...prev];
      const newFloor = [...newMaps[floor]];
      const newRow = [...newFloor[y]];
      newRow[x] = type;
      newFloor[y] = newRow;
      newMaps[floor] = newFloor;
      return newMaps;
    });
  };

  const calculateCombat = useCallback((monsterId: number, currentStats: PlayerState): CombatResult => {
    const monster = MONSTERS[monsterId];
    if (!monster) return { canBeat: false, damageTaken: 0 };

    const playerDmg = currentStats.atk - monster.def;
    const monsterDmg = monster.atk - currentStats.def;

    if (playerDmg <= 0) return { canBeat: false, damageTaken: 999999 };

    // Attacks required to kill monster
    const turns = Math.ceil(monster.hp / playerDmg);
    
    // Damage taken (Classic Magic Tower: Player attacks first.)
    const hitsTaken = turns - 1;
    let totalDamage = hitsTaken * Math.max(0, monsterDmg);
    
    if (totalDamage < 0) totalDamage = 0;

    return {
      canBeat: currentStats.hp > totalDamage,
      damageTaken: totalDamage
    };
  }, []); // Stable combat calc

  // --- Logic ---

  const handleBuyStat = (cost: number, stat: 'hp' | 'atk' | 'def', amount: number) => {
     if (player.gold >= cost) {
       setPlayer(prev => ({
         ...prev,
         gold: prev.gold - cost,
         [stat]: prev[stat] + amount
       }));
       if (stat === 'hp') log(`Bought +${amount} HP`);
       if (stat === 'atk') log(`Bought +${amount} ATK`);
       if (stat === 'def') log(`Bought +${amount} DEF`);
     }
  };

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (showShop) return; // Disable movement if shop is open

    const newX = player.x + dx;
    const newY = player.y + dy;
    const targetTile = getTile(player.floor, newX, newY);

    // 1. Walls
    if (targetTile === TileType.WALL) return;

    // 2. Movement & Interactions
    let blocked = false;
    let nextPlayerState = { ...player };
    let tileToRemove = false;

    // Handle interactions
    if (targetTile === TileType.EMPTY) {
      // Just move
    } 
    // --- Shop ---
    else if (targetTile === TileType.NPC_MERCHANT) {
       setShowShop(true);
       blocked = true;
    }
    // --- Stairs ---
    else if (targetTile === TileType.STAIRS_UP) {
      if (player.floor < maps.length - 1) {
        nextPlayerState.floor += 1;
        // Search for down stairs on next floor to place player
        const nextMap = maps[player.floor + 1];
        let found = false;
        for(let r=0; r<BOARD_SIZE; r++){
            for(let c=0; c<BOARD_SIZE; c++){
                if(nextMap[r][c] === TileType.STAIRS_DOWN) {
                    nextPlayerState.x = c;
                    nextPlayerState.y = r;
                    found = true;
                }
            }
        }
        if(!found) { nextPlayerState.x = newX; nextPlayerState.y = newY; } 
        log(`Ascended to Floor ${nextPlayerState.floor + 1}`);
        blocked = true;
      }
    } else if (targetTile === TileType.STAIRS_DOWN) {
      if (player.floor > 0) {
        nextPlayerState.floor -= 1;
        const prevMap = maps[player.floor - 1];
        let found = false;
        for(let r=0; r<BOARD_SIZE; r++){
            for(let c=0; c<BOARD_SIZE; c++){
                if(prevMap[r][c] === TileType.STAIRS_UP) {
                    nextPlayerState.x = c;
                    nextPlayerState.y = r;
                    found = true;
                }
            }
        }
        if(!found) { nextPlayerState.x = newX; nextPlayerState.y = newY; }

        log(`Descended to Floor ${nextPlayerState.floor + 1}`);
        blocked = true;
      }
    } 
    // --- Items ---
    else if ([TileType.KEY_YELLOW, TileType.KEY_BLUE, TileType.KEY_RED].includes(targetTile)) {
      if (targetTile === TileType.KEY_YELLOW) { nextPlayerState.keys.yellow++; log("Got Yellow Key"); }
      if (targetTile === TileType.KEY_BLUE) { nextPlayerState.keys.blue++; log("Got Blue Key"); }
      if (targetTile === TileType.KEY_RED) { nextPlayerState.keys.red++; log("Got Red Key"); }
      tileToRemove = true;
    }
    else if (targetTile === TileType.POTION_RED) {
      nextPlayerState.hp += ITEM_VALUES.POTION_RED;
      log(`HP +${ITEM_VALUES.POTION_RED}`);
      tileToRemove = true;
    }
    else if (targetTile === TileType.POTION_BLUE) {
      nextPlayerState.hp += ITEM_VALUES.POTION_BLUE;
      log(`HP +${ITEM_VALUES.POTION_BLUE}`);
      tileToRemove = true;
    }
    else if (targetTile === TileType.GEM_RED) {
      nextPlayerState.atk += ITEM_VALUES.GEM_RED;
      log(`ATK +${ITEM_VALUES.GEM_RED}`);
      tileToRemove = true;
    }
    else if (targetTile === TileType.GEM_BLUE) {
      nextPlayerState.def += ITEM_VALUES.GEM_BLUE;
      log(`DEF +${ITEM_VALUES.GEM_BLUE}`);
      tileToRemove = true;
    }
    else if (targetTile === TileType.SWORD) {
        nextPlayerState.atk += ITEM_VALUES.SWORD;
        log(`Equipped Sword! ATK +${ITEM_VALUES.SWORD}`);
        tileToRemove = true;
    }
    else if (targetTile === TileType.SHIELD) {
        nextPlayerState.def += ITEM_VALUES.SHIELD;
        log(`Equipped Shield! DEF +${ITEM_VALUES.SHIELD}`);
        tileToRemove = true;
    }
    // --- Doors ---
    else if (targetTile === TileType.DOOR_YELLOW) {
      if (player.keys.yellow > 0) {
        nextPlayerState.keys.yellow--;
        tileToRemove = true;
        log("Opened Yellow Door");
      } else {
        blocked = true;
        log("Need Yellow Key");
      }
    }
    else if (targetTile === TileType.DOOR_BLUE) {
      if (player.keys.blue > 0) {
        nextPlayerState.keys.blue--;
        tileToRemove = true;
        log("Opened Blue Door");
      } else {
        blocked = true;
        log("Need Blue Key");
      }
    }
    else if (targetTile === TileType.DOOR_RED) {
      if (player.keys.red > 0) {
        nextPlayerState.keys.red--;
        tileToRemove = true;
        log("Opened Red Door");
      } else {
        blocked = true;
        log("Need Red Key");
      }
    }
    // --- Monsters ---
    else if (MONSTERS[targetTile]) {
      const combat = calculateCombat(targetTile, player);
      const mon = MONSTERS[targetTile];
      
      if (combat.canBeat) {
        nextPlayerState.hp -= combat.damageTaken;
        nextPlayerState.gold += mon.gold;
        nextPlayerState.xp += mon.xp;
        tileToRemove = true;
        
        log(`Defeated ${mon.name}! -${combat.damageTaken}HP, +${mon.gold}G`);
        if (combat.damageTaken > 0) {
            setShake(true);
            setTimeout(() => setShake(false), 300);
        }

        if (targetTile === TileType.BOSS) {
            log("🎉 You defeated the Demon Lord! You Win!");
        }

      } else {
        blocked = true;
        if (player.atk <= mon.def) {
           log(`Cannot hurt ${mon.name}! Needs ATK > ${mon.def}`);
        } else {
           log(`Too dangerous! Need ${combat.damageTaken} HP.`);
        }
      }
    }

    if (tileToRemove) {
      setTile(player.floor, newX, newY, TileType.EMPTY);
    }

    if (!blocked) {
      if (nextPlayerState.floor === player.floor) {
        nextPlayerState.x = newX;
        nextPlayerState.y = newY;
      }
    }

    setPlayer(nextPlayerState);
    setHoveredTile(null); // Clear tooltip on move

  }, [player, maps, calculateCombat, showShop]); 

  // --- Keyboard ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) movePlayer(0, -1);
      if (["ArrowDown", "s", "S"].includes(e.key)) movePlayer(0, 1);
      if (["ArrowLeft", "a", "A"].includes(e.key)) movePlayer(-1, 0);
      if (["ArrowRight", "d", "D"].includes(e.key)) movePlayer(1, 0);
      
      if (e.key === "Escape" && showShop) setShowShop(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, showShop]);

  // --- Auto-scroll messages ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Tooltip Handlers ---
  const handleTileHover = useCallback((type: TileType, e: React.MouseEvent) => {
    if (MONSTERS[type] || TILE_INFO[type]) {
      setHoveredTile({
        type: type,
        rect: e.currentTarget.getBoundingClientRect()
      });
    } else {
      setHoveredTile(null);
    }
  }, []);

  const handleTileLeave = useCallback(() => {
    setHoveredTile(null);
  }, []);

  // --- Render Helpers ---
  const currentMap = maps[player.floor];

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col md:flex-row items-center justify-center p-4 gap-6 ${shake ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}>
      
      {/* Styles for shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>

      {/* --- Shop Modal --- */}
      {showShop && (
        <ShopModal player={player} onBuy={handleBuyStat} onClose={() => setShowShop(false)} />
      )}

      {/* --- Tooltip --- */}
      {hoveredTile && !showShop && (
        <InfoTooltip 
          tileType={hoveredTile.type} 
          player={player} 
          position={{ 
            x: hoveredTile.rect.left + hoveredTile.rect.width / 2, 
            y: hoveredTile.rect.top 
          }}
          calculateCombat={calculateCombat}
        />
      )}

      {/* --- Left Panel: Stats --- */}
      <div className="w-full max-w-sm bg-slate-800 border-2 border-slate-600 rounded-lg p-4 shadow-xl z-10">
        <h2 className="text-2xl font-bold text-yellow-500 text-center mb-4 border-b border-slate-600 pb-2">
          Floor {player.floor + 1}
        </h2>
        
        <div className="space-y-3 font-mono text-lg">
          <div className="flex justify-between items-center">
             <span className="text-red-400">HP</span>
             <span className="font-bold">{player.hp} / {player.maxHp}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-orange-400">ATK</span>
             <span className="font-bold">{player.atk}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-blue-400">DEF</span>
             <span className="font-bold">{player.def}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-yellow-400">GOLD</span>
             <span className="font-bold">{player.gold}</span>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-600 pt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-yellow-900/50 p-2 rounded border border-yellow-700">
            <div className="text-yellow-400 text-xl">🔑</div>
            <div className="font-bold">{player.keys.yellow}</div>
          </div>
          <div className="bg-blue-900/50 p-2 rounded border border-blue-700">
            <div className="text-blue-400 text-xl">🔑</div>
            <div className="font-bold">{player.keys.blue}</div>
          </div>
          <div className="bg-red-900/50 p-2 rounded border border-red-700">
            <div className="text-red-400 text-xl">🔑</div>
            <div className="font-bold">{player.keys.red}</div>
          </div>
        </div>
      </div>

      {/* --- Center: Game Board --- */}
      <div className="relative bg-black p-2 rounded-lg shadow-2xl border-4 border-slate-600 z-0">
        <div 
          className="grid gap-0.5" 
          style={{ 
            gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`, // Fixed height inconsistency
            width: 'min(90vw, 500px)',
            height: 'min(90vw, 500px)',
          }}
        >
          {currentMap.map((row, y) => (
            row.map((cellType, x) => {
              // Override render for Player
              let typeToRender = cellType;
              if (player.x === x && player.y === y) {
                typeToRender = TileType.HERO;
              }
              return (
                <TileRender 
                  key={`${x}-${y}`} 
                  type={typeToRender} 
                  x={x} 
                  y={y} 
                  onHover={handleTileHover}
                  onLeave={handleTileLeave}
                />
              );
            })
          ))}
        </div>
      </div>

      {/* --- Right Panel: Info / Controls --- */}
      <div className="w-full max-w-sm flex flex-col gap-4 h-[500px] z-10">
        {/* Message Log */}
        <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-3 flex-1 overflow-y-auto shadow-inner text-sm font-mono">
          <div className="text-slate-400 text-center border-b border-slate-700 pb-1 mb-2">Game Log</div>
          {messages.map((m, i) => (
            <div key={i} className="mb-1 border-b border-slate-700/50 pb-1 last:border-0 animate-fade-in">
              {m.startsWith("Cannot") || m.startsWith("Too") ? <span className="text-red-400">{m}</span> :
               m.startsWith("Defeated") ? <span className="text-green-400">{m}</span> :
               m.startsWith("Bought") ? <span className="text-yellow-400">{m}</span> :
               <span className="text-slate-300">{m}</span>}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-2 h-32 md:hidden">
            <div />
            <button className="bg-slate-700 rounded active:bg-slate-600 text-2xl shadow-lg" onClick={() => movePlayer(0, -1)}>⬆️</button>
            <div />
            <button className="bg-slate-700 rounded active:bg-slate-600 text-2xl shadow-lg" onClick={() => movePlayer(-1, 0)}>⬅️</button>
            <div className="flex items-center justify-center text-slate-500 text-xs">PAD</div>
            <button className="bg-slate-700 rounded active:bg-slate-600 text-2xl shadow-lg" onClick={() => movePlayer(1, 0)}>➡️</button>
            <div />
            <button className="bg-slate-700 rounded active:bg-slate-600 text-2xl shadow-lg" onClick={() => movePlayer(0, 1)}>⬇️</button>
            <div />
        </div>

        {/* Combat Prediction (Static List for Overview) */}
        <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-3 hidden md:block overflow-y-auto h-40">
           <div className="text-slate-400 text-center text-xs mb-2">Enemy Stats (On this Floor)</div>
           <div className="text-xs space-y-1">
             {Object.keys(MONSTERS).map(id => {
               const mid = parseInt(id);
               // Only show if monster exists on this floor
               let exists = false;
               for(let r=0; r<BOARD_SIZE; r++) if(currentMap[r].includes(mid)) exists = true;
               
               if(!exists) return null;
               
               const m = MONSTERS[mid];
               const result = calculateCombat(mid, player);
               
               return (
                 <div key={mid} className="flex justify-between items-center bg-slate-700/50 p-1 rounded hover:bg-slate-600 transition-colors cursor-pointer" onMouseEnter={(e) => handleTileHover(mid as TileType, e)} onMouseLeave={handleTileLeave}>
                   <div className="flex items-center gap-2">
                     <span>{m.symbol}</span>
                     <span className={result.canBeat ? "text-slate-200" : "text-red-500"}>{m.name}</span>
                   </div>
                   <div className="text-right">
                     <div className="font-bold text-[10px] text-slate-400">{m.hp}HP/{m.atk}A/{m.def}D <span className="text-yellow-400">+{m.gold}G</span></div>
                     <div className={result.canBeat ? (result.damageTaken === 0 ? "text-green-400" : "text-yellow-400") : "text-red-500 font-bold"}>
                       {result.canBeat ? `-${result.damageTaken} HP` : "Too Strong"}
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      </div>
    </div>
  );
}