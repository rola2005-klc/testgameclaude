const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const VIEW_W = canvas.width;
const VIEW_H = canvas.height;

const player = {
  x: 1200, y: 1300, radius: 14,
  hp: 100, maxHp: 100,
  atk: 10, level: 1, xp: 0, xpNext: 100,
  gold: 0, speed: 180,
  target: null,
  attackTarget: null,
  attackCooldown: 0,
  alive: true
};

const monsters = SPAWNS.map(s => spawnMonster(s.type, s.x, s.y));
const npcs = NPC_DEFS.map(d => ({ ...d, dialogIndex: 0 }));
const damageTexts = [];
const camera = { x: 0, y: 0 };

let activeDialogue = null;

function spawnMonster(type, x, y) {
  const t = MONSTER_TYPES[type];
  return {
    type, ...t,
    x, y, homeX: x, homeY: y,
    maxHp: t.hp, hp: t.hp,
    state: "idle", target: null,
    attackCooldown: 0,
    dead: false, respawnAt: 0
  };
}

canvas.addEventListener("click", e => {
  if (!player.alive) return;
  const rect = canvas.getBoundingClientRect();
  const wx = (e.clientX - rect.left) + camera.x;
  const wy = (e.clientY - rect.top) + camera.y;

  if (activeDialogue) { advanceDialogue(); return; }

  const m = monsters.find(m => !m.dead && Math.hypot(m.x - wx, m.y - wy) < m.radius + 4);
  if (m) {
    player.attackTarget = m;
    player.target = null;
    return;
  }
  const n = npcs.find(n => Math.hypot(n.x - wx, n.y - wy) < 20);
  if (n) {
    if (Math.hypot(n.x - player.x, n.y - player.y) < 60) {
      openDialogue(n);
    } else {
      player.target = { x: n.x, y: n.y, npc: n };
      player.attackTarget = null;
    }
    return;
  }
  player.target = { x: wx, y: wy };
  player.attackTarget = null;
});

document.addEventListener("keydown", e => {
  if (e.code === "Space" && activeDialogue) {
    e.preventDefault();
    advanceDialogue();
  }
});

function openDialogue(npc) {
  activeDialogue = npc;
  npc.dialogIndex = 0;
  showDialogueLine();
}
function showDialogueLine() {
  const npc = activeDialogue;
  document.getElementById("dialogue-name").textContent = npc.name;
  document.getElementById("dialogue-text").textContent = npc.dialogues[npc.dialogIndex];
  document.getElementById("dialogue").classList.remove("hidden");
}
function advanceDialogue() {
  const npc = activeDialogue;
  npc.dialogIndex++;
  if (npc.dialogIndex >= npc.dialogues.length) {
    closeDialogue();
    if (npc.id === "elder" && npc.reward && !npc.reward.given && player.level >= npc.reward.level) {
      player.gold += npc.reward.gold;
      npc.reward.given = true;
      flashText(player.x, player.y - 30, `+${npc.reward.gold} 金币！`, "#ffd56b");
    }
  } else {
    showDialogueLine();
  }
}
function closeDialogue() {
  activeDialogue = null;
  document.getElementById("dialogue").classList.add("hidden");
}

function updateCamera() {
  camera.x = Math.max(0, Math.min(WORLD_W - VIEW_W, player.x - VIEW_W / 2));
  camera.y = Math.max(0, Math.min(WORLD_H - VIEW_H, player.y - VIEW_H / 2));
}

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (player.alive && !activeDialogue) update(dt);
  render();
  requestAnimationFrame(loop);
}

function update(dt) {
  updatePlayer(dt);
  monsters.forEach(m => updateMonster(m, dt));
  const t = performance.now();
  monsters.forEach(m => {
    if (m.dead && t > m.respawnAt) {
      Object.assign(m, spawnMonster(m.type, m.homeX, m.homeY));
    }
  });
  for (let i = damageTexts.length - 1; i >= 0; i--) {
    const d = damageTexts[i];
    d.life -= dt;
    d.y -= 30 * dt;
    if (d.life <= 0) damageTexts.splice(i, 1);
  }
  updateCamera();
  updateHUD();
}

