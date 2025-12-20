import { EnemyConfig, EnemyType, WeaponConfig, WeaponType } from './types';

export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 600;
export const FPS = 60;

// Increased TOWER_X to account for the wider placement of weapon slots on the right side
export const TOWER_X = 300; 
export const SPAWN_X = GAME_WIDTH + 50; // Fallback, will try to use window width

// Adjusted slot positions to a Zig-Zag pattern (Left, Right, Left, Right...) 
// Shifted right and narrowed to align with the visual stem of the large 🗼 emoji
export const SLOT_POSITIONS = [
  { x: 250, y: 160 }, // Top Left-ish
  { x: 330, y: 240 }, // Upper Right-ish
  { x: 240, y: 340 }, // Mid Left-ish
  { x: 340, y: 440 }, // Lower Right-ish
  { x: 230, y: 530 }, // Base Left-ish
];

export const ENEMY_STATS: Record<EnemyType, EnemyConfig> = {
  [EnemyType.NORMAL]: { type: EnemyType.NORMAL, emoji: '⛄', hp: 15, speed: 0.8, reward: 5, size: 1.5 },
  [EnemyType.FAST]: { type: EnemyType.FAST, emoji: '⛄', hp: 8, speed: 2.0, reward: 3, size: 1.0 }, // Small snowman
  [EnemyType.ARMORED]: { type: EnemyType.ARMORED, emoji: '🛡️', hp: 45, speed: 0.5, reward: 10, size: 1.8 }, // Visual trick: Render ⛄ behind 🛡️
  [EnemyType.BOSS]: { type: EnemyType.BOSS, emoji: '👑', hp: 300, speed: 0.4, reward: 100, size: 3.0 },
};

export const WEAPON_STATS: Record<WeaponType, WeaponConfig> = {
  [WeaponType.GUN]: {
    type: WeaponType.GUN,
    name: 'Pistol',
    emoji: '🔫',
    cost: 50,
    damage: 10,
    range: 900,
    cooldown: 40,
    description: 'Basic projectile weapon.',
  },
  [WeaponType.LIGHTNING]: {
    type: WeaponType.LIGHTNING,
    name: 'Tesla',
    emoji: '⚡',
    cost: 150,
    damage: 0.5, // Per frame
    range: 1000,
    cooldown: 0,
    description: 'High speed, continuous damage.',
  },
  [WeaponType.BOMB]: {
    type: WeaponType.BOMB,
    name: 'Mortar',
    emoji: '💣',
    cost: 300,
    damage: 40, // AoE
    range: 1200,
    cooldown: 120,
    description: 'Slow parabolic AoE attack.',
  },
};

export const INITIAL_GOLD = 100;
export const INITIAL_HP = 100;
export const WAVE_DELAY = 300; // Frames between waves