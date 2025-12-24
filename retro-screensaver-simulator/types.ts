export enum ScreensaverType {
  MYSTIFY = 'Mystify',
  BEZIER = 'Bezier',
  MAZE_3D = '3D Maze',
  PIPES_3D = '3D Pipes',
  FLOWERBOX_3D = '3D FlowerBox',
  DVD = 'DVD Bounce',
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
}