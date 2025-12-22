export interface FireworkParticle {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  life: number;
  size: number;
}

export interface FireworkExplosion {
  id: string;
  particles: FireworkParticle[];
  createdAt: number;
}

export interface WishResponse {
  message: string;
  mood: string;
  color: string;
}