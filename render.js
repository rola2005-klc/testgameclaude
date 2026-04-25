function render() {
  ctx.fillStyle = "#2d4a2b";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawGrid();
  drawDecor();
  drawVillage();
  npcs.forEach(drawNPC);
  monsters.forEach(drawMonster);
  drawPlayer();
  drawDamageTexts();
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255,255,255,.04)";
  ctx.lineWidth = 1;
  const step = 80;
  const ox = -camera.x % step;
  const oy = -camera.y % step;
  for (let x = ox; x < VIEW_W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, VIEW_H); ctx.stroke();
  }
  for (let y = oy; y < VIEW_H; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VIEW_W, y); ctx.stroke();
  }
}

function drawVillage() {
  const cx = 1200 - camera.x;
  const cy = 1200 - camera.y;
  ctx.fillStyle = "#3d6b3a";
  ctx.beginPath(); ctx.arc(cx, cy, 220, 0, Math.PI * 2); ctx.fill();
  drawHouse(1100, 1180);
  drawHouse(1280, 1170);
  drawHouse(1180, 1280);
}

function drawHouse(wx, wy) {
  const x = wx - camera.x, y = wy - camera.y;
  if (x < -60 || x > VIEW_W + 60 || y < -60 || y > VIEW_H + 60) return;
  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(x - 22, y - 18, 44, 36);
  ctx.fillStyle = "#c0392b";
  ctx.beginPath();
  ctx.moveTo(x - 26, y - 18);
  ctx.lineTo(x, y - 38);
  ctx.lineTo(x + 26, y - 18);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#3a2410";
  ctx.fillRect(x - 5, y - 2, 10, 20);
}

function drawDecor() {
  for (const d of DECOR) {
    const x = d.x - camera.x, y = d.y - camera.y;
    if (x < -30 || x > VIEW_W + 30 || y < -30 || y > VIEW_H + 30) continue;
    if (d.kind === "tree") {
      ctx.fillStyle = "#3a2410";
      ctx.fillRect(x - 3, y - 4, 6, 14);
      ctx.fillStyle = "#1e5e2a";
      ctx.beginPath(); ctx.arc(x, y - 8, 14, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = "#7d7d7d";
      ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawNPC(n) {
  const x = n.x - camera.x, y = n.y - camera.y;
  if (x < -40 || x > VIEW_W + 40 || y < -40 || y > VIEW_H + 40) return;
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.beginPath(); ctx.ellipse(x, y + 14, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = n.color;
  ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#ffd56b";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("!", x, y - 18);
  ctx.fillStyle = "#fff";
  ctx.font = "11px sans-serif";
  ctx.fillText(n.name, x, y + 30);
}

function drawMonster(m) {
  if (m.dead) return;
  const x = m.x - camera.x, y = m.y - camera.y;
  if (x < -40 || x > VIEW_W + 40 || y < -40 || y > VIEW_H + 40) return;
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.beginPath(); ctx.ellipse(x, y + m.radius, m.radius, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = m.color;
  ctx.beginPath(); ctx.arc(x, y, m.radius, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x - 4, y - 2, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 4, y - 2, 2.5, 0, Math.PI * 2); ctx.fill();
  if (m.hp < m.maxHp) {
    const w = m.radius * 2;
    ctx.fillStyle = "#400";
    ctx.fillRect(x - w/2, y - m.radius - 9, w, 4);
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(x - w/2, y - m.radius - 9, w * (m.hp / m.maxHp), 4);
  }
}

function drawPlayer() {
  const x = player.x - camera.x, y = player.y - camera.y;
  // 走路动画
  const moving = !!(player.target || player.attackTarget);
  const t = moving ? Math.sin(performance.now() / 100) : 0;
  const legSwing = t * 3;

  // 影子
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.beginPath(); ctx.ellipse(x, y + 18, 12, 4, 0, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = "#000"; ctx.lineWidth = 1.5;

  // 腿
  ctx.fillStyle = "#3b5998";
  ctx.fillRect(x - 6, y + 6, 5, 12 + legSwing);
  ctx.fillRect(x + 1, y + 6, 5, 12 - legSwing);
  ctx.strokeRect(x - 6, y + 6, 5, 12 + legSwing);
  ctx.strokeRect(x + 1, y + 6, 5, 12 - legSwing);

  // 身体（绿衣服）
  ctx.fillStyle = "#2ecc71";
  ctx.fillRect(x - 8, y - 4, 16, 12);
  ctx.strokeRect(x - 8, y - 4, 16, 12);
  // 腰带
  ctx.fillStyle = "#5a3a1a";
  ctx.fillRect(x - 8, y + 5, 16, 2);

  // 手臂
  ctx.fillStyle = "#f4c98c";
  ctx.fillRect(x - 11, y - 2, 4, 9 - legSwing);
  ctx.fillRect(x + 7, y - 2, 4, 9 + legSwing);
  ctx.strokeRect(x - 11, y - 2, 4, 9 - legSwing);
  ctx.strokeRect(x + 7, y - 2, 4, 9 + legSwing);

  // 头
  ctx.fillStyle = "#f4c98c";
  ctx.beginPath(); ctx.arc(x, y - 10, 7, 0, Math.PI * 2); ctx.fill();
  ctx.stroke();
  // 头发
  ctx.fillStyle = "#5a3a1a";
  ctx.beginPath();
  ctx.arc(x, y - 12, 7, Math.PI, 2 * Math.PI);
  ctx.fill();
  // 眼睛
  ctx.fillStyle = "#000";
  ctx.fillRect(x - 3, y - 10, 1.5, 2);
  ctx.fillRect(x + 1.5, y - 10, 1.5, 2);

  // 剑（右手举）
  ctx.strokeStyle = "#bdc3c7"; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + 11, y + 3);
  ctx.lineTo(x + 20, y - 8);
  ctx.stroke();
  ctx.fillStyle = "#5a3a1a";
  ctx.fillRect(x + 9, y + 2, 4, 3);

  // 攻击挥剑动画
  if (player.attackTarget && player.attackCooldown > 0.4) {
    ctx.strokeStyle = "rgba(255,255,255,.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 10, y, 16, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  }

  // 移动目标标记
  if (player.target) {
    const tx = player.target.x - camera.x, ty = player.target.y - camera.y;
    ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(tx, ty, 6, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawDamageTexts() {
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  for (const d of damageTexts) {
    ctx.globalAlpha = Math.max(0, d.life);
    ctx.fillStyle = d.color;
    ctx.strokeStyle = "#000"; ctx.lineWidth = 3;
    ctx.strokeText(d.text, d.x - camera.x, d.y - camera.y);
    ctx.fillText(d.text, d.x - camera.x, d.y - camera.y);
  }
  ctx.globalAlpha = 1;
}
