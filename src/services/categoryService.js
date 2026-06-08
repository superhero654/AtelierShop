/**
 * 分类服务 — 缓存式读写
 */
import { api } from '../utils/api';

class CategoryService {
  list = [];

  async fetchAll() {
    this.list = await api.get('/categories');
  }

  getCategoryList() {
    return this.list;
  }

  getCategoryById(id) {
    return this.list.find((c) => c.id === id) || null;
  }

  async addCategory(category) {
    const created = await api.post('/categories', category);
    this.list.push(created);
    return created;
  }

  async updateCategory(category) {
    const updated = await api.put(`/categories/${category.id}`, category);
    this.list = this.list.map((c) => (c.id === category.id ? updated : c));
    return updated;
  }

  async deleteCategory(id) {
    await api.delete(`/categories/${id}`);
    this.list = this.list.filter((c) => c.id !== id);
  }
}

const categoryService = new CategoryService();
export default categoryService;
