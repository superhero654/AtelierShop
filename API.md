# Atelier Shop API 调试文档

**基础地址：** `http://localhost:3001/api`

**认证方式：** 
- 通过 Header 传递 `X-User-Id`（普通用户）或 `X-Admin-Id`（管理员）
- 前端登录后自动在 `api.js` 请求工具中附加

---

## 一、商品接口

### 1.1 获取商品列表

```
GET /api/goods
```

**查询参数（可选）**

| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | 筛选状态：`on` 上架 / `off` 下架 |
| categoryId | int | 按分类筛选 |
| hot | int | 热门推荐：传 `1` |
| keyword | string | 关键词搜索（匹配名称和描述） |

**响应示例**

```json
[
  {
    "id": 1,
    "name": "无线降噪耳机 Pro",
    "price": 1299,
    "categoryId": 1,
    "img": "/img.png",
    "description": "主动降噪，40小时续航，Hi-Fi 音质，舒适佩戴体验。",
    "stock": 50,
    "status": "on",
    "hot": true
  }
]
```

### 1.2 获取商品详情

```
GET /api/goods/:id
```

**响应示例**

```json
{
  "id": 1,
  "name": "无线降噪耳机 Pro",
  "price": 1299,
  "categoryId": 1,
  "img": "/img.png",
  "description": "主动降噪，40小时续航，Hi-Fi 音质，舒适佩戴体验。",
  "stock": 50,
  "status": "on",
  "hot": true
}
```

### 1.3 添加商品

```
POST /api/goods
Content-Type: application/json
```

**请求体**

```json
{
  "name": "新商品",
  "price": 99.99,
  "categoryId": 1,
  "img": "https://example.com/img.jpg",
  "description": "商品描述",
  "stock": 100,
  "status": "on",
  "hot": false
}
```

**响应** `201 Created`

### 1.4 更新商品

```
PUT /api/goods/:id
Content-Type: application/json
```

**请求体**（只传需要修改的字段）

```json
{
  "price": 799,
  "stock": 50
}
```

### 1.5 删除商品

```
DELETE /api/goods/:id
```

**响应**

```json
{ "message": "已删除" }
```

### 1.6 切换上架/下架

```
PATCH /api/goods/:id/toggle-status
```

---

## 二、分类接口

### 2.1 获取分类列表

```
GET /api/categories
```

### 2.2 获取单个分类

```
GET /api/categories/:id
```

### 2.3 添加分类

```
POST /api/categories
Content-Type: application/json
```

```json
{
  "name": "食品饮料",
  "icon": "🍔",
  "description": "美食与饮品"
}
```

### 2.4 更新分类

```
PUT /api/categories/:id
```

### 2.5 删除分类

```
DELETE /api/categories/:id
```

---

## 三、用户认证

### 3.1 用户登录

```
POST /api/auth/login
Content-Type: application/json
```

**请求体**

```json
{
  "username": "demo",
  "password": "123456"
}
```

**响应**

```json
{
  "id": 1,
  "username": "demo",
  "email": "demo@shop.com",
  "nickname": "演示用户",
  "phone": "13800138000",
  "address": "北京市朝阳区建国路 88 号"
}
```

**演示账号：** `demo` / `123456`、`test` / `123456`

### 3.2 用户注册

```
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "username": "newuser",
  "email": "new@shop.com",
  "password": "123456",
  "nickname": "新用户"
}
```

### 3.3 管理员登录

```
POST /api/auth/admin/login
Content-Type: application/json
```

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**演示账号：** `admin` / `admin123`（管理员）、`operator` / `op123456`（运营）

### 3.4 获取用户信息

```
GET /api/auth/user/:id
```

### 3.5 更新用户信息

```
PUT /api/auth/user/:id
Content-Type: application/json
```

```json
{
  "nickname": "新昵称",
  "phone": "13912345678",
  "address": "新地址"
}
```

### 3.6 管理员列表

```
GET /api/auth/admins
```

**需要 Header：** `X-Admin-Id: 1`

---

## 四、订单接口

### 4.1 获取订单列表

```
GET /api/orders
```

**说明：** 
- 普通用户（附带 `X-User-Id`）返回自己的订单
- 管理员（附带 `X-Admin-Id`）返回全部订单

### 4.2 获取订单详情

```
GET /api/orders/:id
```

### 4.3 创建订单

```
POST /api/orders
Content-Type: application/json
```

**需要 Header：** `X-User-Id`

```json
{
  "items": [
    { "goodId": 1, "count": 1, "price": 1299 }
  ],
  "address": "北京市朝阳区建国路 88 号",
  "receiver": "演示用户",
  "phone": "13800138000",
  "totalPrice": 1299
}
```

### 4.4 支付订单

```
PATCH /api/orders/:id/pay
```

### 4.5 取消订单

```
PATCH /api/orders/:id/cancel
```

### 4.6 发货（管理员）

```
PATCH /api/orders/:id/ship
```

**需要 Header：** `X-Admin-Id`

### 4.7 确认收货

```
PATCH /api/orders/:id/complete
```

### 4.8 更新订单状态（管理员通用）

```
PATCH /api/orders/:id/status
Content-Type: application/json
```

**需要 Header：** `X-Admin-Id`

```json
{
  "status": 3
}
```

**订单状态说明**

| 值 | 状态 | 说明 |
|----|------|------|
| 0 | 待支付 | 新创建的订单 |
| 1 | 已支付 | 支付完成 |
| 2 | 已发货 | 管理员发货 |
| 3 | 已完成 | 买家确认收货 |
| 4 | 已取消 | 取消的订单 |

---

## 五、轮播图

### 5.1 获取轮播图列表

```
GET /api/carousel
```

### 5.2 健康检查

```
GET /api/health
```

**响应**

```json
{
  "status": "ok",
  "timestamp": "2026-06-08T00:00:00.000Z"
}
```
