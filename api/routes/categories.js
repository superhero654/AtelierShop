import { Router } from 'express';
import { categoriesTable } from '../db.js';

const router = Router();

router.get('/', (_req, res) => res.json(categoriesTable.all()));

router.get('/:id', (req, res) => {
  const cat = categoriesTable.find(Number(req.params.id));
  if (!cat) return res.status(404).json({ error: '分类不存在' });
  res.json(cat);
});

router.post('/', (req, res) => {
  const { name, icon, description } = req.body;
  if (!name) return res.status(400).json({ error: '分类名称不能为空' });
  const cat = categoriesTable.insert({ name, icon: icon || '📁', description: description || '' });
  res.status(201).json(cat);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!categoriesTable.find(id)) return res.status(404).json({ error: '分类不存在' });
  res.json(categoriesTable.update(id, req.body));
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!categoriesTable.delete(id)) return res.status(404).json({ error: '分类不存在' });
  res.json({ message: '已删除' });
});

export default router;
