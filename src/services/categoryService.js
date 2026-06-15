/**
 * 分类服务 — 缓存式读写 + 乐观更新 + 订阅通知
 */
import { api } from '../utils/api';
import { optimisticMutation } from '../utils/optimisticMutation';
import { broadcastCatalogChange } from '../utils/dataSync';

class CategoryService {
  list = [];

  _version = 0;

  _subscribers = new Set();

  subscribe(listener) {
    this._subscribers.add(listener);
    return () => this._subscribers.delete(listener);
  }

  getVersion() {
    return this._version;
  }

  _notify(broadcast = false) {
    this._version += 1;
    this._subscribers.forEach((fn) => fn());
    if (broadcast) {
      broadcastCatalogChange('categories');
    }
  }

  async fetchAll() {
    this.list = await api.get('/categories');
    this._notify(false);
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
    this._notify(true);
    return created;
  }

  addCategoryOptimistic(category, { onSync, onRollback } = {}) {
    const tempId = -Date.now();
    const optimistic = { ...category, id: tempId };
    this.list.push(optimistic);
    this._notify(true);
    onSync?.();

    return optimisticMutation({
      apply: () => {},
      rollback: () => {
        this._removeFromList(tempId);
        this._notify(true);
        onRollback?.();
      },
      request: () => api.post('/categories', category),
      onSuccess: (created) => {
        this._removeFromList(tempId);
        this.list.push(created);
        this._notify(false);
        onSync?.();
      },
    });
  }

  async updateCategory(category) {
    const updated = await api.put(`/categories/${category.id}`, category);
    this.list = this.list.map((c) => (c.id === category.id ? updated : c));
    this._notify(true);
    return updated;
  }

  updateCategoryOptimistic(category, { onSync, onRollback } = {}) {
    const previous = this.getCategoryById(category.id);
    if (!previous) return Promise.reject(new Error('分类不存在'));

    const optimistic = { ...previous, ...category };
    this._replaceInList(optimistic);
    this._notify(true);
    onSync?.();

    return optimisticMutation({
      apply: () => {},
      rollback: () => {
        this._replaceInList(previous);
        this._notify(true);
        onRollback?.();
      },
      request: () => api.put(`/categories/${category.id}`, category),
      onSuccess: (updated) => {
        this._replaceInList(updated);
        this._notify(false);
        onSync?.();
      },
    });
  }

  async deleteCategory(id) {
    await api.delete(`/categories/${id}`);
    this.list = this.list.filter((c) => c.id !== id);
    this._notify(true);
  }

  deleteCategoryOptimistic(id, { onSync, onRollback } = {}) {
    const previous = this.getCategoryById(id);
    if (!previous) return Promise.reject(new Error('分类不存在'));

    this._removeFromList(id);
    this._notify(true);
    onSync?.();

    return optimisticMutation({
      apply: () => {},
      rollback: () => {
        this.list.push(previous);
        this._notify(true);
        onSync?.();
        onRollback?.();
      },
      request: () => api.delete(`/categories/${id}`),
    });
  }
}

const categoryService = new CategoryService();
export default categoryService;
