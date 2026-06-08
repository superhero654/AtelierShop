# 部署说明

## 项目结构

```
LW-01-01/
├── public/              # 前端静态资源（图片等）
├── src/                 # 前端源码（React）
│   ├── pages/
│   ├── services/        # 后端 API 调用
│   ├── contexts/        # React Context
│   └── utils/
├── server/              # PHP 后端
│   ├── public/
│   │   └── index.php    # 入口路由
│   ├── src/
│   │   ├── Database.php     # JSON 文件数据库
│   │   ├── Router.php       # 路由分发器
│   │   ├── helpers.php      # 辅助函数
│   │   └── routes/          # 接口路由
│   │       ├── goods.php
│   │       ├── categories.php
│   │       ├── auth.php
│   │       ├── orders.php
│   │       └── carousel.php
│   ├── data/            # JSON 数据文件（自动生成）
│   └── package.json
├── index.html
├── vite.config.js
└── API.md               # 接口文档
```

## 环境要求

- **Node.js** ≥ 18（前端运行）
- **PHP** ≥ 8.0（后端运行）
- **npm** 或 **yarn**（前端依赖管理）

## 开发环境启动

### 第一步：安装前端依赖

```bash
npm install
```

### 第二步：启动 PHP 后端（终端 1）

```bash
cd server
php -S localhost:3001 public/index.php
```

### 第三步：启动前端开发服务器（终端 2）

```bash
npm run dev
```

前端运行在 `http://localhost:5173`，Vite 会自动把 `/api` 请求代理到后端 `http://localhost:3001`。

---

## 生产环境部署

### 方式一：前后端同机部署

#### 1. 构建前端

```bash
npm run build
```

构建产物在 `dist/` 目录。

#### 2. 部署后端

```bash
cd server
php -S 0.0.0.0:3001 public/index.php
```

使用 Nginx 或 Apache 将 `/api` 请求转发到 PHP 后端，其他请求指向前端 `dist/`。

**Nginx 配置示例：**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 方式二：前后端分离部署

前端部署到静态托管（Vercel、Netlify、OSS 等），后端部署到 VPS。

需要修改 `src/utils/api.js` 中的 API 地址（或通过环境变量配置）。

---

## 数据持久化

所有业务数据存储在 `server/data/` 目录下的 JSON 文件中：

```
server/data/
├── goods.json       # 商品数据
├── categories.json  # 分类数据
├── users.json       # 用户数据
├── admins.json      # 管理员数据
├── orders.json      # 订单数据
└── carousel.json    # 轮播图数据
```

- 数据以 JSON 格式持久化，可直接编辑
- 首次启动时自动使用种子数据初始化
- 删除 JSON 文件可重置为初始数据

---

## 常见问题

**Q: 前端页面显示空白/加载中？**
> 确保 PHP 后端已启动（`php -S localhost:3001 public/index.php`），前端需要后端提供数据。

**Q: 端口被占用？**
> 修改后端端口：`php -S localhost:3002 public/index.php`
> 同时修改 `vite.config.js` 中的 proxy target。

**Q: 数据异常想重置？**
> 删除 `server/data/` 目录下的对应 JSON 文件，重启 PHP 服务即可。
