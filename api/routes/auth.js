import { Router } from 'express';
import { usersTable, adminsTable } from '../db.js';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '请输入用户名和密码' });

  const user = usersTable.all().find(
    (u) => (u.username === username || u.email === username) && u.password === password
  );
  if (!user) return res.status(401).json({ error: '用户名或密码错误' });

  const { password: _, ...safe } = user;
  res.json(safe);
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, email, password, nickname } = req.body;
  const errors = [];
  if (!username) errors.push('用户名不能为空');
  if (!email) errors.push('邮箱不能为空');
  if (!password || password.length < 6) errors.push('密码至少 6 位');
  if (errors.length) return res.status(400).json({ error: errors.join('；') });

  const exists = usersTable.all().some((u) => u.username === username || u.email === email);
  if (exists) return res.status(409).json({ error: '用户名或邮箱已被注册' });

  const user = usersTable.insert({ username, email, password, nickname: nickname || username, phone: '', address: '' });
  const { password: _, ...safe } = user;
  res.status(201).json(safe);
});

// POST /api/auth/admin/login
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '请输入管理员账号和密码' });

  const admin = adminsTable.all().find((a) => a.username === username && a.password === password);
  if (!admin) return res.status(401).json({ error: '管理员账号或密码错误' });

  const { password: _, ...safe } = admin;
  res.json(safe);
});

// GET /api/auth/user/:id
router.get('/user/:id', (req, res) => {
  const user = usersTable.find(Number(req.params.id));
  if (!user) return res.status(404).json({ error: '用户不存在' });
  const { password: _, ...safe } = user;
  res.json(safe);
});

// PUT /api/auth/user/:id
router.put('/user/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!usersTable.find(id)) return res.status(404).json({ error: '用户不存在' });
  const updated = usersTable.update(id, req.body);
  const { password: _, ...safe } = updated;
  res.json(safe);
});

// GET /api/auth/admins
router.get('/admins', (req, res) => {
  const list = adminsTable.all().map(({ password: _, ...rest }) => rest);
  res.json(list);
});

export default router;
