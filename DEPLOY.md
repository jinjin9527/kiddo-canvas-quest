# 广域发布指南

> **当前策略（Owner）**：短期 **Quick Tunnel**；长期再考虑 Pages。

## 短期 Tunnel（默认 · 接近线上）

**终端 1** — 生产构建 + 本地预览（4173）：

```bash
cd /Users/jinjin9527/workspace/kiddo-canvas-quest
npm run build && npm run preview:lan
```

**终端 2** — 公网链接（需已安装 `cloudflared`：`brew install cloudflared`）：

```bash
cloudflared tunnel --url http://localhost:4173
```

复制输出里的 `https://xxxx.trycloudflare.com` 分享。**关掉任一终端或合盖休眠，链接即失效。**

> Vite 5 会校验 `Host` 头；本仓库已在 `vite.config.ts` 设置 `preview.allowedHosts: true`（dev 的 `server` 同理），否则 Tunnel 域名会报 *Blocked request*。

改代码后：重新 `npm run build`，重启终端 1（preview），终端 2 的 tunnel 一般可不动。

### 还在改代码、要 HMR

终端 1：`npm run dev`  
终端 2：`cloudflared tunnel --url http://localhost:5173`

---

## 方案对比

| 方案 | 适合 | 优点 | 缺点 |
|------|------|------|------|
| **A · Cloudflare Pages** | 发给任何人、长期链接 | 免费 HTTPS、全球 CDN、电脑可关 | 需 Cloudflare / Git 一次配置 |
| **B · Quick Tunnel + dev** | 临时演示、还在改代码 | 改代码即 HMR | 本机要开着；URL 会变；不适合正式广域 |
| **C · Quick Tunnel + preview** | 临时分享 build 结果 | 接近线上行为 | 本机要开着 |
| **D · 局域网** | 同一 WiFi 手机试玩 | 零账号 | 外网访问不到 |

---

## 推荐：A · Cloudflare Pages（广域）

### 1. 本地确认

```bash
cd /Users/jinjin9527/workspace/kiddo-canvas-quest
npm run build
npm run preview:lan
# 本机 http://localhost:4173 ，局域网 http://<你的局域网IP>:4173
```

### 2. 代码进 GitHub（若还没有 remote）

在 GitHub 新建空仓库后：

```bash
git add -A && git commit -m "feat: M3 match levels and deploy notes"
git remote add origin git@github.com:<你>/<repo>.git
git push -u origin main
```

### 3. Cloudflare Dashboard

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 选仓库，构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: 20（Environment variables 里可设 `NODE_VERSION=20`）
3. 部署完成后得到 `https://<project>.pages.dev`

### 4. 可选：CLI 一次性上传（不连 Git）

```bash
npm run build
npx wrangler pages deploy dist --project-name=kiddo-canvas-quest
```

（首次会要求 Cloudflare 登录；`wrangler` 由 npx 拉取即可。）

---

## 临时：B · Quick Tunnel（开发服）

安装 [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) 后：

```bash
npm run dev
# 另开终端
cloudflared tunnel --url http://localhost:5173
```

终端会打印 `https://*.trycloudflare.com`，复制分享。**关终端或停 dev 即失效。**

---

## 临时：C · Quick Tunnel + 生产构建

```bash
npm run build && npm run preview:lan
cloudflared tunnel --url http://localhost:4173
```

---

## 发布前自检

- [ ] MENU → Enter → 四关能玩；`/levels.json` 与 `/assets/*` 无 404（Network 面板）
- [ ] 手机竖屏 / 触控拖猫
- [ ] 替换 `public/assets/cat-happy.svg`、`cat-sad.svg` 后重新 `npm run build`

---

## 与文档仓关系

详细约束见 `ai_workspace/projects/kiddo_canvas_quest/07-环境与部署约束.md`；本文件放在代码仓便于部署时直接打开。
