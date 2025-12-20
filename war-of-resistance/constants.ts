import { EnemyConfig, EnemyType, LevelConfig, WeaponConfig, WeaponType } from './types';

export const ENEMIES: Record<EnemyType, EnemyConfig> = {
  [EnemyType.INFANTRY]: {
    type: EnemyType.INFANTRY,
    name: "普通步兵",
    score: 10,
    hp: 100,
    duration: 5.0,
    color: "bg-green-800",
    width: 8,
    height: 12,
    description: "敌军基础作战单位。行动相对缓慢，但数量众多，会成群结队地向阵地推进。",
    attackStartPct: 0.8,
    damage: 10
  },
  [EnemyType.OFFICER]: {
    type: EnemyType.OFFICER,
    name: "指挥军官",
    score: 25,
    hp: 150,
    duration: 6.0,
    color: "bg-yellow-900 border-2 border-yellow-600",
    width: 8,
    height: 12,
    description: "敌军指挥人员。通常在后方指挥，一旦靠近威胁极大。",
    attackStartPct: 0.7,
    damage: 20
  },
  [EnemyType.MACHINE_GUNNER]: {
    type: EnemyType.MACHINE_GUNNER,
    name: "机枪手",
    score: 30,
    hp: 250,
    duration: 7.0,
    color: "bg-gray-800 border-b-4 border-black",
    width: 10,
    height: 10,
    description: "携带重型武器。虽然移动缓慢，但会在中距离就开始进行火力压制。",
    attackStartPct: 0.5,
    damage: 15
  },
  [EnemyType.CAVALRY]: {
    type: EnemyType.CAVALRY,
    name: "骑兵",
    score: 35,
    hp: 180,
    duration: 3.5,
    color: "bg-amber-800",
    width: 12,
    height: 14,
    description: "机动性极强的单位。冲锋速度极快，需要优先解决。",
    attackStartPct: 0.9,
    damage: 25
  },
  [EnemyType.SPECIAL]: {
    type: EnemyType.SPECIAL,
    name: "特殊目标",
    score: 80,
    hp: 80,
    duration: 4.0,
    color: "bg-red-800 animate-pulse",
    width: 6,
    height: 10,
    description: "高价值目标。出现时间短，移动飘忽不定。",
    attackStartPct: 0.6,
    damage: 30
  }
};

export const WEAPONS: Record<WeaponType, WeaponConfig> = {
  [WeaponType.PISTOL]: {
    type: WeaponType.PISTOL,
    name: "驳壳枪",
    rpm: 400,
    accuracy: 0.8,
    magSize: 12,
    reloadTime: 1.5,
    damage: 34, // 3 shots for infantry
    description: "经典的半自动手枪，近战火力凶猛，深受抗日游击队喜爱。俗称'盒子炮'。"
  },
  [WeaponType.RIFLE]: {
    type: WeaponType.RIFLE,
    name: "中正式步枪",
    rpm: 60,
    accuracy: 0.95,
    magSize: 5,
    reloadTime: 2.5,
    damage: 100, // 1 shot kill infantry
    description: "抗战时期中国军队的主力步枪，仿制自德国毛瑟步枪，精度高，威力大。"
  },
  [WeaponType.SMG]: {
    type: WeaponType.SMG,
    name: "冲锋枪",
    rpm: 800,
    accuracy: 0.6,
    magSize: 30,
    reloadTime: 3.0,
    damage: 25, // 4 shots for infantry
    description: "拥有极高射速的自动武器，适合短距离压制，但弹药消耗极快，精度较低。"
  },
  [WeaponType.SNIPER]: {
    type: WeaponType.SNIPER,
    name: "狙击步枪",
    rpm: 30,
    accuracy: 1.0,
    magSize: 1,
    reloadTime: 2.0,
    damage: 500, // Massive damage
    description: "配备光学瞄准镜的步枪，可以进行精确的远程打击。一击必杀。"
  }
};

export const LEVELS: LevelConfig[] = [
  {
    id: "jungle",
    name: "青纱帐 (丛林)",
    description: "敌军正借助茂密的植被掩护悄悄逼近。注意观察草丛和树后的动静。",
    duration: 60,
    background: "bg-gradient-to-b from-green-900 to-green-950",
    difficultyMultiplier: 1,
    spawnRate: 2000 // Slower spawn (was 600)
  },
  {
    id: "city",
    name: "巷战 (城市)",
    description: "激烈的城市攻防战。敌军从四面八方涌来，注意隐蔽在远处的射手。",
    duration: 75,
    background: "bg-gradient-to-b from-slate-700 to-slate-900",
    difficultyMultiplier: 1.2,
    spawnRate: 1800 // Slower spawn
  },
  {
    id: "mountain",
    name: "太行山 (山地)",
    description: "扼守险要关口。敌军攻势如潮，必须坚持到最后一刻！",
    duration: 90,
    background: "bg-gradient-to-b from-stone-600 to-stone-800",
    difficultyMultiplier: 1.5,
    spawnRate: 1500 // Slower spawn
  }
];

export const SKILLS = {
  TIME_SLOW: {
    name: "凝神",
    duration: 5000,
    cooldown: 30000,
    description: "精神高度集中，仿佛时间变慢。敌人移动和消失速度减半。"
  },
  AUTO_AIM: {
    name: "怒火",
    duration: 8000,
    cooldown: 40000,
    description: "满腔怒火转化为精准的直觉。自动锁定并攻击视线内的敌人。"
  }
};