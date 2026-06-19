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

### 方式一：Railway（推荐，最方便）

1. 注册 [Railway](https://railway.app/)（免费套餐有 500 小时/月）
2. 把 `饿饿一号` 文件夹推送到 GitHub
3. 在 Railway 点 "New Project" → "Deploy from GitHub Repo"
4. 选择你的仓库
5. 在 Railway 的 "Variables" 里添加：
   - `ADMIN_PASSWORD` = 你自己设的密码
   - `PORT` = 3000
6. 部署完成！得到一个 `*.railway.app` 的网址
7. 把网址发给她

### 方式二：Render

1. 注册 [Render](https://render.com/)（免费套餐）
2. 新建 "Web Service"，连接 GitHub 仓库
3. Start Command 填：`node server.js`
4. 添加环境变量 `ADMIN_PASSWORD`
5. 部署完拿到网址

### 方式三：你自己的服务器

```bash
# 有 Node.js 就行
git clone <你的仓库>
cd 饿饿一号
ADMIN_PASSWORD=你的密码 node server.js
```

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
