/**
 * 分类服务 — 缓存式读写 + 乐观更新
 */
import { api } from '../utils/api';
import { optimisticMutation } from '../utils/optimisticMutation';

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

  _replaceInList(category) {
    const idx = this.list.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      this.list[idx] = category;
    }
  }

  _removeFromList(id) {
    this.list = this.list.filter((c) => c.id !== id);
  }

  async addCategory(category) {
    const created = await api.post('/categories', category);
    this.list.push(created);
    return created;
  }

  addCategoryOptimistic(category, { onSync, onRollback } = {}) {
    const tempId = -Date.now();
    const optimistic = { ...category, id: tempId };
    this.list.push(optimistic);
    onSync?.();

    return optimisticMutation({
      apply: () => {},
      rollback: () => {
        this._removeFromList(tempId);
        onRollback?.();
      },
      request: () => api.post('/categories', category),
      onSuccess: (created) => {
        this._removeFromList(tempId);
        this.list.push(created);
        onSync?.();
      },
    });
  }

  async updateCategory(category) {
    const updated = await api.put(`/categories/${category.id}`, category);
    this.list = this.list.map((c) => (c.id === category.id ? updated : c));
    return updated;
  }

  updateCategoryOptimistic(category, { onSync, onRollback } = {}) {
    const previous = this.getCategoryById(category.id);
    if (!previous) return Promise.reject(new Error('分类不存在'));

    const optimistic = { ...previous, ...category };
    this._replaceInList(optimistic);
    onSync?.();

    return optimisticMutation({
      apply: () => {},
      rollback: () => {
        this._replaceInList(previous);
        onRollback?.();
      },
      request: () => api.put(`/categories/${category.id}`, category),
      onSuccess: (updated) => {
        this._replaceInList(updated);
        onSync?.();
      },
    });
  }

  async deleteCategory(id) {
    await api.delete(`/categories/${id}`);
    this.list = this.list.filter((c) => c.id !== id);
  }

  deleteCategoryOptimistic(id, { onSync, onRollback } = {}) {
    const previous = this.getCategoryById(id);
    if (!previous) return Promise.reject(new Error('分类不存在'));

    this._removeFromList(id);
    onSync?.();

    return optimisticMutation({
      apply: () => {},
      rollback: () => {
        this.list.push(previous);
        onSync?.();
        onRollback?.();
      },
      request: () => api.delete(`/categories/${id}`),
    });
  }
}

const categoryService = new CategoryService();
export default categoryService;
