
export interface Vector2 {
  x: number;
  y: number;
}

export interface Player {
  pos: Vector2;
  dir: Vector2;
  plane: Vector2;
  health: number;
  ammo: number;
  score: number;
}

export enum EntityType {
  ENEMY = 'ENEMY',
  TREASURE = 'TREASURE',
  MEDKIT = 'MEDKIT',
  AMMO = 'AMMO'
}

export interface Entity {
  id: string;
  pos: Vector2;
  type: EntityType;
  emoji: string;
  isDead: boolean;
  isCollected: boolean;
}

export interface GameState {
  player: Player;
  entities: Entity[];
  isShooting: boolean;
  lastShootTime: number;
  map: number[][];
}
