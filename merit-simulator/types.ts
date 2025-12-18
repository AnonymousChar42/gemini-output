
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  baseDps: number;
  icon: string;
}

export interface PlayerState {
  merit: number;
  totalMeritEver: number;
  clickValue: number;
  ownedUpgrades: Record<string, number>;
  lastUpdate: number;
  multiplier: number;
}

export enum Realm {
  Mortal = '凡夫俗子',
  Kind = '积善之人',
  Master = '功德主',
  Bodhisattva = '在世菩萨',
  LivingBuddha = '人间活佛',
  CyberBuddha = '赛博佛陀'
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}
