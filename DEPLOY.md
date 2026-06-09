# 部署说明

## 项目结构

```
LW-01-01/
├── api/                 # Node.js/Express 后端（Vercel Serverless）
│   ├── index.js         # Express 入口
│   ├── db.js            # 内存数据库
│   ├── seed.js          # 种子数据
│   └── routes/          # 接口路由
│       ├── goods.js
│       ├── categories.js
│       ├── auth.js
│       ├── orders.js
│       └── carousel.js
├── src/                 # 前端源码（React）
│   ├── pages/
│   ├── services/
│   ├── contexts/
│   └── utils/
├── public/              # 静态资源
├── dev-server.js        # 本地 API 开发服务器入口
├── vercel.json          # Vercel 全栈部署配置
├── vite.config.js       # Vite 配置（含 API 代理）
└── API.md               # 接口文档
```

## 环境要求

- **Node.js** ≥ 18
- **npm**

## 开发环境启动

需要同时启动两个进程：

### 终端 1：启动 API 后端

```bash
npm run dev:api
```

后端运行在 `http://localhost:3001`。

### 终端 2：启动前端

```bash
npm run dev
```

前端运行在 `http://localhost:5173`，Vite 自动将 `/api` 请求代理到后端。

---

## 生产环境部署（Vercel 一键部署）

本项目前后端都部署到 Vercel，一键完成。

### 部署步骤

#### 方式一：Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

#### 方式二：GitHub 自动部署

1. 将代码推到 GitHub 仓库
2. 在 [vercel.com](https://vercel.com) 点击 **Add New Project**
3. 导入该 GitHub 仓库
4. 保持默认配置，点击 **Deploy**
5. Vercel 自动识别：
   - 前端：`npm run build` 构建，输出 `dist/`
   - 后端：`api/index.js` 作为 Serverless Function

### 部署后验证

```
https://你的项目名.vercel.app/api/health     # 后端健康检查
https://你的项目名.vercel.app/                 # 前端页面
```

---

## 数据说明

后端使用 **内存数据库**，种子数据在 `api/seed.js` 中定义。

- Vercel Serverless 环境下，每次冷启动时数据重置为种子数据
- 开发环境下，重启 `dev:api` 进程后数据重置

---

## 常见问题

**Q: 前端页面显示空白/加载中？**
> 确保 API 服务已启动。开发环境运行 `npm run dev:api`，生产环境检查 Vercel 部署日志。

**Q: 端口被占用？**
> ```bash
> # 修改 API 端口
> $env:PORT=3002; npm run dev:api
> # 同时修改 vite.config.js 中的 proxy target
> ```

**Q: 数据想重置？**
> 重启 API 服务即可（开发环境重启 `dev:api` 进程，生产环境重新部署）。
