import { MonsterDef, TileType } from './types';

// Board Configuration
export const BOARD_SIZE = 11; // 11x11 Grid is standard for Magic Tower

// Monster Database
// Rebalanced for 7 Floors progression
export const MONSTERS: Record<number, MonsterDef> = {
  [TileType.SLIME_GREEN]: { name: "Giant Spider", hp: 35, atk: 18, def: 1, gold: 5, xp: 2, color: "text-emerald-400", symbol: "🕷️" },
  [TileType.SLIME_RED]: { name: "Viper", hp: 60, atk: 25, def: 5, gold: 12, xp: 4, color: "text-green-500", symbol: "🐍" },
  [TileType.BAT]: { name: "Vampire Bat", hp: 100, atk: 35, def: 5, gold: 18, xp: 5, color: "text-purple-400", symbol: "🦇" },
  [TileType.SKELETON]: { name: "Skeleton Guard", hp: 150, atk: 50, def: 15, gold: 30, xp: 8, color: "text-gray-300", symbol: "💀" },
  [TileType.MAGE]: { name: "Goblin Sorcerer", hp: 200, atk: 70, def: 20, gold: 45, xp: 12, color: "text-red-400", symbol: "👺" },
  
  // New Mid-Game Monsters
  [TileType.GHOST]: { name: "Phantom", hp: 300, atk: 90, def: 5, gold: 55, xp: 15, color: "text-indigo-300", symbol: "👻" },
  [TileType.CROCODILE]: { name: "Swamp Gator", hp: 600, atk: 110, def: 35, gold: 70, xp: 20, color: "text-emerald-600", symbol: "🐊" },
  
  // New Late-Game Monsters
  [TileType.ALIEN]: { name: "Void Walker", hp: 1000, atk: 180, def: 60, gold: 120, xp: 40, color: "text-green-300", symbol: "👽" },
  [TileType.DINOSAUR]: { name: "T-Rex", hp: 2500, atk: 300, def: 100, gold: 200, xp: 80, color: "text-orange-500", symbol: "🦖" },
  [TileType.DEMON_GUARD]: { name: "Hell Knight", hp: 4000, atk: 450, def: 180, gold: 350, xp: 120, color: "text-red-600", symbol: "😈" },

  // Buffed Boss
  [TileType.BOSS]: { name: "Demon Lord", hp: 9999, atk: 800, def: 300, gold: 9999, xp: 9999, color: "text-rose-700", symbol: "👹" },
};

// Player Initial State
export const INITIAL_PLAYER_STATE = {
  hp: 1000,
  maxHp: 1000,
  atk: 12, 
  def: 12, 
  gold: 0, 
  xp: 0,
  // Give 3 Yellow Keys to start to avoid soft-lock on Floor 0/1
  keys: { yellow: 3, blue: 0, red: 0 }, 
  floor: 0,
  x: 5,
  y: 10, 
};

// Item Values
export const ITEM_VALUES = {
  POTION_RED: 200,
  POTION_BLUE: 500,
  GEM_RED: 4, 
  GEM_BLUE: 4, 
  SWORD: 10,
  SHIELD: 10
};

// Tooltip Info for Non-Monster Tiles
export const TILE_INFO: Record<number, { name: string, description: string }> = {
  [TileType.WALL]: { name: "Wall", description: "A solid wall." },
  [TileType.STAIRS_UP]: { name: "Stairs Up", description: "Ascend to the next floor." },
  [TileType.STAIRS_DOWN]: { name: "Stairs Down", description: "Descend to the previous floor." },
  [TileType.KEY_YELLOW]: { name: "Yellow Key", description: "Opens Yellow Doors." },
  [TileType.KEY_BLUE]: { name: "Blue Key", description: "Opens Blue Doors." },
  [TileType.KEY_RED]: { name: "Red Key", description: "Opens Red Doors." },
  [TileType.POTION_RED]: { name: "Red Potion", description: `Recover ${ITEM_VALUES.POTION_RED} HP.` },
  [TileType.POTION_BLUE]: { name: "Blue Potion", description: `Recover ${ITEM_VALUES.POTION_BLUE} HP.` },
  [TileType.GEM_RED]: { name: "Red Gem", description: `Attack +${ITEM_VALUES.GEM_RED}.` },
  [TileType.GEM_BLUE]: { name: "Blue Gem", description: `Defense +${ITEM_VALUES.GEM_BLUE}.` },
  [TileType.SWORD]: { name: "Iron Sword", description: `Attack +${ITEM_VALUES.SWORD}.` },
  [TileType.SHIELD]: { name: "Iron Shield", description: `Defense +${ITEM_VALUES.SHIELD}.` },
  [TileType.DOOR_YELLOW]: { name: "Yellow Door", description: "Locked. Needs Yellow Key." },
  [TileType.DOOR_BLUE]: { name: "Blue Door", description: "Locked. Needs Blue Key." },
  [TileType.DOOR_RED]: { name: "Red Door", description: "Locked. Needs Red Key." },
  [TileType.HERO]: { name: "Hero", description: "This is you." },
  [TileType.NPC_MERCHANT]: { name: "Greedy Merchant", description: "Trade GOLD for stats here." },
};

