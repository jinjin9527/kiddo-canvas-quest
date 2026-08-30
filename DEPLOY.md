# 部署指南

> **当前策略（Owner）**：**GitHub Pages** 为默认广域发布；Quick Tunnel 仅作临时调试。

## 线上地址

https://jinjin9527.github.io/kiddo-canvas-quest/

`push` 到 `main` 后，GitHub Actions（`.github/workflows/deploy-pages.yml`）自动构建并部署。

---

## 首次上线（一次性）

### 1. 本地 push

```bash
cd kiddo-canvas-quest
git remote add origin git@github.com:jinjin9527/kiddo-canvas-quest.git
git push -u origin main
```

（HTTPS 远程：`https://github.com/jinjin9527/kiddo-canvas-quest.git`）

### 2. 启用 GitHub Pages

1. 打开 https://github.com/jinjin9527/kiddo-canvas-quest/settings/pages
2. **Build and deployment** → **Source** 选 **GitHub Actions**
3. 等 Actions 跑绿（约 1–3 分钟）
4. 访问 https://jinjin9527.github.io/kiddo-canvas-quest/

### 3. 发布前自检

- [ ] MENU → はじめる → 4 关假名能玩
- [ ] Network 无 404（`/kiddo-canvas-quest/assets/*`、`/kiddo-canvas-quest/campaign2/levels.json`）
- [ ] 手机竖屏触控正常

---

## 方案对比

| 方案 | 适合 | 优点 | 缺点 |
|------|------|------|------|
| **A · GitHub Pages** | 正式 Demo、长期链接 | 免费 HTTPS；本机可关；push 即部署 | 子路径需配 `vite base` |
| **B · Cloudflare Pages** | 备选 CDN | 全球 CDN | 需另配 Cloudflare |
| **C · Quick Tunnel** | 临时调试、HMR | 改代码即刷新 | 本机要开着；URL 会变 |
| **D · 局域网** | 同一 WiFi 试玩 | 零账号 | 外网访问不到 |

---

## 技术要点

- `vite.config.ts` 中 `base: '/kiddo-canvas-quest/'` 与仓库名一致
- 静态资源走 `public/`，构建输出在 `dist/`
- Node 20（Actions 与本地建议一致）

---

## 临时：Quick Tunnel（开发 / 调试）

**终端 1** — 开发服：

```bash
npm run dev
```

**终端 2** — 公网链接（需 `brew install cloudflared`）：

```bash
cloudflared tunnel --url http://localhost:5173
```

复制 `https://*.trycloudflare.com` 分享。**关终端即失效。**

生产 build + tunnel：

```bash
npm run build && npm run preview:lan
cloudflared tunnel --url http://localhost:4173
```

> Vite 5 校验 `Host` 头；`vite.config.ts` 已设 `allowedHosts: true`，否则 Tunnel 会报 *Blocked request*。

---

## 备选：Cloudflare Pages

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Connect to Git**
2. Build command: `npm run build` · Output: `dist` · Node: 20
3. 若用子路径部署，同样需正确设置 `base`
