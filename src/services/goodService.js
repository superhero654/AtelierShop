/**
 * 商品服务 — 缓存式读写
 * 数据从 API 加载到本地缓存，读取同步，写入异步
 */
import { api } from '../utils/api';

class GoodService {
  list = [];

  /** 从 API 加载数据 */
  async fetchAll() {
    this.list = await api.get('/goods');
  }

  getGoodList(filters = {}) {
    let result = [...this.list];
    if (filters.status) result = result.filter((g) => g.status === filters.status);
    if (filters.categoryId) result = result.filter((g) => g.categoryId === Number(filters.categoryId));
    if (filters.hot) result = result.filter((g) => g.hot);
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(kw) ||
          (g.description && g.description.toLowerCase().includes(kw))
      );
    }
    return result;
  }

  getGoodById(id) {
    return this.list.find((g) => g.id === id) || null;
  }

  async addGood(good) {
    const created = await api.post('/goods', good);
    this.list.push(created);
    return created;
  }

  async updateGood(good) {
    const updated = await api.put(`/goods/${good.id}`, good);
    this.list = this.list.map((g) => (g.id === good.id ? updated : g));
    return updated;
  }

  async deleteGood(id) {
    await api.delete(`/goods/${id}`);
    this.list = this.list.filter((g) => g.id !== id);
  }

  async toggleStatus(id) {
    const updated = await api.patch(`/goods/${id}/toggle-status`);
    this.list = this.list.map((g) => (g.id === id ? updated : g));
    return updated;
  }
}

const goodService = new GoodService();
export default goodService;
