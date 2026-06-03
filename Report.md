# 第四次作业报告

**姓名：** 张三  
**学号：** 20240001  
**作业名称：** React 商城系统

---

## 1. 组员分工

| 姓名 | 学号 | 分工与产出 | 贡献占比 |
|------|------|-----------|---------|
| 张三（组长） | 20240001 | 项目架构、前台页面、Context 状态管理 | 30% |
| 李四 | 20240002 | 后台管理端、Ant Design 集成 | 25% |
| 王五 | 20240003 | UI 设计、CSS 样式、组件开发 | 25% |
| 赵六 | 20240004 | 测试、文档撰写、数据层 Service | 20% |

**分工说明：** 产品设计由全组讨论完成；前台编码与 UI 设计由李四、王五负责；后台编码由李四主导；Service 数据层与测试由赵六负责；本文档由组长汇总撰写。

---

## 2. 项目结构

```
AppLayout（前台布局：Header + Footer + Outlet）
├── HomePage           ← 商城主页面（搜索框、轮播图、热门商品）
├── CategoryPage       ← 分类索引与分类商品列表
├── CartPage           ← 购物车
├── UserPage           ← 个人中心
├── LoginPage          ← 用户登录
├── RegisterPage       ← 用户注册
├── DetailPage         ← 商品详情页
├── CreateOrderPage    ← 创建订单页
├── PayPage            ← 支付页面（倒计时模拟）
├── OrderListPage      ← 订单列表页
├── OrderDetailPage    ← 订单详情页
AdminLayout（后台布局：Ant Design 侧边栏）
├── AdminLoginPage     ← 后台登录
├── AdminProductPage   ← 商品管理
└── AdminOrderPage     ← 订单管理
```

| 页面/组件 | 职责 |
|-----------|------|
| AppLayout | 前台统一布局，包含导航、搜索、购物车角标 |
| HomePage | 轮播推荐、热门商品、搜索过滤 |
| CategoryPage | 展示全部分类及分类下商品 |
| CartPage | 购物车增删改、全选、结算 |
| UserPage | 个人信息编辑、订单快捷入口 |
| LoginPage / RegisterPage | 用户认证，表单验证 |
| DetailPage | 商品详情、加购、立即购买 |
| CreateOrderPage | 确认收货地址与商品清单 |
| PayPage | 15 秒倒计时模拟支付 |
| OrderListPage / OrderDetailPage | 订单列表与详情、确认收货 |
| AdminProductPage | 商品 CRUD、上下架 |
| AdminOrderPage | 订单列表、发货、状态修改 |

## 3. 前台功能实现说明

| 功能模块 | 实现方式 |
|----------|----------|
| 商城主页面（搜索框/轮播图/热门商品） | SearchBar 同步 URL `?q=` 参数；Carousel 组件 CSS 动画轮播；ProductCard 展示 hot 标记商品 |
| 商品详情页 | 读取 goodService，支持数量选择与加购/立即购买 |
| 购物车 | CartContext + localStorage 持久化，支持全选/单选/数量修改/删除 |
| 创建订单 | 从购物车或立即购买进入，填写收货信息，调用 orderService.createOrder |
| 支付页面 | 15 秒倒计时 + 模拟成功/失败按钮 |
| 订单列表 | 按当前用户 ID 过滤 orderService 数据 |
| 订单详情 | 展示订单状态、商品、物流信息，支持确认收货 |
| 用户登录/注册 | AuthContext + authService，localStorage 持久化登录态 |

## 4. 后台管理端功能实现说明

| 功能模块 | 实现方式 |
|----------|----------|
| 后台登录 | 独立 `/admin/login` 页面，authService 验证管理员账号 |
| 权限管理 | admin 角色可访问商品+订单管理；operator 角色仅可访问订单管理 |
| 商品管理 | Ant Design Table + Modal 表单，CRUD + Switch 上下架 |
| 订单管理 | Table 展示全部订单，Popconfirm 发货，Select 修改状态 |

## 5. 路由设计

```jsx
// 前台路由（AppLayout 嵌套）
{ path: '/', Component: HomePage }
{ path: '/category', Component: CategoryPage }
{ path: '/category/:categoryId', Component: CategoryPage }
{ path: '/cart', Component: CartPage }          // 需登录
{ path: '/login', Component: LoginPage }
{ path: '/register', Component: RegisterPage }
{ path: '/detail/:goodId', Component: DetailPage }
{ path: '/createOrder', Component: CreateOrderPage }  // 需登录
{ path: '/pay/:orderId', Component: PayPage }
{ path: '/orders', Component: OrderListPage }
{ path: '/orderDetail/:orderId', Component: OrderDetailPage }

// 后台路由（AdminLayout 嵌套）
{ path: '/admin/login', Component: AdminLoginPage }
{ path: '/admin/products', Component: AdminProductPage }  // admin 角色
{ path: '/admin/orders', Component: AdminOrderPage }
```

所有页面使用 React.lazy 懒加载，Suspense 显示加载状态。

## 6. 状态管理与数据存储

- **全局状态管理方式：** Context API（AuthContext 用户认证、CartContext 购物车、ServiceContext 数据服务）
- **数据存储方式：** localStorage 持久化（商品、分类、订单、用户、购物车、登录态）
- **前后台数据联动方式：** 共用 goodService / orderService 单例，后台修改商品上下架或订单状态后，前台读取同一 localStorage 数据源实时同步

## 7. 加分项完成情况

- [ ] **后端联动**：未接入真实后端，使用 localStorage 模拟
- [x] **数据持久化**：购物车、登录态、商品/订单数据刷新后不丢失
- [x] **表单验证**：登录、注册、创建订单、后台商品表单均有字段验证与错误提示
- [x] **分页/无限滚动**：后台 Table 使用 Ant Design 分页（pageSize: 10）
- [x] **支付模拟优化**：PayPage 15 秒倒计时 + 模拟二维码 + 成功/失败分支
- [x] **响应式布局**：前台 CSS Grid/Flex 断点适配 768px / 480px
- [x] **性能优化**：React.lazy 路由懒加载、ProductCard React.memo
- [ ] **单元测试**：未编写
- [ ] **部署上线**：未部署

## 8. 遇到的问题与解决方案

| 问题 | 解决方案 |
|------|----------|
| 旧版 orderService 数据结构不兼容 | 扩展 order 模型支持 items 数组、收货地址等字段，保留旧数据兼容 |
| 后台 operator 角色误访问商品管理 | ProtectedRoute 增加 allowedRoles 参数，侧边栏按角色过滤菜单 |
| 支付页倒计时 StrictMode 双渲染 | 使用 setTimeout 链式倒计时，组件卸载时 clearTimeout |