// --- MAP DESIGNS (7 Floors) ---
const T = TileType;

// Floor 0: Tutorial / Entrance
// Added a Blue Key so player can progress in Floor 1
const FLOOR_0 = [
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_UP, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.POTION_RED, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.GEM_RED, T.WALL],
  [T.WALL, T.KEY_YELLOW, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.KEY_YELLOW, T.WALL],
  [T.WALL, T.EMPTY, T.WALL, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.WALL, T.EMPTY, T.WALL],
  [T.WALL, T.SLIME_GREEN, T.WALL, T.EMPTY, T.GEM_BLUE, T.NPC_MERCHANT, T.GEM_RED, T.EMPTY, T.WALL, T.SLIME_GREEN, T.WALL],
  [T.WALL, T.DOOR_YELLOW, T.WALL, T.EMPTY, T.SLIME_RED, T.KEY_BLUE, T.SLIME_RED, T.EMPTY, T.WALL, T.DOOR_YELLOW, T.WALL],
  [T.WALL, T.EMPTY, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.EMPTY, T.WALL],
  [T.WALL, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.WALL],
  [T.WALL, T.SLIME_GREEN, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.SLIME_GREEN, T.WALL],
  [T.WALL, T.KEY_YELLOW, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.POTION_RED, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.EMPTY, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
];

// Floor 1: The Basics
// Swapped Blue Doors to Yellow Doors to allow access to Blue/Red Keys without getting stuck
const FLOOR_1 = [
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_UP, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.KEY_BLUE, T.DOOR_YELLOW, T.EMPTY, T.EMPTY, T.BAT, T.EMPTY, T.EMPTY, T.DOOR_YELLOW, T.KEY_BLUE, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.POTION_BLUE, T.SLIME_RED, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.SLIME_RED, T.POTION_BLUE, T.WALL],
  [T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.KEY_RED, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL],
  [T.WALL, T.GEM_RED, T.EMPTY, T.WALL, T.GEM_BLUE, T.SKELETON, T.GEM_BLUE, T.WALL, T.EMPTY, T.GEM_RED, T.WALL],
  [T.WALL, T.WALL, T.EMPTY, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.EMPTY, T.WALL, T.WALL],
  [T.WALL, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.WALL],
  [T.WALL, T.SLIME_GREEN, T.WALL, T.DOOR_YELLOW, T.WALL, T.EMPTY, T.WALL, T.DOOR_YELLOW, T.WALL, T.SLIME_GREEN, T.WALL],
  [T.WALL, T.KEY_YELLOW, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.KEY_YELLOW, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_DOWN, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
];

// Floor 2: The Crossing
// Added spare keys in center
const FLOOR_2 = [
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_UP, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.GEM_BLUE, T.EMPTY, T.EMPTY, T.EMPTY, T.DOOR_BLUE, T.EMPTY, T.EMPTY, T.EMPTY, T.GEM_BLUE, T.WALL],
  [T.WALL, T.MAGE, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.MAGE, T.WALL],
  [T.WALL, T.EMPTY, T.WALL, T.POTION_BLUE, T.BAT, T.SKELETON, T.BAT, T.POTION_BLUE, T.WALL, T.EMPTY, T.WALL],
  [T.WALL, T.KEY_BLUE, T.WALL, T.KEY_RED, T.EMPTY, T.NPC_MERCHANT, T.EMPTY, T.KEY_YELLOW, T.WALL, T.KEY_BLUE, T.WALL],
  [T.WALL, T.DOOR_YELLOW, T.WALL, T.EMPTY, T.WALL, T.WALL, T.WALL, T.EMPTY, T.WALL, T.DOOR_YELLOW, T.WALL],
  [T.WALL, T.EMPTY, T.WALL, T.SKELETON, T.WALL, T.GEM_RED, T.WALL, T.SKELETON, T.WALL, T.EMPTY, T.WALL],
  [T.WALL, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.SWORD, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.SHIELD, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_DOWN, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
];

// Floor 3: Ghost Hall
const FLOOR_3 = [
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_UP, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.KEY_RED, T.GHOST, T.EMPTY, T.EMPTY, T.DOOR_RED, T.EMPTY, T.EMPTY, T.GHOST, T.KEY_RED, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.EMPTY, T.WALL, T.EMPTY, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.GEM_RED, T.GHOST, T.DOOR_BLUE, T.EMPTY, T.EMPTY, T.EMPTY, T.DOOR_BLUE, T.GHOST, T.GEM_RED, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.POTION_BLUE, T.EMPTY, T.KEY_YELLOW, T.MAGE, T.MAGE, T.MAGE, T.KEY_YELLOW, T.EMPTY, T.POTION_BLUE, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.KEY_BLUE, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.KEY_BLUE, T.WALL],
  [T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.EMPTY, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL],
  [T.WALL, T.GEM_BLUE, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.GEM_BLUE, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_DOWN, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
];

