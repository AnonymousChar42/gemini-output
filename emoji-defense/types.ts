export enum GameState {
  MENU,
  PLAYING,
  GAME_OVER,
  VICTORY
}

export enum TileType {
  EMPTY = 0,
  PATH = 1,
  BASE = 2,
  SPAWN = 3,
  SCENERY = 4,
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface KaomojiState {
  hpThreshold: number; // If HP is <= this, use this face
  face: string;
}

export interface EnemyTypeDefinition {
  id: string;
  name: string;
  maxHp: number;
  speed: number; // Tiles per second
  reward: number;
  states: string[]; // Index 0 is 1HP, Index length-1 is MaxHP
  color: string;
}

export interface Enemy {
  id: string;
  typeId: string;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  pathIndex: number; // Current index in the path array
  progress: number; // 0.0 to 1.0 between current tile and next
  frozenFactor: number; // 1.0 = normal, 0.5 = half speed
  effects: Effect[];
  lastHitTime: number; // For hit animation
}

export interface Effect {
  type: 'SLOW' | 'BURN';
  duration: number; // seconds
  value: number; // slow amount or damage per tick
}

export interface TowerTypeDefinition {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  range: number;
  damage: number;
  cooldown: number; // seconds
  type: 'SINGLE' | 'AREA' | 'SLOW' | 'ECONOMY';
  description: string;
  upgrades?: string[]; // IDs of towers this can upgrade into
  income?: number; // Gold per second
}

export interface Tower {
  id: string;
  typeId: string;
  x: number;
  y: number;
  lastShotTime: number;
  totalDamageDealt: number;
  firePulse: number; // 0 to 1 for firing animation
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetId: string; // Enemy ID
  damage: number;
  speed: number;
  emoji: string;
  splashRadius?: number;
  effect?: { type: 'SLOW' | 'BURN', duration: number, value: number };
  startX: number;
  startY: number;
  progress: number; // 0 to 1
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  emoji: string;
  life: number; // 1.0 to 0.0
  vx: number;
  vy: number;
  scale: number;
}

export interface Wave {
  count: number;
  enemyTypeId: string;
  interval: number; // seconds between spawns
  initialDelay: number;
}

export interface LevelConfig {
  map: number[][]; // 0: Grass, 1: Path
  path: Coordinate[];
  waves: Wave[];
  startingGold: number;
  startingLives: number;
}