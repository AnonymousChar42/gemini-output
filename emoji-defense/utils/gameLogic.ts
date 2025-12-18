import { Coordinate } from '../types';

export const getDistance = (a: Coordinate, b: Coordinate) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};

// Returns the screen coordinate (relative to grid 0,0) for an entity
export const getEntityPosition = (path: Coordinate[], pathIndex: number, progress: number): Coordinate => {
  if (pathIndex >= path.length - 1) {
    return path[path.length - 1];
  }
  const curr = path[pathIndex];
  const next = path[pathIndex + 1];
  
  return {
    x: lerp(curr.x, next.x, progress),
    y: lerp(curr.y, next.y, progress)
  };
};

export const formatCurrency = (amount: number) => {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k`;
  return amount.toString();
};
