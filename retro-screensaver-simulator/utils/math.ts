import { Point3D, Point2D } from '../types';

export const rotateX = (p: Point3D, angle: number): Point3D => ({
  x: p.x,
  y: p.y * Math.cos(angle) - p.z * Math.sin(angle),
  z: p.y * Math.sin(angle) + p.z * Math.cos(angle),
});

export const rotateY = (p: Point3D, angle: number): Point3D => ({
  x: p.x * Math.cos(angle) + p.z * Math.sin(angle),
  y: p.y,
  z: -p.x * Math.sin(angle) + p.z * Math.cos(angle),
});

export const rotateZ = (p: Point3D, angle: number): Point3D => ({
  x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
  y: p.x * Math.sin(angle) + p.y * Math.cos(angle),
  z: p.z,
});

export const project = (p: Point3D, width: number, height: number, fov: number = 300, viewerDistance: number = 4): Point2D => {
  const factor = fov / (viewerDistance + p.z);
  return {
    x: p.x * factor + width / 2,
    y: p.y * factor + height / 2,
  };
};

export const randomColor = () => `hsl(${Math.random() * 360}, 100%, 50%)`;

export const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};