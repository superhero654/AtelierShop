import { Router } from 'express';
import { goodsTable, categoriesTable } from '../db.js';

const router = Router();

// GET /api/goods
router.get('/', (req, res) => {
  let result = goodsTable.all();
  const { status, categoryId, hot, keyword } = req.query;

  if (status) result = result.filter((g) => g.status === status);
  if (categoryId) result = result.filter((g) => g.categoryId === Number(categoryId));
  if (hot) result = result.filter((g) => g.hot);
  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(
      (g) => g.name.toLowerCase().includes(kw) || (g.description || '').toLowerCase().includes(kw)
    );
  }

  res.json(result);
});

// GET /api/goods/:id
router.get('/:id', (req, res) => {
  const good = goodsTable.find(Number(req.params.id));
  if (!good) return res.status(404).json({ error: '商品不存在' });
  res.json(good);
});

// POST /api/goods
router.post('/', (req, res) => {
  const { name, price, categoryId, img, description, stock, status, hot } = req.body;
  const errors = [];
  if (!name) errors.push('商品名称不能为空');
  if (price == null || typeof price !== 'number') errors.push('价格无效');
  if (!categoryId) errors.push('分类不能为空');
  if (!img) errors.push('图片地址不能为空');
  if (errors.length) return res.status(400).json({ error: errors.join('；') });

  const good = goodsTable.insert({ name, price, categoryId: Number(categoryId), img, description: description || '', stock: stock ?? 0, status: status || 'on', hot: !!hot });
  res.status(201).json(good);
});

// PUT /api/goods/:id
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!goodsTable.find(id)) return res.status(404).json({ error: '商品不存在' });
  const updated = goodsTable.update(id, { ...req.body });
  res.json(updated);
});

// DELETE /api/goods/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!goodsTable.delete(id)) return res.status(404).json({ error: '商品不存在' });
  res.json({ message: '已删除' });
});

// PATCH /api/goods/:id/toggle-status
router.patch('/:id/toggle-status', (req, res) => {
  const id = Number(req.params.id);
  const good = goodsTable.find(id);
  if (!good) return res.status(404).json({ error: '商品不存在' });
  const updated = goodsTable.update(id, { status: good.status === 'on' ? 'off' : 'on' });
  res.json(updated);
});

export default router;
