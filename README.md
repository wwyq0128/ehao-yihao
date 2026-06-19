# 🏝️ 饿饿一号

> "有个地方一直亮着灯等你。"

一个小岛主题的温暖网站，给她看的。

---

## ✨ 功能

- **黄昏小岛** — 暖色调的手绘风格小岛，萤火虫浮动
- **灯塔来信** — 你可以在管理后台写信，她点开灯塔就能看到
- **暖言** — 点一下萤火虫，弹出一句温柔的话
- **管理后台** — 密码保护的写信界面，随时可以写新信

## 🚀 本地启动

```bash
cd 饿饿一号
node server.js
```

然后打开 http://localhost:3000

管理后台：http://localhost:3000/admin
默认密码：`ehao123`（建议部署时修改）

## ☁️ 部署指南

> 选一个方式就好，推荐 Railway。

### 方式一：Railway（推荐）

适合：想让网站一直在线、不操心维护的人。  
免费套餐每月 500 小时 ≈ 每天 16 小时在线，超出后付费起步 $5/月（无限在线）。

**步骤：**

1. 注册 [Railway](https://railway.app/)（GitHub 登录即可）
2. 点击右上角 **"New Project"**
3. 选择 **"Deploy from GitHub Repo"**
4. 授权 Railway 访问 GitHub，选择 `wwyq0128/ehao-yihao`
5. 项目创建后，点顶栏 **"Variables"**
6. 添加以下环境变量：
   - `ADMIN_PASSWORD` = 你设置的后台密码（比如 `ehao123`）
   - `SITE_PASSWORD` = 网站进入密码（可选，默认 `sbmyx`）
   - `PORT` = `3000`
7. Railway 会自动检测到 `package.json`，自动运行 `npm start`
8. 等一两分钟部署完成，点 **"Settings" → "Domains"** 生成域名
9. 拿到 `你的项目名.railway.app` 的网址，发给她就行

> 💡 以后每次往 GitHub 推送代码，Railway 会自动重新部署。

---

### 方式二：Render

适合：零预算、不介意偶尔有冷启动延迟（免费实例闲置 15 分钟会休眠）。  

**步骤：**

1. 注册 [Render](https://render.com/)（GitHub 登录）
2. 点 **"New +" → "Web Service"**
3. 连接 GitHub，选择 `wwyq0128/ehao-yihao`
4. 填以下信息：
   - **Name**: `ehao-yihao`
   - **Region**: 选离你最近的
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: 留空
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. 点 **"Advanced"**，添加环境变量：
   - `ADMIN_PASSWORD` = 你设置的后台密码
   - `SITE_PASSWORD` = 网站进入密码（可选）
6. 点 **"Create Web Service"**
7. 等几分钟部署完，拿到 `ehao-yihao.onrender.com` 的网址

> ⚠️ Render 免费实例在 15 分钟无访问后会休眠，下次打开需要等 5-10 秒冷启动。

---

### 方式三：自己的服务器 + Cloudflare Tunnel（最稳定）

适合：手头有一台 VPS 或家里的 NAS/旧电脑长期开机。  
这种方式最可控，且不需要暴露端口、不需要操心 SSL。

**前提：** 服务器上装了 Node.js。

**步骤：**

```bash
# 1. SSH 到你的服务器，拉取代码
git clone https://github.com/wwyq0128/ehao-yihao.git
cd ehao-yihao

# 2. 启动（建议用 pm2 保持后台运行）
npm install pm2 -g
ADMIN_PASSWORD=你的密码 SITE_PASSWORD=暗号 pm2 start server.js --name ehao-yihao

# 3. 配置 Cloudflare Tunnel（项目里已自带 cloudflared）
#    在 Cloudflare Zero Trust 面板创建一个 Tunnel，
#    拿到 Tunnel Token 后运行：
cloudflared tunnel run --token 你的token

# 4. 在 Cloudflare DNS 里将域名指向 Tunnel，自动 HTTPS
```

> 没有域名的话，也可以用 `cloudflared` 的 `--url` 模式生成一个临时网址：
> ```bash
> ./cloudflared-binary tunnel --url http://localhost:3000
> ```

---

### 部署后检查清单

无论用哪种方式，部署完后确认这几项：

- [ ] 打开网址，能看到"暗号"输入页（网站密码）
- [ ] 输入暗号 `sbmyx`（或你自己改的），能进入小岛
- [ ] 打开 `你的网址/admin`，能用后台密码登录
- [ ] 写一封测试信，回到小岛点灯塔能看到它
- [ ] 手机打开网址，布局正常

## 📝 管理后台

访问 `/admin`，登录后你可以：
- ✎ 写新信（标题 + 正文）
- 查看所有信件的已读/未读状态
- 删除信件

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `server.js` | 服务器（纯 Node.js，不需要装任何东西） |
| `public/index.html` | 小岛页面 |
| `public/css/style.css` | 样式 |
| `public/js/scene.js` | 小岛场景 + 萤火虫动画 |
| `public/js/letters.js` | 信件交互 |
| `public/js/warm-words.js` | 暖言功能 |
| `admin/index.html` | 管理后台 |
| `data/letters.json` | 信件数据（后台自动更新） |
| `data/warm-words.json` | 暖言数据（你可以手动改） |

## 🎨 自定义

- **改暖言**：编辑 `data/warm-words.json`
- **改密码**：启动时设置环境变量 `ADMIN_PASSWORD=你的密码`
- **改背景色**：修改 `public/css/style.css` 中的渐变值

---

> 饿饿一号 · 她的
