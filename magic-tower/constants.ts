import { MonsterDef, TileType } from './types';

// Board Configuration
export const BOARD_SIZE = 11; // 11x11 Grid is standard for Magic Tower

// Monster Database
// Rebalanced: Increased Gold drops significantly to make farming useful.
export const MONSTERS: Record<number, MonsterDef> = {
  [TileType.SLIME_GREEN]: { name: "Giant Spider", hp: 35, atk: 18, def: 1, gold: 5, xp: 2, color: "text-emerald-400", symbol: "🕷️" },
  [TileType.SLIME_RED]: { name: "Viper", hp: 60, atk: 25, def: 5, gold: 12, xp: 4, color: "text-green-500", symbol: "🐍" },
  [TileType.BAT]: { name: "Vampire Bat", hp: 50, atk: 28, def: 2, gold: 15, xp: 5, color: "text-purple-400", symbol: "🦇" },
  [TileType.SKELETON]: { name: "Skeleton Guard", hp: 110, atk: 45, def: 10, gold: 25, xp: 8, color: "text-gray-300", symbol: "💀" },
  [TileType.MAGE]: { name: "Goblin Sorcerer", hp: 150, atk: 55, def: 15, gold: 40, xp: 12, color: "text-red-400", symbol: "👺" },
  [TileType.BOSS]: { name: "Demon Lord", hp: 800, atk: 120, def: 40, gold: 999, xp: 999, color: "text-red-700", symbol: "👹" },
};

// Player Initial State
export const INITIAL_PLAYER_STATE = {
  hp: 1000,
  maxHp: 1000,
  atk: 12, // Slight bump to start
  def: 12, // Slight bump to start
  gold: 20, // Give some starter cash
  xp: 0,
  keys: { yellow: 1, blue: 0, red: 0 }, // Start with 1 key
  floor: 0,
  x: 5,
  y: 10, // Start at bottom center
};

// Item Values
export const ITEM_VALUES = {
  POTION_RED: 200,
  POTION_BLUE: 500,
  GEM_RED: 4, // Buffed from 3
  GEM_BLUE: 4, // Buffed from 3
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

// Initial Maps (0 = Floor 1, etc)
// 11x11 Grids
const T = TileType;

const FLOOR_0 = [
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_UP, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.POTION_RED, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.GEM_RED, T.WALL],
  [T.WALL, T.KEY_YELLOW, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.KEY_YELLOW, T.WALL],
  [T.WALL, T.EMPTY, T.WALL, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.WALL, T.EMPTY, T.WALL],
  [T.WALL, T.SLIME_GREEN, T.WALL, T.EMPTY, T.GEM_BLUE, T.NPC_MERCHANT, T.GEM_RED, T.EMPTY, T.WALL, T.SLIME_GREEN, T.WALL],
  [T.WALL, T.DOOR_YELLOW, T.WALL, T.EMPTY, T.SLIME_RED, T.KEY_YELLOW, T.SLIME_RED, T.EMPTY, T.WALL, T.DOOR_YELLOW, T.WALL],
  [T.WALL, T.EMPTY, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.EMPTY, T.WALL],
  [T.WALL, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.WALL],
  [T.WALL, T.SLIME_GREEN, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.SLIME_GREEN, T.WALL],
  [T.WALL, T.KEY_YELLOW, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.POTION_RED, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.EMPTY, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
];

const FLOOR_1 = [
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_UP, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.KEY_BLUE, T.DOOR_BLUE, T.EMPTY, T.EMPTY, T.BAT, T.EMPTY, T.EMPTY, T.DOOR_BLUE, T.KEY_BLUE, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.POTION_BLUE, T.SLIME_RED, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.SLIME_RED, T.POTION_BLUE, T.WALL],
  [T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.EMPTY, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL],
  [T.WALL, T.GEM_RED, T.EMPTY, T.WALL, T.GEM_BLUE, T.SKELETON, T.GEM_BLUE, T.WALL, T.EMPTY, T.GEM_RED, T.WALL],
  [T.WALL, T.WALL, T.EMPTY, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.EMPTY, T.WALL, T.WALL],
  [T.WALL, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.WALL],
  [T.WALL, T.SLIME_GREEN, T.WALL, T.DOOR_YELLOW, T.WALL, T.EMPTY, T.WALL, T.DOOR_YELLOW, T.WALL, T.SLIME_GREEN, T.WALL],
  [T.WALL, T.KEY_YELLOW, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.KEY_YELLOW, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_DOWN, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
];

const FLOOR_2 = [
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.KEY_RED, T.POTION_BLUE, T.WALL, T.MAGE, T.BOSS, T.MAGE, T.WALL, T.POTION_BLUE, T.KEY_RED, T.WALL],
  [T.WALL, T.DOOR_RED, T.EMPTY, T.WALL, T.DOOR_RED, T.DOOR_RED, T.DOOR_RED, T.WALL, T.EMPTY, T.DOOR_RED, T.WALL],
  [T.WALL, T.EMPTY, T.EMPTY, T.WALL, T.KEY_BLUE, T.EMPTY, T.KEY_BLUE, T.WALL, T.EMPTY, T.EMPTY, T.WALL],
  [T.WALL, T.WALL, T.DOOR_BLUE, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.DOOR_BLUE, T.WALL, T.WALL],
  [T.WALL, T.SHIELD, T.EMPTY, T.SKELETON, T.EMPTY, T.EMPTY, T.EMPTY, T.SKELETON, T.EMPTY, T.SWORD, T.WALL],
  [T.WALL, T.WALL, T.DOOR_BLUE, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.DOOR_BLUE, T.WALL, T.WALL],
  [T.WALL, T.GEM_RED, T.EMPTY, T.EMPTY, T.BAT, T.EMPTY, T.BAT, T.EMPTY, T.EMPTY, T.GEM_RED, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.DOOR_YELLOW, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
  [T.WALL, T.KEY_YELLOW, T.KEY_YELLOW, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.EMPTY, T.KEY_YELLOW, T.KEY_YELLOW, T.WALL],
  [T.WALL, T.WALL, T.WALL, T.WALL, T.WALL, T.STAIRS_DOWN, T.WALL, T.WALL, T.WALL, T.WALL, T.WALL],
];

export const INITIAL_MAPS = [FLOOR_0, FLOOR_1, FLOOR_2];