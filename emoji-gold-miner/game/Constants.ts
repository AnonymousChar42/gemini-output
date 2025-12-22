export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export enum HookState {
  SWINGING,
  SHOOTING,
  RETRACTING
}

export const ITEM_TYPES = [
  { type: 'GOLD_BIG', icon: '💰', value: 500, weight: 30, radius: 25 },
  { type: 'GOLD_SMALL', icon: '💰', value: 100, weight: 10, radius: 15 },
  { type: 'ROCK_BIG', icon: '🪨', value: 20, weight: 50, radius: 25 },
  { type: 'ROCK_SMALL', icon: '🪨', value: 11, weight: 30, radius: 15 },
  { type: 'DIAMOND', icon: '💎', value: 600, weight: 5, radius: 10 },
  { type: 'PIG', icon: '🐷', value: 2, weight: 15, radius: 20 }, // Fast moving annoyance? Maybe just static for now
];

export const HOOK_SPEED = 5; // Reduced from 10
export const SWING_SPEED = 0.8; // Reduced from 1.5
export const SWING_LIMIT = 70; // Degrees
