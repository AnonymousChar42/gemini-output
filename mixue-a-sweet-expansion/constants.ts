import { Tech, TechCategory, Flavor } from './types';

export const TOTAL_POPULATION_ESTIMATE = 1400000000;
// WIN_THRESHOLD_PROVINCES removed in favor of dynamic calculation
export const MAX_DAYS = 1000;

export const PROVINCE_FLAVORS: Flavor[] = [
  { province: "北京", name: "豆汁奶茶", description: "融合老北京豆汁的独特酸醇与奶茶的绵密，一口唤醒胡同记忆。" },
  { province: "天津", name: "煎饼果子风味奶茶", description: "当香浓奶茶碰撞煎饼果子的咸香酥脆，街头交响。" },
  { province: "河北", name: "驴肉火烧味奶茶", description: "杯壁涂抹驴肉香味的秘制酱料，撒上酥脆火烧碎。" },
  { province: "山西", name: "老陈醋风味奶茶", description: "陈醋的醇厚酸香与奶茶的甜润交织。" },
  { province: "内蒙古", name: "草原咸奶茶", description: "传统咸奶茶与现代茶饮的碰撞，奶香浓郁带一丝盐意。" },
  { province: "辽宁", name: "雪绵豆沙茶", description: "绵密如雪，裹着红豆沙的细腻清甜。" },
  { province: "吉林", name: "长白山奶茶", description: "融入长白山野蜜与草本精华，清润如山泉。" },
  { province: "黑龙江", name: "格瓦斯风味奶茶", description: "格瓦斯的麦芽发酵香气融入奶茶，气泡感十足。" },
  { province: "上海", name: "轻奢版奶茶", description: "极简包装搭配稀有茶底与定制奶源。" },
  { province: "江苏", name: "盐水鸭风味奶茶", description: "盐水鸭的咸鲜风味以秘制酱汁融入奶茶。" },
  { province: "浙江", name: "西湖龙井奶茶", description: "龙井茶汤清香雅致，与鲜奶缓缓相融。" },
  { province: "安徽", name: "臭鳜鱼奶茶", description: "徽州人的“臭香”执念，猎奇级地域符号。" },
  { province: "福建", name: "功夫茶风味奶茶", description: "以铁观音、大红袍等闽茶为魂，茶韵悠长。" },
  { province: "江西", name: "景德镇瓷器杯奶茶", description: "奶茶盛于仿古瓷杯，釉色温润。" },
  { province: "山东", name: "大酱奶茶", description: "以山东传统豆酱调制出独特咸鲜底味。" },
  { province: "河南", name: "少林寺禅茶", description: "融入少林禅茶理念，淡雅清心。" },
  { province: "湖北", name: "热干面芝麻酱奶茶", description: "芝麻酱挂壁，咸甜交织的浓郁口感。" },
  { province: "湖南", name: "加湖南辣椒奶茶", description: "奶盖上洒落辣椒粉，入口先甜后辣。" },
  { province: "广东", name: "凉茶奶茶", description: "癍痧凉茶与奶茶的极致融合，苦中回甘。" },
  { province: "广西", name: "螺蛳粉味奶茶", description: "酸笋香与螺汤鲜隐现于奶香，还原柳州风味。" },
  { province: "海南", name: "椰子奶茶", description: "现开椰青水搭配椰肉打制，清爽不腻。" },
  { province: "重庆", name: "九宫格火锅奶茶", description: "杯分九格，牛油辣、花椒麻、醪糟甜。" },
  { province: "四川", name: "花椒奶盖奶茶", description: "绵密奶盖上撒满汉源花椒粉，麻香穿透奶甜。" },
  { province: "贵州", name: "折耳根风味奶茶", description: "折耳根研磨入茶，独特草本香气撩拨舌尖。" },
  { province: "云南", name: "见手清奶茶", description: "灵感源自野生菌的奇幻鲜美，搭配可食用蓝莓粉调色。" },
  { province: "西藏", name: "红景天奶茶", description: "融入高原圣草红景天，淡淡药香平衡奶甜。" },
  { province: "陕西", name: "肉夹馍口味奶茶", description: "卤汁风味糖浆模拟腊汁醇厚，杯壁涂抹油酥碎。" },
  { province: "甘肃", name: "兰州拉面汤奶茶", description: "牛骨清汤风味与奶茶相遇，撒上香菜末。" },
  { province: "青海", name: "青稞奶茶", description: "炒制青稞粒脆香漂浮，糌粑粉融入茶底。" },
  { province: "宁夏", name: "清真奶茶", description: "选用纯净奶源与冰糖，滋味质朴醇厚。" },
  { province: "新疆", name: "葡萄干奶茶", description: "奶茶底浸泡新疆葡萄干与坚果碎，果香浓郁。" },
  { province: "香港", name: "港式茶餐厅奶茶", description: "丝袜茶底浓烈醇厚，配淡奶经典比例。" },
  { province: "澳门", name: "赌场限定奶茶", description: "金箔点缀，杯型似骰盅，附送“好运签”。" },
  { province: "台湾", name: "QQㄋㄟㄋㄟ好喝到咩噗茶", description: "珍珠、芋圆、布丁堆叠出丰富嚼感，甜度爆表。" },
  { province: "南海诸岛", name: "海风味奶茶", description: "萃取深海微量元素，自带天然海盐的咸鲜与清冽，仿佛海风拂面。" }
];

