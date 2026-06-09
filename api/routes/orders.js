import { Router } from 'express';
import { ordersTable } from '../db.js';

const router = Router();

function generateOrderNo() {
  const now = new Date();
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(now.getMilliseconds(), 3)}`;
}

// GET /api/orders
router.get('/', (req, res) => {
  const userId = req.headers['x-user-id'];
  const adminId = req.headers['x-admin-id'];
  let orders = ordersTable.all();
  if (userId) orders = orders.filter((o) => o.userId === Number(userId));
  if (!adminId && !userId) orders = [];
  orders.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
  res.json(orders);
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const order = ordersTable.find(Number(req.params.id));
  if (!order) return res.status(404).json({ error: '订单不存在' });
  res.json(order);
});

// POST /api/orders
router.post('/', (req, res) => {
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: '请先登录' });

  const { items, address, receiver, phone, totalPrice } = req.body;
  const errors = [];
  if (!items || !items.length) errors.push('订单商品不能为空');
  if (!address) errors.push('收货地址不能为空');
  if (!receiver) errors.push('收货人不能为空');
  if (!phone) errors.push('手机号不能为空');
  if (errors.length) return res.status(400).json({ error: errors.join('；') });

  const order = ordersTable.insert({
    userId, orderNo: generateOrderNo(), createTime: new Date().toISOString(),
    payTime: null, status: 0, totalPrice, address, receiver, phone, items, logistics: null,
  });
  res.status(201).json(order);
});

// PATCH /api/orders/:id/pay
router.patch('/:id/pay', (req, res) => {
  const order = ordersTable.find(Number(req.params.id));
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (order.status !== 0) return res.status(400).json({ error: '订单状态不允许支付' });
  res.json(ordersTable.update(order.id, { status: 1, payTime: new Date().toISOString() }));
});

// PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', (req, res) => {
  const order = ordersTable.find(Number(req.params.id));
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (order.status !== 0) return res.status(400).json({ error: '当前状态不允许取消' });
  res.json(ordersTable.update(order.id, { status: 4 }));
});

// PATCH /api/orders/:id/ship
router.patch('/:id/ship', (req, res) => {
  const adminId = Number(req.headers['x-admin-id']);
  if (!adminId) return res.status(401).json({ error: '请先登录管理员账号' });
  const order = ordersTable.find(Number(req.params.id));
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (order.status !== 1) return res.status(400).json({ error: '订单状态不允许发货' });
  res.json(ordersTable.update(order.id, { status: 2, logistics: { company: '顺丰速运', trackingNo: `SF${Date.now()}`, status: '运输中' } }));
});

// PATCH /api/orders/:id/complete
router.patch('/:id/complete', (req, res) => {
  const order = ordersTable.find(Number(req.params.id));
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (order.status !== 2) return res.status(400).json({ error: '订单状态不允许确认收货' });
  const logistics = order.logistics ? { ...order.logistics, status: '已签收' } : null;
  res.json(ordersTable.update(order.id, { status: 3, logistics }));
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', (req, res) => {
  const adminId = Number(req.headers['x-admin-id']);
  if (!adminId) return res.status(401).json({ error: '请先登录管理员账号' });
  const order = ordersTable.find(Number(req.params.id));
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (req.body.status == null) return res.status(400).json({ error: '缺少 status 字段' });
  res.json(ordersTable.update(order.id, { status: req.body.status }));
});

export default router;
