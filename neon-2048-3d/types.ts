export type Vector3 = [number, number, number];

export interface TileData {
  id: string;
  value: number;
  position: Vector3; // [x, y, z]
  isNew?: boolean;
  isMerged?: boolean;
}

export type Axis = 'x' | 'y' | 'z';
export type Direction = 1 | -1;

export interface GameState {
  tiles: TileData[];
  score: number;
  gameOver: boolean;
  won: boolean;
}
