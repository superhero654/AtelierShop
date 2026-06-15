/**
 * 订单服务 — 缓存式读写 + 乐观更新 + 订阅通知
 */
import { api } from '../utils/api';
import { optimisticMutation } from '../utils/optimisticMutation';
import { broadcastCatalogChange } from '../utils/dataSync';

function sameId(a, b) {
  return Number(a) === Number(b);
}

function normalizeOrder(order) {
  if (!order) return order;
  return {
    ...order,
    id: Number(order.id),
    userId: order.userId != null ? Number(order.userId) : order.userId,
    status: Number(order.status),
  };
}

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
    const fresh = await api.get('/orders');
    this.list = Array.isArray(fresh) ? fresh.map(normalizeOrder) : [];
    this._notify(false);
  }

  getOrderById(id) {
    return this.list.find((o) => sameId(o.id, id)) || null;
  }

  getOrdersByUserId(userId) {
    return this.list
      .filter((o) => Number(o.userId) === Number(userId))
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
  }

  getAllOrders() {
    return [...this.list].sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
  }

  _replaceInList(order) {
    const normalized = normalizeOrder(order);
    const idx = this.list.findIndex((o) => sameId(o.id, normalized.id));
    if (idx >= 0) {
      this.list[idx] = normalized;
    }
  }

  _mapOrderInList(orderId, updated) {
    this.list = this.list.map((o) => (sameId(o.id, orderId) ? normalizeOrder(updated) : o));
  }

  async createOrder(data) {
    const order = normalizeOrder(await api.post('/orders', data));
    this.list.push(order);
    this._notify(true);
    return order;
  }

  async payOrder(orderId) {
    const updated = normalizeOrder(await api.patch(`/orders/${orderId}/pay`));
    this._mapOrderInList(orderId, updated);
    this._notify(true);
    return updated;
  }

  payOrderOptimistic(orderId, { onSync, onRollback } = {}) {
    return this._patchStatusOptimistic(orderId, 1, () => api.patch(`/orders/${orderId}/pay`), { onSync, onRollback });
  }

  async cancelOrder(orderId) {
    const updated = normalizeOrder(await api.patch(`/orders/${orderId}/cancel`));
    this._mapOrderInList(orderId, updated);
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
    const updated = normalizeOrder(await api.patch(`/orders/${orderId}/ship`));
    this._mapOrderInList(orderId, updated);
    this._notify(true);
    return updated;
  }

  shipOrderOptimistic(orderId, { onSync, onRollback } = {}) {
    return this._patchStatusOptimistic(orderId, 2, () => api.patch(`/orders/${orderId}/ship`), { onSync, onRollback });
  }

  async completeOrder(orderId) {
    const updated = normalizeOrder(await api.patch(`/orders/${orderId}/complete`));
    this._mapOrderInList(orderId, updated);
    this._notify(true);
    return updated;
  }

  completeOrderOptimistic(orderId, { onSync, onRollback } = {}) {
    return this._patchStatusOptimistic(orderId, 3, () => api.patch(`/orders/${orderId}/complete`), { onSync, onRollback });
  }

  async updateOrderStatus(orderId, status) {
    const updated = normalizeOrder(await api.patch(`/orders/${orderId}/status`, { status }));
    this._mapOrderInList(orderId, updated);
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

    const optimistic = normalizeOrder({ ...previous, status: nextStatus });
    this._replaceInList(optimistic);
    this._notify(false);
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
        this._notify(true);
        onSync?.();
      },
    });
  }
}

const orderService = new OrderService();
export default orderService;
