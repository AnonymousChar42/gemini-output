export enum ProvinceStatus {
  LOCKED = 'LOCKED',
  INFECTED = 'INFECTED',
  CONQUERED = 'CONQUERED'
}

export interface ProvinceData {
  name: string;
  code: string; // Adcode
  infection: number; // 0 to 100
  status: ProvinceStatus;
  shopCount: number;
  centroid?: [number, number]; // [Longitude, Latitude]
}

export interface Flavor {
  province: string;
  name: string;
  description: string;
}

export enum TechCategory {
  TRANSMISSION = 'TRANSMISSION',
  ABILITY = 'ABILITY',
  RESISTANCE = 'RESISTANCE'
}

export interface Tech {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: TechCategory;
  purchased: boolean;
  effectType: 'spread_rate' | 'cross_border' | 'income_rate' | 'resistance';
  effectValue: number;
  parentId?: string;
}

export interface Bubble {
  id: string;
  provinceName: string;
  coordinates: [number, number];
  value: number;
  createdAt: number;
}

export interface Flight {
  id: string;
  from: string;
  to: string;
  startTime: number;
  duration: number;
}

export interface GameState {
  money: number; // Creative Points
  day: number;
  totalShops: number;
  marketShare: number; // Percentage
  provinces: Record<string, ProvinceData>; // Keyed by name (e.g., "河南")
  techs: Record<string, Tech>;
  bubbles: Bubble[];
  flights: Flight[];
  news: string[];
  isRunning: boolean;
  gameWon: boolean;
  gameLost: boolean;
  selectedProvince: string | null; // For starting the game
  hasStarted: boolean;
}