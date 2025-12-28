import { GameConfig } from './types';

export const GAME_CONSTANTS = {
  FPS: 30,
  AUTO_SAVE_INTERVAL: 10000,
  JESUS_SPAWN_CHANCE: 0.0005, // Chance per tick to spawn Jesus
  JESUS_DRAIN_RATE: 0.005, // 0.5% per second
};

export const CONFIG: GameConfig = {
  clickUpgrades: [
    {
      id: 'auto_clicker_v1',
      name: '自动敲击模组 Mk.I',
      description: '每秒自动敲击一次木鱼。',
      cost: 100,
      triggerType: 'click_auto',
      value: 1,
      icon: '🤖'
    },
    {
      id: 'gilded_fish',
      name: '赛博镀金工艺',
      description: '木鱼升级为镀金材质，点击功德 x2',
      cost: 500,
      triggerType: 'click_multiplier',
      value: 2,
      icon: '✨'
    },
    {
      id: 'diamond_fish',
      name: '量子钻石涂层',
      description: '木鱼升级为钻石材质，点击功德 x3',
      cost: 5000,
      triggerType: 'click_multiplier',
      value: 3,
      icon: '💎'
    }
  ],
  buildings: [
    {
      id: 'perpetual_machine',
      name: '功德永动机',
      description: '自动放生与捞回的闭环系统。',
      flavorText: '“真正的慈悲，不在于拯救，而在于永远准备拯救。放生从未停止，捞起紧随其后。”',
      baseCost: 15,
      baseProduction: 0.5,
      baseUpgradeCost: 250, 
      imagePath: 'assets/water_wheel.png',
      emojis: ['🌊', '🐟', '⚙️']
    },
    {
      id: 'buddha_array',
      name: '随机佛龛供奉阵列',
      description: '电子佛龛阵列，自动切换佛像供奉。',
      flavorText: '“遇见哪尊，皆是缘分。但功德，总是实实在在的。”',
      baseCost: 100,
      baseProduction: 4,
      baseUpgradeCost: 1500,
      imagePath: 'assets/shrine.png',
      emojis: ['🗿', '🙏', '🛕', '🕉️', '☸️']
    },
    {
      id: 'incense_supplier',
      name: '全自动恒续香火供应装置',
      description: '无明火电子光效，确保香火昼夜不绝。',
      flavorText: '“香烟袅袅，程序迢迢。心诚与否不重要，续航够长才见效。”',
      baseCost: 1100,
      baseProduction: 12,
      baseUpgradeCost: 15000,
      imagePath: 'assets/incense.png',
      emojis: ['🕯️', '♨️', '🚬']
    },
    {
      id: 'fortune_system',
      name: '智能求签与功德转换系统',
      description: '无论吉凶，皆按固定系数转化为功德。',
      flavorText: '“是上签还是下签？反正都是好‘签’——能兑功德的那种。”',
      baseCost: 12000,
      baseProduction: 45,
      baseUpgradeCost: 150000,
      imagePath: 'assets/fortune.png',
      emojis: ['📜', '🔢', '🧧']
    },
    {
      id: 'amulet_terminal',
      name: '护身符自动化结缘终端',
      description: '自动请购与返还功德的商业闭环。',
      flavorText: '“请一份心安，得双份功德。稳赚不‘赔’的买卖，只在当下。”',
      baseCost: 130000,
      baseProduction: 150,
      baseUpgradeCost: 2000000,
      imagePath: 'assets/amulet.png',
      emojis: ['🧿', '🔮', '📿']
    },
    {
      id: 'bead_counter',
      name: '全自动念珠循环计数器',
      description: '静音电机驱动，每圈自动记录功德。',
      flavorText: '“人在躺平，珠在修行。圈数到了，功德自然到。”',
      baseCost: 1400000,
      baseProduction: 600,
      baseUpgradeCost: 25000000,
      imagePath: 'assets/beads.png',
      emojis: ['📿', '💫', '⭕']
    },
    {
      id: 'shaolin_robots',
      name: '微型少林十八铜人演武剧场',
      description: '黄铜微型机器人演绎武术，谢幕结算功德。',
      flavorText: '“它们负责打打杀杀，您负责接收功德。看戏，也是修行。”',
      baseCost: 20000000,
      baseProduction: 3000,
      baseUpgradeCost: 300000000,
      imagePath: 'assets/shaolin.png',
      emojis: ['🤖', '🥋', '👊']
    },
    {
      id: 'prayer_wheel_array',
      name: '智能转经轮功德阵列',
      description: '独立计数的转经轮矩阵。',
      flavorText: '“转动的不是轮子，是KPI。好在，每个轮子都有自己的‘工位’。”',
      baseCost: 330000000,
      baseProduction: 15000,
      baseUpgradeCost: 5000000000,
      imagePath: 'assets/wheel.png',
      emojis: ['🎡', '💿', '📀']
    }
  ]
};