import { Coordinate, EnemyTypeDefinition, LevelConfig, TileType, TowerTypeDefinition } from './types';

export const FPS = 60;
export const TILE_SIZE = 64;

export const ENEMY_TYPES: Record<string, EnemyTypeDefinition> = {
  BASIC: {
    id: 'BASIC',
    name: 'Walker',
    maxHp: 4,
    speed: 1.5,
    reward: 5, // Lowered reward due to higher quantity
    color: 'text-gray-100',
    states: ['୧( ˵ ✖ _ ✖ ˵ )୨', '୧( ˵ ° - ° ˵ )୨', '୧( ˵ ° ~ ° ˵ )୨', '୧( ˵ ° ω ° ˵ )୨']
  },
  RUNNER: {
    id: 'RUNNER',
    name: 'Rusher',
    maxHp: 6,
    speed: 3.2,
    reward: 8,
    color: 'text-yellow-300',
    states: ['(×ω×)', '(T_T)', '(ಠ_ಠ)', 'ᕙ(⇀‸↼‶)ᕗ', 'ᕦ(ò_óˇ)ᕤ', 'ᕕ ( ᐛ ) ᕗ']
  },
  TANK: {
    id: 'TANK',
    name: 'Tanker',
    maxHp: 20, // Increased HP to compensate for "Damage 1" spam
    speed: 0.8,
    reward: 20,
    color: 'text-red-400',
    states: ['┌( ಠ益ಠ)┘', '┌( ಠ︵ಠ)┘', '┌( ಠ_ಠ)┘', '┌( ⚆_⚆)┘']
  },
  BOSS: {
    id: 'BOSS',
    name: 'The Admin',
    maxHp: 250,
    speed: 0.4,
    reward: 500,
    color: 'text-purple-400',
    states: ['_(┐ ◟;ﾟдﾟ)ノ', 'ヽ(`Д´)ノ', '(ﾒ ﾟ皿ﾟ)ﾒ']
  },
  LAZY: {
    id: 'LAZY',
    name: 'Slacker',
    maxHp: 5,
    speed: 1.0,
    reward: 10,
    color: 'text-blue-300',
    states: ['_(´ཀ`」 ∠)_', '_(:3 」∠ )_', '∠( ᐛ 」∠)_']
  },
  PANIC: {
    id: 'PANIC',
    name: 'Scaredy',
    maxHp: 3,
    speed: 4.0,
    reward: 12,
    color: 'text-pink-400',
    states: ['(ﾟДﾟ;)', '((ﾟДﾟ;))', '(((ﾟДﾟ;)))']
  }
};

