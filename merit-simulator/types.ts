export interface GameConfig {
  buildings: BuildingConfig[];
  clickUpgrades: UpgradeConfig[];
}

export interface BuildingConfig {
  id: string;
  name: string;
  description: string;
  flavorText: string;
  baseCost: number;
  baseProduction: number; // Merit per second
  baseUpgradeCost: number; // Cost to upgrade from Lv1 to Lv2
  imagePath?: string; // e.g. "assets/fish.png"
  emojis: string[]; // Fallback or primary visual. Array for randomization.
}

export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  cost: number;
  triggerType: 'click_auto' | 'click_multiplier' | 'building_multiplier';
  triggerTarget?: string; // 'player' or building ID
  value: number; // Multiplier value or raw addition
  icon: string;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export type ResourceMap = Record<string, number>; // Building ID -> Count
export type UpgradeMap = Record<string, boolean>; // Upgrade ID -> Purchased
export type BuildingLevelMap = Record<string, number>; // Building ID -> Level