/**
 * 订单服务 — 缓存式读写 + 乐观更新 + 订阅通知
 */
import { api } from '../utils/api';
import { optimisticMutation } from '../utils/optimisticMutation';
import { broadcastCatalogChange } from '../utils/dataSync';

class OrderService {
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
      broadcastCatalogChange('orders');
    }
  }

  async fetchAll() {
    this.list = await api.get('/orders');
    this._notify(false);
  }

  getOrderById(id) {
    return this.list.find((o) => o.id === id) || null;
  }

  getOrdersByUserId(userId) {
    return this.list
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
  }

  getAllOrders() {
    return [...this.list].sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
  }

  _replaceInList(order) {
    const idx = this.list.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      this.list[idx] = order;
    }
  }

  async createOrder(data) {
    const order = await api.post('/orders', data);
    this.list.push(order);
    this._notify(true);
    return order;
  }

  async payOrder(orderId) {
    const updated = await api.patch(`/orders/${orderId}/pay`);
    this.list = this.list.map((o) => (o.id === orderId ? updated : o));
    this._notify(true);
    return updated;
  }

  payOrderOptimistic(orderId, { onSync, onRollback } = {}) {
    return this._patchStatusOptimistic(orderId, 1, () => api.patch(`/orders/${orderId}/pay`), { onSync, onRollback });
  }

  async cancelOrder(orderId) {
    const updated = await api.patch(`/orders/${orderId}/cancel`);
    this.list = this.list.map((o) => (o.id === orderId ? updated : o));
    this._notify(true);
    return updated;
  }

  cancelOrderOptimistic(orderId, { onSync, onRollback } = {}) {
    const order = this.getOrderById(orderId);
    const request = order?.status === 0
      ? () => api.patch(`/orders/${orderId}/cancel`)
      : () => api.patch(`/orders/${orderId}/status`, { status: 4 });
    return this._patchStatusOptimistic(orderId, 4, request, { onSync, onRollback });
  }

  async shipOrder(orderId) {
    const updated = await api.patch(`/orders/${orderId}/ship`);
    this.list = this.list.map((o) => (o.id === orderId ? updated : o));
    this._notify(true);
    return updated;
  }

  shipOrderOptimistic(orderId, { onSync, onRollback } = {}) {
    return this._patchStatusOptimistic(orderId, 2, () => api.patch(`/orders/${orderId}/ship`), { onSync, onRollback });
  }

  async completeOrder(orderId) {
    const updated = await api.patch(`/orders/${orderId}/complete`);
    this.list = this.list.map((o) => (o.id === orderId ? updated : o));
    this._notify(true);
    return updated;
  }

  completeOrderOptimistic(orderId, { onSync, onRollback } = {}) {
    return this._patchStatusOptimistic(orderId, 3, () => api.patch(`/orders/${orderId}/complete`), { onSync, onRollback });
  }

  async updateOrderStatus(orderId, status) {
    const updated = await api.patch(`/orders/${orderId}/status`, { status });
    this.list = this.list.map((o) => (o.id === orderId ? updated : o));
    this._notify(true);
    return updated;
  }

  updateOrderStatusOptimistic(orderId, status, { onSync, onRollback } = {}) {
    return this._patchStatusOptimistic(
      orderId,
      status,
      () => api.patch(`/orders/${orderId}/status`, { status }),
      { onSync, onRollback }
    );
  }

  _patchStatusOptimistic(orderId, nextStatus, request, { onSync, onRollback } = {}) {
    const previous = this.getOrderById(orderId);
    if (!previous) return Promise.reject(new Error('订单不存在'));

    const optimistic = { ...previous, status: nextStatus };
    this._replaceInList(optimistic);
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
      request,
      onSuccess: (updated) => {
        this._replaceInList(updated);
        this._notify(false);
        onSync?.();
      },
    });
  }
}

const orderService = new OrderService();
export default orderService;