export const TOWER_TYPES: Record<string, TowerTypeDefinition> = {
  // ECONOMY: 💰 -> 💎 -> 🏦
  'ECON_1': {
    id: 'ECON_1',
    name: 'Piggy Bank',
    emoji: '💰',
    cost: 50,
    range: 0,
    damage: 0,
    cooldown: 1,
    income: 2,
    type: 'ECONOMY',
    description: 'Generates gold every second.',
    upgrades: ['ECON_2']
  },
  'ECON_2': {
    id: 'ECON_2',
    name: 'Gem Mine',
    emoji: '💎',
    cost: 120,
    range: 0,
    damage: 0,
    cooldown: 1,
    income: 6,
    type: 'ECONOMY',
    description: 'Generates more gold.',
    upgrades: ['ECON_3']
  },
  'ECON_3': {
    id: 'ECON_3',
    name: 'Global Bank',
    emoji: '🏦',
    cost: 300,
    range: 0,
    damage: 0,
    cooldown: 1,
    income: 15,
    type: 'ECONOMY',
    description: 'The ultimate gold generator.',
  },

  // SLOW: ❄️ -> 🍦 -> ⛄️ (Damage remains 1)
  'SLOW_1': {
    id: 'SLOW_1',
    name: 'Frost',
    emoji: '❄️',
    cost: 40,
    range: 2.5,
    damage: 1,
    cooldown: 1.5,
    type: 'SLOW',
    description: 'Slows enemies down.',
    upgrades: ['SLOW_2']
  },
  'SLOW_2': {
    id: 'SLOW_2',
    name: 'Ice Cream',
    emoji: '🍦',
    cost: 90,
    range: 3.0,
    damage: 1,
    cooldown: 1.2,
    type: 'SLOW',
    description: 'Better chilling power.',
    upgrades: ['SLOW_3']
  },
  'SLOW_3': {
    id: 'SLOW_3',
    name: 'Snowman',
    emoji: '⛄️',
    cost: 180,
    range: 4.0,
    damage: 1,
    cooldown: 1.0,
    type: 'SLOW',
    description: 'Freeze them in their tracks!',
  },

  // PHYSICAL: 👊 -> 💪 -> 🦾 (Damage 1, but very fast)
  'PHYS_1': {
    id: 'PHYS_1',
    name: 'Puncher',
    emoji: '👊',
    cost: 60,
    range: 2.0,
    damage: 1,
    cooldown: 0.5,
    type: 'SINGLE',
    description: 'Fires rapidly but low damage.',
    upgrades: ['PHYS_2']
  },
  'PHYS_2': {
    id: 'PHYS_2',
    name: 'Strongman',
    emoji: '💪',
    cost: 130,
    range: 2.5,
    damage: 1,
    cooldown: 0.3,
    type: 'SINGLE',
    description: 'Even faster punches.',
    upgrades: ['PHYS_3']
  },
  'PHYS_3': {
    id: 'PHYS_3',
    name: 'Cyborg',
    emoji: '🦾',
    cost: 250,
    range: 3.0,
    damage: 1,
    cooldown: 0.15,
    type: 'SINGLE',
    description: 'Machine-gun fire rate.',
  },

  // FIRE: 🔥 -> ☀️ -> 🌞 (Damage 1, Area effect)
  'FIRE_1': {
    id: 'FIRE_1',
    name: 'Spark',
    emoji: '🔥',
    cost: 80,
    range: 2.5,
    damage: 1,
    cooldown: 2.5,
    type: 'AREA',
    description: 'Small explosive area.',
    upgrades: ['FIRE_2']
  },
  'FIRE_2': {
    id: 'FIRE_2',
    name: 'Sunlight',
    emoji: '☀️',
    cost: 160,
    range: 3.5,
    damage: 1,
    cooldown: 2.2,
    type: 'AREA',
    description: 'Bigger explosions.',
    upgrades: ['FIRE_3']
  },
  'FIRE_3': {
    id: 'FIRE_3',
    name: 'Supernova',
    emoji: '🌞',
    cost: 350,
    range: 4.5,
    damage: 1,
    cooldown: 1.8,
    type: 'AREA',
    description: 'Massive solar flare.',
  },

  // CHEAP: 😘 -> 😍 -> 🤡 (Damage 1, extremely slow/cheap)
  'CHEAP_1': {
    id: 'CHEAP_1',
    name: 'Kiss',
    emoji: '😘',
    cost: 5,
    range: 3.0,
    damage: 1,
    cooldown: 10.0,
    type: 'SINGLE',
    description: 'Basically free.',
    upgrades: ['CHEAP_2']
  },
  'CHEAP_2': {
    id: 'CHEAP_2',
    name: 'Love',
    emoji: '😍',
    cost: 15,
    range: 4.0,
    damage: 1,
    cooldown: 8.0,
    type: 'SINGLE',
    description: 'Long range but very slow.',
    upgrades: ['CHEAP_3']
  },
  'CHEAP_3': {
    id: 'CHEAP_3',
    name: 'Joker',
    emoji: '🤡',
    cost: 30,
    range: 5.0,
    damage: 1,
    cooldown: 6.0,
    type: 'SINGLE',
    description: 'Wait for the laugh...',
  },

  // POOP: 💩 -> 💩 (Mid) -> 💩 (Large) (Damage 1, size focus)
  'POOP_1': {
    id: 'POOP_1',
    name: 'Small Poop',
    emoji: '💩',
    cost: 30,
    range: 2.2,
    damage: 1,
    cooldown: 0.8,
    type: 'SINGLE',
    description: 'Grows as you upgrade!',
    upgrades: ['POOP_2']
  },
  'POOP_2': {
    id: 'POOP_2',
    name: 'Medium Poop',
    emoji: '💩',
    cost: 70,
    range: 2.8,
    damage: 1,
    cooldown: 0.7,
    type: 'SINGLE',
    description: 'Getting bigger...',
    upgrades: ['POOP_3']
  },
  'POOP_3': {
    id: 'POOP_3',
    name: 'Giant Poop',
    emoji: '💩',
    cost: 150,
    range: 3.5,
    damage: 1,
    cooldown: 0.6,
    type: 'SINGLE',
    description: 'Absolutely massive.',
  }
};

export const LEVEL_1: LevelConfig = {
  map: [
    [3, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 0, 1, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 2, 0],
  ],
  path: [
    {x:0, y:0}, {x:1, y:0}, {x:2, y:0}, {x:3, y:0},
    {x:3, y:1}, {x:3, y:2}, {x:3, y:3}, 
    {x:2, y:3}, {x:1, y:3},
    {x:1, y:4}, {x:1, y:5},
    {x:2, y:5}, {x:3, y:5}, {x:4, y:5}, {x:5, y:5},
    {x:5, y:4}, {x:5, y:3}, {x:5, y:2}, {x:5, y:1},
    {x:6, y:1}, {x:7, y:1}, {x:8, y:1},
    {x:8, y:2}, {x:8, y:3}, {x:8, y:4}, {x:8, y:5},
    {x:8, y:6}, {x:8, y:7},
    {x:7, y:7}, {x:6, y:7}, {x:5, y:7}, {x:4, y:7}, {x:3, y:7}, {x:2, y:7}, {x:1, y:7},
    {x:1, y:8}, {x:1, y:9},
    {x:2, y:9}, {x:3, y:9}, {x:4, y:9}, {x:5, y:9}, {x:6, y:9}, {x:7, y:9}, {x:8, y:9}
  ],
  startingGold: 100,
  startingLives: 20, // Increased lives to allow for more chaos
  waves: [
    { count: 15, enemyTypeId: 'BASIC', interval: 1.0, initialDelay: 2 },
    { count: 25, enemyTypeId: 'BASIC', interval: 0.8, initialDelay: 4 },
    { count: 20, enemyTypeId: 'LAZY', interval: 1.5, initialDelay: 5 },
    { count: 30, enemyTypeId: 'RUNNER', interval: 0.6, initialDelay: 5 },
    { count: 50, enemyTypeId: 'PANIC', interval: 0.3, initialDelay: 5 },
    { count: 20, enemyTypeId: 'TANK', interval: 2.0, initialDelay: 8 },
    { count: 60, enemyTypeId: 'RUNNER', interval: 0.4, initialDelay: 5 },
    { count: 1, enemyTypeId: 'BOSS', interval: 0, initialDelay: 10 },
    { count: 100, enemyTypeId: 'PANIC', interval: 0.2, initialDelay: 5 },
  ]
};