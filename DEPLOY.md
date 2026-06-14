# 部署说明

## 项目结构

```
LW-01-01/                    # React 前端
├── src/
├── public/
├── vite.config.js
└── vercel.json              # 仅 SPA 路由

AtelierShop-backend/AtelierShop/  # Spring Boot 后端
├── src/main/java/com/su/ateliershop/
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml  # 本地密钥（不入库）
│   ├── mapper/
│   └── sql/
└── pom.xml
```

## 环境要求

- **Node.js** ≥ 18（前端）
- **Java** 17 + **Maven** 3.9+（后端）
- **MySQL** 8.0+

## 数据库初始化

```bash
mysql -u root -p < F:\AtelierShop-backend\AtelierShop\src\main\resources\sql\schema.sql
mysql -u root -p < F:\AtelierShop-backend\AtelierShop\src\main\resources\sql\seed.sql
```

## 后端配置

1. 复制 `application-dev.yml.example` 为 `application-dev.yml`
2. 填写 MySQL 用户名、密码
3. 填写阿里云 OSS 密钥（或使用环境变量 `ALIOSS_*`）

## 本地开发

### 终端 1：启动 Spring Boot 后端

```bash
cd F:\AtelierShop-backend\AtelierShop
mvn spring-boot:run
```

后端地址：`http://localhost:8080/api`

### 终端 2：启动前端

```bash
cd C:\Users\35338\Desktop\LW-01-01
npm install
npm run dev
```

前端地址：`http://localhost:5173`，Vite 将 `/api` 代理到 `http://localhost:8080`。

## 生产部署

| 组件 | 推荐方式 |
|------|----------|
| 前端 | Vercel（`npm run build` → `dist/`） |
| 后端 | 云服务器 / Docker 运行 Spring Boot |
| 数据库 | MySQL 云实例 |

前端 `.env.production` 中设置：

```
VITE_API_BASE=https://你的后端域名/api
```

## 演示账号

- 前台：`demo / 123456`
- 管理员：`admin / admin123`
- 运营：`operator / op123456`

## 验证

- `GET http://localhost:8080/api/health`
- `GET http://localhost:8080/api/goods`
- 管理端上传图片 → OSS 返回 URL
