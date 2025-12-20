export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  WON = 'WON'
}

export enum ObstacleType {
  BURGER = 'BURGER',       // Makes you fat
  DUMBBELL = 'DUMBBELL',   // Makes you thin
  NARROW_GATE = 'NARROW_GATE', // Needs thin
  WIDE_GATE = 'WIDE_GATE', // Needs fat
  TRAP = 'TRAP',           // Damage
  FINISH = 'FINISH'
}

export interface GameObject {
  id: string;
  type: ObstacleType;
  x: number;
  z: number;
  width: number;
  height?: number; 
  active: boolean;
  color?: string;
}

export interface PlayerState {
  position: { x: number; y: number; z: number };
  weight: number; // Replaces heels. 0 = death. 
  score: number;
}