// Floor 4: The Swamp (Crocs)
// Fix: Moved NPC_MERCHANT from (5,2) to (4,2) and put KEY_RED at (5,2) so player can walk through
const FLOOR_4 = [
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_UP, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.POTION_RED, T.CROCODILE, T.WALL, T.GEM_BLUE, T.KEY_BLUE, T.GEM_BLUE, T.WALL, T.CROCODILE, T.POTION_RED, T.WALL],
  [T.WALL, T.EMPTY, T.EMPTY, T.WALL, T.NPC_MERCHANT, T.KEY_RED, T.KEY_RED, T.WALL, T.EMPTY, T.EMPTY, T.WALL],
  [T.WALL, T.DOOR_BLUE, T.WALL, T.WALL, T.WALL, T.DOOR_RED, T.WALL, T.WALL, T.WALL, T.DOOR_BLUE, T.WALL],
  [T.WALL, T.EMPTY, T.EMPTY, T.CROCODILE, T.EMPTY, T.EMPTY, T.EMPTY, T.CROCODILE, T.EMPTY, T.EMPTY, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.EMPTY, T.WALL, T.EMPTY, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.GEM_RED, T.EMPTY, T.EMPTY, T.EMPTY, T.GHOST, T.EMPTY, T.EMPTY, T.EMPTY, T.GEM_RED, T.WALL],
  [T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL],
  [T.WALL, T.KEY_BLUE, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.KEY_BLUE, T.WALL],
  [T.WALL, T.SLIME_RED, T.SLIME_RED, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.SLIME_RED, T.SLIME_RED, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_DOWN, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
];

// Floor 5: Alien Tech Base
// Fixed: Was missing a row (10 rows instead of 11). Added empty filler row at index 6.
const FLOOR_5 = [
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_UP, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.POTION_BLUE, T.ALIEN, T.EMPTY, T.EMPTY, T.DEMON_GUARD, T.EMPTY, T.EMPTY, T.ALIEN, T.POTION_BLUE, T.WALL],
  [T.WALL, T.WALL, T.DOOR_RED, T.WALL, T.WALL, T.DOOR_RED, T.WALL, T.WALL, T.DOOR_RED, T.WALL, T.WALL],
  [T.WALL, T.GEM_BLUE, T.EMPTY, T.WALL, T.KEY_RED, T.EMPTY, T.KEY_RED, T.WALL, T.EMPTY, T.GEM_BLUE, T.WALL],
  [T.WALL, T.ALIEN, T.EMPTY, T.WALL, T.KEY_BLUE, T.EMPTY, T.KEY_BLUE, T.WALL, T.EMPTY, T.ALIEN, T.WALL],
  [T.WALL, T.WALL, T.DOOR_BLUE, T.WALL, T.WALL, T.EMPTY, T.WALL, T.WALL, T.DOOR_BLUE, T.WALL, T.WALL],
  [T.WALL, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.WALL], // Added Filler
  [T.WALL, T.GEM_RED, T.EMPTY, T.EMPTY, T.EMPTY, T.CROCODILE, T.EMPTY, T.EMPTY, T.EMPTY, T.GEM_RED, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.KEY_YELLOW, T.KEY_YELLOW, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.KEY_YELLOW, T.KEY_YELLOW, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_DOWN, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
];

// Floor 6: The Demon's Lair
const FLOOR_6 = [
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.KEY_RED, T.POTION_BLUE, T.WALL, T.DEMON_GUARD, T.BOSS, T.DEMON_GUARD, T.WALL, T.POTION_BLUE, T.KEY_RED, T.WALL],
  [T.WALL, T.DOOR_RED, T.EMPTY, T.WALL, T.DOOR_RED, T.DOOR_RED, T.DOOR_RED, T.WALL, T.EMPTY, T.DOOR_RED, T.WALL],
  [T.WALL, T.EMPTY, T.EMPTY, T.WALL, T.EMPTY, T.EMPTY, T.EMPTY, T.WALL, T.EMPTY, T.EMPTY, T.WALL],
  [T.WALL, T.WALL, T.DOOR_RED, T.WALL, T.WALL, T.EMPTY, T.WALL, T.WALL, T.DOOR_RED, T.WALL, T.WALL],
  [T.WALL, T.DINOSAUR, T.EMPTY, T.ALIEN, T.EMPTY, T.EMPTY, T.EMPTY, T.ALIEN, T.EMPTY, T.DINOSAUR, T.WALL],
  [T.WALL, T.WALL, T.DOOR_BLUE, T.WALL, T.WALL, T.EMPTY, T.WALL, T.WALL, T.DOOR_BLUE, T.WALL, T.WALL],
  [T.WALL, T.GEM_RED, T.EMPTY, T.EMPTY, T.CROCODILE, T.EMPTY, T.CROCODILE, T.EMPTY, T.EMPTY, T.GEM_RED, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.KEY_YELLOW, T.KEY_YELLOW, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.KEY_YELLOW, T.KEY_YELLOW, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_DOWN, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
];

export const INITIAL_MAPS = [FLOOR_0, FLOOR_1, FLOOR_2, FLOOR_3, FLOOR_4, FLOOR_5, FLOOR_6];