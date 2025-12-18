import * as THREE from 'three';
import { Coordinate } from './types';

// Convert Latitude/Longitude to Vector3 on a sphere surface
export const getPositionFromLatLong = (lat: number, lng: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
};

// Generate points for a Bezier curve between two coordinates
export const getSplineFromCoords = (p1: Coordinate, p2: Coordinate, radius: number) => {
  const start = getPositionFromLatLong(p1.lat, p1.lng, radius);
  const end = getPositionFromLatLong(p2.lat, p2.lng, radius);

  // Calculate control points for the curve to arc away from the sphere
  const distance = start.distanceTo(end);
  const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius + distance * 0.5);

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return curve;
};
