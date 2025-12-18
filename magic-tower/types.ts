export enum TileType {
  EMPTY = 0,
  WALL = 1,
  
  // Interactive
  STAIRS_UP = 2,
  STAIRS_DOWN = 3,
  
  // Items
  KEY_YELLOW = 10,
  KEY_BLUE = 11,
  KEY_RED = 12,
  POTION_RED = 13, // +HP
  POTION_BLUE = 14, // +HP
  GEM_RED = 15, // +ATK
  GEM_BLUE = 16, // +DEF
  SWORD = 17,
  SHIELD = 18,

  // Doors
  DOOR_YELLOW = 20,
  DOOR_BLUE = 21,
  DOOR_RED = 22,

  // Monsters
  SLIME_GREEN = 30,
  SLIME_RED = 31,
  BAT = 32,
  SKELETON = 33,
  MAGE = 34,
  BOSS = 99,
  
  // NPCs
  NPC_MERCHANT = 50,

  // Dynamic
  HERO = 100 
}

export interface EntityStats {
  hp: number;
  atk: number;
  def: number;
  gold: number;
  xp: number;
}

export interface PlayerState extends EntityStats {
  keys: {
    yellow: number;
    blue: number;
    red: number;
  };
  floor: number;
  x: number;
  y: number;
  maxHp: number;
}

export interface MonsterDef {
  name: string;
  hp: number;
  atk: number;
  def: number;
  gold: number;
  xp: number;
  color: string;
  symbol: string;
}

export interface CombatResult {
  canBeat: boolean;
  damageTaken: number;
}

export interface GameMap {
  floorIndex: number;
  tiles: number[][]; // Mutable grid
  width: number;
  height: number;
}