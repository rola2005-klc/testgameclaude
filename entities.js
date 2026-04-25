// 世界尺寸
const WORLD_W = 2400;
const WORLD_H = 2400;

// NPC 定义
const NPC_DEFS = [
  {
    id: "elder",
    name: "村长老",
    x: 1200, y: 1200,
    color: "#f1c40f",
    dialogues: [
      "年轻人，你终于醒了……",
      "我们的村庄被怪物围攻，森林里到处都是史莱姆和野狼。",
      "向北去森林清剿它们吧，每杀一只都能让你变强。",
      "记得回来找我，等你升到 5 级，我有奖励给你。"
    ],
    reward: { level: 5, gold: 200, given: false }
  },
  {
    id: "merchant",
    name: "旅行商人",
    x: 900, y: 1350,
    color: "#9b59b6",
    dialogues: [
      "嘿！想买点什么吗？",
      "可惜……我的货还在路上，下次再来吧。",
      "（他朝你眨了眨眼）"
    ]
  },
  {
    id: "knight",
    name: "守卫骑士",
    x: 1450, y: 1100,
    color: "#3498db",
    dialogues: [
      "站住！哦，是你啊。",
      "听说东边山洞里有个大家伙，等你够强了再去试试。",
      "新手最好先打史莱姆练级。"
    ]
  }
];

// 怪物模板
const MONSTER_TYPES = {
  slime: {
    name: "史莱姆", color: "#27ae60", radius: 14,
    hp: 30, atk: 5, speed: 50, xp: 20, gold: 5, aggro: 180
  },
  wolf: {
    name: "野狼", color: "#7f8c8d", radius: 16,
    hp: 60, atk: 12, speed: 90, xp: 50, gold: 15, aggro: 260
  },
  ogre: {
    name: "巨魔", color: "#8e44ad", radius: 22,
    hp: 180, atk: 25, speed: 60, xp: 150, gold: 60, aggro: 300
  }
};

// 怪物刷新点
const SPAWNS = [
  { type: "slime", x: 1300, y: 700 },
  { type: "slime", x: 1100, y: 600 },
  { type: "slime", x: 1500, y: 750 },
  { type: "slime", x: 900, y: 800 },
  { type: "slime", x: 1700, y: 650 },
  { type: "wolf",  x: 700,  y: 400 },
  { type: "wolf",  x: 1900, y: 450 },
  { type: "wolf",  x: 1500, y: 300 },
  { type: "wolf",  x: 600,  y: 1700 },
  { type: "wolf",  x: 1900, y: 1700 },
  { type: "ogre",  x: 2100, y: 1100 },
  { type: "ogre",  x: 300,  y: 1300 }
];

// 静态装饰物 (树/石头) — 仅视觉，不阻挡
const DECOR = (() => {
  const arr = [];
  // 边界树墙
  for (let i = 0; i < 60; i++) {
    arr.push({ kind: "tree", x: 60 + i * 40, y: 60 });
    arr.push({ kind: "tree", x: 60 + i * 40, y: WORLD_H - 60 });
    arr.push({ kind: "tree", x: 60, y: 60 + i * 40 });
    arr.push({ kind: "tree", x: WORLD_W - 60, y: 60 + i * 40 });
  }
  // 随机散点
  const rng = mulberry32(42);
  for (let i = 0; i < 220; i++) {
    arr.push({
      kind: rng() < 0.7 ? "tree" : "rock",
      x: 150 + rng() * (WORLD_W - 300),
      y: 150 + rng() * (WORLD_H - 300)
    });
  }
  // 村庄中心一片空地：清掉中心 200 半径内的装饰
  return arr.filter(d => Math.hypot(d.x - 1200, d.y - 1200) > 220);
})();

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
