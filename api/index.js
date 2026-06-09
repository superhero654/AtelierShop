import express from 'express';
import cors from 'cors';
import goodsRouter from './routes/goods.js';
import categoriesRouter from './routes/categories.js';
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import carouselRouter from './routes/carousel.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/goods', goodsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/carousel', carouselRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 统一错误处理
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || '服务器内部错误' });
});

export default app;
