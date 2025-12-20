export enum EnemyType {
  NORMAL = 'NORMAL',
  FAST = 'FAST',
  ARMORED = 'ARMORED',
  BOSS = 'BOSS',
}

export enum WeaponType {
  GUN = 'GUN',
  LIGHTNING = 'LIGHTNING',
  BOMB = 'BOMB',
}

export interface EnemyConfig {
  type: EnemyType;
  emoji: string;
  hp: number;
  speed: number;
  reward: number;
  size: number; // visual scale
}

export interface WeaponConfig {
  type: WeaponType;
  name: string;
  emoji: string;
  cost: number;
  damage: number;
  range: number;
  cooldown: number; // frames
  description: string;
}

export interface Entity {
  id: number;
  x: number;
  y: number;
}

export interface Enemy extends Entity {
  type: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  frozen: number; // frames
}

export interface Projectile extends Entity {
  id: number;
  type: WeaponType;
  targetX: number; // For bombs
  targetY: number; // For bombs
  vx: number;
  vy: number;
  damage: number;
  progress: number; // 0 to 1 for parabolic
  sourceX: number;
  sourceY: number;
}

export interface WeaponSlot {
  index: number;
  weaponType: WeaponType | null;
  cooldownTimer: number;
  targetId: number | null; // For lightning lock-on
  level: number;
}

export interface GameState {
  enemies: Enemy[];
  projectiles: Projectile[];
  slots: WeaponSlot[];
  hp: number;
  maxHp: number;
  gold: number;
  wave: number;
  isGameOver: boolean;
  isPaused: boolean;
  waveTimer: number;
  score: number;
}