function updatePlayer(dt) {
  player.attackCooldown -= dt;

  if (player.attackTarget) {
    const m = player.attackTarget;
    if (m.dead) { player.attackTarget = null; }
    else {
      const d = Math.hypot(m.x - player.x, m.y - player.y);
      const range = player.radius + m.radius + 6;
      if (d > range) {
        moveToward(player, m.x, m.y, dt);
      } else if (player.attackCooldown <= 0) {
        const dmg = player.atk + Math.floor(Math.random() * 4);
        m.hp -= dmg;
        flashText(m.x, m.y - m.radius, `-${dmg}`, "#ff6b6b");
        player.attackCooldown = 0.6;
        m.state = "chase";
        m.target = player;
        if (m.hp <= 0) onMonsterKilled(m);
      }
      return;
    }
  }

  if (player.target) {
    const d = Math.hypot(player.target.x - player.x, player.target.y - player.y);
    if (d < 4) {
      const t = player.target;
      player.target = null;
      if (t.npc) openDialogue(t.npc);
    } else {
      moveToward(player, player.target.x, player.target.y, dt);
    }
  }
}

function moveToward(ent, tx, ty, dt) {
  const dx = tx - ent.x, dy = ty - ent.y;
  const d = Math.hypot(dx, dy);
  if (d < 1) return;
  const sp = ent.speed * dt;
  ent.x += (dx / d) * Math.min(sp, d);
  ent.y += (dy / d) * Math.min(sp, d);
  ent.x = Math.max(40, Math.min(WORLD_W - 40, ent.x));
  ent.y = Math.max(40, Math.min(WORLD_H - 40, ent.y));
}

function updateMonster(m, dt) {
  if (m.dead) return;
  m.attackCooldown -= dt;
  const d = Math.hypot(player.x - m.x, player.y - m.y);

  if (m.state === "idle" && d < m.aggro) m.state = "chase";
  if (m.state === "chase" && d > m.aggro * 2) m.state = "return";

  if (m.state === "chase") {
    const range = m.radius + player.radius + 4;
    if (d > range) moveToward(m, player.x, player.y, dt);
    else if (m.attackCooldown <= 0 && player.alive) {
      const dmg = m.atk + Math.floor(Math.random() * 3);
      player.hp -= dmg;
      flashText(player.x, player.y - 20, `-${dmg}`, "#ff4d4d");
      m.attackCooldown = 1.0;
      if (player.hp <= 0) onPlayerDeath();
    }
  } else if (m.state === "return") {
    moveToward(m, m.homeX, m.homeY, dt);
    if (Math.hypot(m.x - m.homeX, m.y - m.homeY) < 8) {
      m.state = "idle";
      m.hp = m.maxHp;
    }
  }
}

function onMonsterKilled(m) {
  m.dead = true;
  m.respawnAt = performance.now() + 8000;
  player.attackTarget = null;
  player.xp += m.xp;
  player.gold += m.gold;
  flashText(m.x, m.y - 30, `+${m.xp} EXP`, "#6bd4ff");
  while (player.xp >= player.xpNext) {
    player.xp -= player.xpNext;
    player.level++;
    player.xpNext = Math.floor(player.xpNext * 1.5);
    player.maxHp += 20;
    player.hp = player.maxHp;
    player.atk += 3;
    flashText(player.x, player.y - 40, `升级！Lv.${player.level}`, "#ffd56b");
  }
}

function onPlayerDeath() {
  player.alive = false;
  document.getElementById("death").classList.remove("hidden");
}

window.game = {
  respawn() {
    player.alive = true;
    player.hp = player.maxHp;
    player.x = 1200; player.y = 1300;
    player.target = null; player.attackTarget = null;
    document.getElementById("death").classList.add("hidden");
  }
};

function flashText(x, y, text, color) {
  damageTexts.push({ x, y, text, color, life: 1.0 });
}

function updateHUD() {
  document.getElementById("hp-fill").style.width =
    Math.max(0, player.hp / player.maxHp * 100) + "%";
  document.getElementById("hp-text").textContent =
    `${Math.max(0, Math.ceil(player.hp))}/${player.maxHp}`;
  document.getElementById("xp-fill").style.width =
    (player.xp / player.xpNext * 100) + "%";
  document.getElementById("xp-text").textContent =
    `${player.xp}/${player.xpNext}`;
  document.getElementById("level").textContent = player.level;
  document.getElementById("atk").textContent = player.atk;
  document.getElementById("gold").textContent = player.gold;
}

requestAnimationFrame(loop);