export const TECH_TREE_DATA: Tech[] = [
  // Transmission (Expansion Speed)
  { id: 't1', name: '步行流量 (行人传播)', description: '提升相邻省份扩散速度。', cost: 10, category: TechCategory.TRANSMISSION, purchased: false, effectType: 'spread_rate', effectValue: 0.5 },
  { id: 't2', name: '商圈吸附 (商业区)', description: '显著提升城市区域开店速度。', cost: 25, category: TechCategory.TRANSMISSION, purchased: false, effectType: 'income_rate', effectValue: 0.5, parentId: 't1' },
  { id: 't3', name: '交通枢纽 (跨省)', description: '允许向非相邻省份跳跃传播。', cost: 50, category: TechCategory.TRANSMISSION, purchased: false, effectType: 'cross_border', effectValue: 1, parentId: 't2' },
  { id: 't4', name: '县域下沉 (农村包围)', description: '极大提升低线市场渗透率。', cost: 75, category: TechCategory.TRANSMISSION, purchased: false, effectType: 'spread_rate', effectValue: 1.5, parentId: 't2' },

  // Abilities (Brand Power)
  { id: 'a1', name: '成本控制', description: '降低开店门槛，小幅提升收入。', cost: 15, category: TechCategory.ABILITY, purchased: false, effectType: 'income_rate', effectValue: 0.2 },
  { id: 'a2', name: '魔性主题曲', description: '大幅提升品牌认知，加速所有传播。', cost: 30, category: TechCategory.ABILITY, purchased: false, effectType: 'spread_rate', effectValue: 0.8, parentId: 'a1' },
  { id: 'a3', name: '极致性价比', description: '显著提升市场份额，压制竞品。', cost: 60, category: TechCategory.ABILITY, purchased: false, effectType: 'income_rate', effectValue: 1.0, parentId: 'a2' },
  { id: 'a4', name: '联名限定款', description: '短时间内爆发式增长。', cost: 100, category: TechCategory.ABILITY, purchased: false, effectType: 'spread_rate', effectValue: 2.0, parentId: 'a3' },

  // Resistance (Defense)
  { id: 'r1', name: '本地化口味', description: '降低新区域的排斥反应。', cost: 20, category: TechCategory.RESISTANCE, purchased: false, effectType: 'resistance', effectValue: 0.3 },
  { id: 'r2', name: '供应链强化', description: '提升店铺存活率，抵抗成本事件。', cost: 40, category: TechCategory.RESISTANCE, purchased: false, effectType: 'resistance', effectValue: 0.5, parentId: 'r1' },
  { id: 'r3', name: '竞对压制', description: '针对其他奶茶品牌的防御能力。', cost: 80, category: TechCategory.RESISTANCE, purchased: false, effectType: 'resistance', effectValue: 0.8, parentId: 'r2' },
];

// Simplified Adjacency List for Expansion Logic
export const PROVINCE_ADJACENCY: Record<string, string[]> = {
  "北京": ["天津", "河北"],
  "天津": ["北京", "河北"],
  "河北": ["北京", "天津", "山西", "内蒙古", "辽宁", "河南", "山东"],
  "山西": ["河北", "内蒙古", "陕西", "河南"],
  "内蒙古": ["河北", "山西", "陕西", "宁夏", "甘肃", "黑龙江", "吉林", "辽宁"],
  "辽宁": ["河北", "内蒙古", "吉林"],
  "吉林": ["内蒙古", "辽宁", "黑龙江"],
  "黑龙江": ["内蒙古", "吉林"],
  "上海": ["江苏", "浙江"],
  "江苏": ["上海", "浙江", "安徽", "山东"],
  "浙江": ["上海", "江苏", "安徽", "江西", "福建"],
  "安徽": ["江苏", "浙江", "江西", "湖北", "河南", "山东"],
  "福建": ["浙江", "江西", "广东", "台湾"], // Added Taiwan link
  "江西": ["浙江", "安徽", "湖北", "湖南", "广东", "福建"],
  "山东": ["河北", "河南", "安徽", "江苏"],
  "河南": ["河北", "山西", "陕西", "湖北", "安徽", "山东"],
  "湖北": ["河南", "陕西", "重庆", "湖南", "江西", "安徽"],
  "湖南": ["湖北", "重庆", "贵州", "广西", "广东", "江西"],
  "广东": ["福建", "江西", "湖南", "广西", "海南", "香港", "澳门"],
  "广西": ["云南", "贵州", "湖南", "广东"],
  "海南": ["广东", "台湾", "南海诸岛"], // Added Taiwan and Nanhai links
  "重庆": ["陕西", "四川", "贵州", "湖南", "湖北"],
  "四川": ["青海", "甘肃", "陕西", "重庆", "贵州", "云南", "西藏"],
  "贵州": ["四川", "重庆", "湖南", "广西", "云南"],
  "云南": ["西藏", "四川", "贵州", "广西"],
  "西藏": ["新疆", "青海", "四川", "云南"],
  "陕西": ["内蒙古", "山西", "河南", "湖北", "重庆", "四川", "甘肃", "宁夏"],
  "甘肃": ["新疆", "青海", "四川", "陕西", "宁夏", "内蒙古"],
  "青海": ["新疆", "甘肃", "四川", "西藏"],
  "宁夏": ["内蒙古", "陕西", "甘肃"],
  "新疆": ["甘肃", "青海", "西藏"],
  "香港": ["广东"],
  "澳门": ["广东"],
  "台湾": ["福建", "海南", "南海诸岛"], // Added Hainan and Nanhai links
  "南海诸岛": ["海南", "台湾"] // Added Nanhai links
};