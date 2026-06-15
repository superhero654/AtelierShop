/**
 * 商品服务 — 缓存式读写 + 乐观更新 + 订阅通知
 */
import { api } from '../utils/api';
import { optimisticMutation } from '../utils/optimisticMutation';
import { broadcastCatalogChange } from '../utils/dataSync';

class GoodService {
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
      broadcastCatalogChange('goods');
    }
  }

  async fetchAll() {
    this.list = await api.get('/goods');
    this._notify(false);
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

  _replaceInList(good) {
    const idx = this.list.findIndex((g) => g.id === good.id);
    if (idx >= 0) {
      this.list[idx] = good;
    }
  }

  _removeFromList(id) {
    this.list = this.list.filter((g) => g.id !== id);
  }

  async addGood(good) {
    const created = await api.post('/goods', good);
    this.list.push(created);
    this._notify(true);
    return created;
  }

  addGoodOptimistic(good, { onSync, onRollback } = {}) {
    const tempId = -Date.now();
    const optimistic = { ...good, id: tempId };
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
      request: () => api.post('/goods', good),
      onSuccess: (created) => {
        this._removeFromList(tempId);
        this.list.push(created);
        this._notify(false);
        onSync?.();
      },
    });
  }

  async updateGood(good) {
    const updated = await api.put(`/goods/${good.id}`, good);
    this.list = this.list.map((g) => (g.id === good.id ? updated : g));
    this._notify(true);
    return updated;
  }

  updateGoodOptimistic(good, { onSync, onRollback } = {}) {
    const previous = this.getGoodById(good.id);
    if (!previous) return Promise.reject(new Error('商品不存在'));

    const optimistic = { ...previous, ...good };
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
      request: () => api.put(`/goods/${good.id}`, good),
      onSuccess: (updated) => {
        this._replaceInList(updated);
        this._notify(false);
        onSync?.();
      },
    });
  }

  async deleteGood(id) {
    await api.delete(`/goods/${id}`);
    this.list = this.list.filter((g) => g.id !== id);
    this._notify(true);
  }

  deleteGoodOptimistic(id, { onSync, onRollback } = {}) {
    const previous = this.getGoodById(id);
    if (!previous) return Promise.reject(new Error('商品不存在'));

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
      request: () => api.delete(`/goods/${id}`),
    });
  }

  async toggleStatus(id) {
    const updated = await api.patch(`/goods/${id}/toggle-status`);
    this.list = this.list.map((g) => (g.id === id ? updated : g));
    this._notify(true);
    return updated;
  }

  toggleStatusOptimistic(id, { onSync, onRollback } = {}) {
    const previous = this.getGoodById(id);
    if (!previous) return Promise.reject(new Error('商品不存在'));

    const nextStatus = previous.status === 'on' ? 'off' : 'on';
    this._replaceInList({ ...previous, status: nextStatus });
    this._notify(true);
    onSync?.();

    return optimisticMutation({
      apply: () => {},
      rollback: () => {
        this._replaceInList(previous);
        this._notify(true);
        onSync?.();
        onRollback?.();
      },
      request: () => api.patch(`/goods/${id}/toggle-status`),
      onSuccess: (updated) => {
        this._replaceInList(updated);
        this._notify(false);
        onSync?.();
      },
    });
  }

  setStatusOptimistic(id, status, { onSync, onRollback } = {}) {
    const previous = this.getGoodById(id);
    if (!previous || previous.status === status) {
      return Promise.resolve(previous);
    }

    this._replaceInList({ ...previous, status });
    this._notify(true);
    onSync?.();

    return optimisticMutation({
      apply: () => {},
      rollback: () => {
        this._replaceInList(previous);
        this._notify(true);
        onSync?.();
        onRollback?.();
      },
      request: () => api.put(`/goods/${id}`, { ...previous, status }),
      onSuccess: (updated) => {
        this._replaceInList(updated);
        this._notify(false);
        onSync?.();
      },
    });
  }
}

const goodService = new GoodService();
export default goodService;
