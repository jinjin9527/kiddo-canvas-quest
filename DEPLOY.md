# 部署指南

> **当前策略（Owner · 2026-08-30）**：**GitHub Pages** 为默认广域发布；Quick Tunnel 仅作本地调试。

---

## 线上 Demo（固定 · 可关本机）

| 项 | 值 |
|----|-----|
| **试玩 URL** | https://jinjin9527.github.io/kiddo-canvas-quest/ |
| **GitHub 仓库** | https://github.com/jinjin9527/kiddo-canvas-quest |
| **内容** | こねこゲーム · 4 关平假名填字 · 3–5 岁向 UI |
| **固定二维码** | [`docs/koneko-game-qr.png`](./docs/koneko-game-qr.png)（512×512） |
| **部署方式** | push `main` → Actions `Deploy to GitHub Pages` |

---

## 日常更新

```bash
git add -A && git commit -m "说明" && git push
```

Actions 跑绿后约 1 分钟生效。手机访问建议 **强制刷新** 或无痕窗口。

---

## 首次上线（已完成 · 备忘）

1. 仓库 `jinjin9527/kiddo-canvas-quest`（public）
2. remote：`git@github.com:jinjin9527/kiddo-canvas-quest.git`
3. Settings → Pages → **Source: GitHub Actions**（勿选 Jekyll / Static HTML 模板）
4. 首次 push 若 remote 有 GitHub 自动 README：`git push --force`（仅空仓初始化时）

---

## 技术要点（踩坑结论）

### 1. Vite `base` 与仓库名一致

```typescript
// vite.config.ts
base: '/kiddo-canvas-quest/',
```

### 2. 运行时资源路径必须用 `BASE_URL`

**错误**：`fetch('/campaign2/levels.json')` → Pages 上 404，按钮无反应。

**正确**：`src/assetPath.ts` + `import.meta.env.BASE_URL`

```typescript
fetch(assetPath('campaign2/levels.json'))
assetPath('assets/cat-idle.png')
```

凡 `public/` 下的 JSON、图片、fetch 路径均走 `assetPath()`。

### 3. 本地 dev / preview

因 `base` 含子路径，开发时打开：

- dev：`http://localhost:5173/kiddo-canvas-quest/`
- preview：`http://localhost:4173/kiddo-canvas-quest/`

---

## 发布前自检

- [ ] MENU → **はじめる** → 4 关能玩
- [ ] Network：`campaign2/levels.json` **200**（非 404）
- [ ] `/assets/cat-idle.png` 等图片 **200**
- [ ] 手机竖屏触控正常
- [ ] 无红色 **よみこみに　しっぱい　しました**

---

## 方案对比

| 方案 | URL | 本机 | 二维码 |
|------|-----|------|--------|
| **GitHub Pages** ✅ | 固定 | 可关 | **可长期用** |
| Quick Tunnel | 每次变 | 必须开 | ❌ 勿用于正式 Demo |
| 局域网 | 192.168.x.x | 必须开 | 仅同 WiFi |

---

## 临时：Quick Tunnel（仅调试）

```bash
npm run dev
cloudflared tunnel --url http://localhost:5173
```

关终端即失效。详见 `other/neko_report_2026/_bb_notes/demo_tunnel_constraints.md`。

---

## Git 参考

```bash
# SSH（已配置）
git remote set-url origin git@github.com:jinjin9527/kiddo-canvas-quest.git

# HTTPS + PAT
git remote set-url origin https://github.com/jinjin9527/kiddo-canvas-quest.git
```
