# 勇者传说 / Hero's Quest

一个用纯 HTML5 Canvas + JavaScript 写的 2D 网页小游戏，无需任何依赖。

## 玩法
- **左键点击地面**：角色移动到该位置
- **左键点击怪物**：自动靠近并攻击
- **左键点击 NPC**：靠近后开始对话（再次点击或按空格继续对话）
- 击杀怪物获得 EXP 和金币，升级提升最大生命值与攻击力
- 死亡后点击「重生」回到村庄

## 怪物
- 史莱姆（新手）
- 野狼（中级）
- 巨魔（高级，地图东西两端）

## NPC
- 村长老（中央村庄，5 级时回来领奖励）
- 旅行商人
- 守卫骑士

## 本地运行
直接双击 `index.html`，或者：
```bash
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

## 部署到 GitHub Pages（让别人能玩）
```bash
git init
git add .
git commit -m "Initial game"
git branch -M main
git remote add origin https://github.com/rola2005-klc/testgameclaude.git
git push -u origin main
```
然后在 GitHub 仓库页面：
1. 进入 **Settings → Pages**
2. **Source** 选 `Deploy from a branch`
3. **Branch** 选 `main`，路径 `/ (root)`
4. 保存后等 1-2 分钟，访问 `https://rola2005-klc.github.io/testgameclaude/` 就能玩了，把这个链接发给朋友即可。
