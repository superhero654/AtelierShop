/**
 * 本地开发服务器
 * 用于启动 Express API 服务，配合 Vite 开发模式使用
 * 运行方式：node dev-server.js
 */
import app from './api/index.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 API 开发服务器已启动: http://localhost:${PORT}`);
});
