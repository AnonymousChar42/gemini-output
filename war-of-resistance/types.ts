export enum GameScreen {
  MENU = 'MENU',
  LEVEL_SELECT = 'LEVEL_SELECT',
  PLAYING = 'PLAYING',
  COMPENDIUM = 'COMPENDIUM',
  GAME_OVER = 'GAME_OVER'
}

export enum EnemyType {
  INFANTRY = 'INFANTRY',
  OFFICER = 'OFFICER',
  MACHINE_GUNNER = 'MACHINE_GUNNER',
  CAVALRY = 'CAVALRY',
  SPECIAL = 'SPECIAL'
}

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  score: number;
  hp: number; // Max Health
  duration: number; // in seconds (time to reach player/attack)
  color: string;
  width: number; // percentage (base width at full scale)
  height: number; // percentage (base height at full scale)
  description: string;
  attackStartPct: number; // 0-1: When they start "attacking" (visual warning)
  damage: number; // Player HP damage if they finish their cycle
}

export enum WeaponType {
  PISTOL = 'PISTOL',
  RIFLE = 'RIFLE',
  SMG = 'SMG',
  SNIPER = 'SNIPER'
}

export interface WeaponConfig {
  type: WeaponType;
  name: string;
  rpm: number; // rounds per minute
  accuracy: number; // 0-1 (1 is perfect)
  magSize: number;
  reloadTime: number; // seconds
  damage: number; // Damage per shot
  description: string;
}

export interface LevelConfig {
  id: string;
  name: string;
  description: string;
  duration: number; // seconds
  background: string; // css gradient or color
  difficultyMultiplier: number;
  spawnRate: number; // base spawn interval ms
}

export interface ActiveEnemy {
  id: string;
  type: EnemyType;
  x: number; // % position
  y: number; // % position
  createdAt: number;
  maxDuration: number;
  hp: number;
  isDead: boolean;
  lastHit: number; // Timestamp of last hit for visual feedback
}

export interface GameStats {
  score: number;
  maxCombo: number;
  enemiesHit: number;
  enemiesMissed: number;
  accuracy: number;
  outcome: 'VICTORY' | 'DEFEAT';
  hpRemaining: number;
}