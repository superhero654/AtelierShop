/**
 * 订单服务 — 缓存式读写 + 乐观更新
 */
import { api } from '../utils/api';
import { optimisticMutation } from '../utils/optimisticMutation';

class OrderService {
  list = [];

  async fetchAll() {
    this.list = await api.get('/orders');
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
    return order;
  }

  async payOrder(orderId) {
    const updated = await api.patch(`/orders/${orderId}/pay`);
    this.list = this.list.map((o) => (o.id === orderId ? updated : o));
    return updated;
  }

  payOrderOptimistic(orderId, { onSync, onRollback } = {}) {
    return this._patchStatusOptimistic(orderId, 1, () => api.patch(`/orders/${orderId}/pay`), { onSync, onRollback });
  }

  async cancelOrder(orderId) {
    const updated = await api.patch(`/orders/${orderId}/cancel`);
    this.list = this.list.map((o) => (o.id === orderId ? updated : o));
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
    return updated;
  }

  shipOrderOptimistic(orderId, { onSync, onRollback } = {}) {
    return this._patchStatusOptimistic(orderId, 2, () => api.patch(`/orders/${orderId}/ship`), { onSync, onRollback });
  }

  async completeOrder(orderId) {
    const updated = await api.patch(`/orders/${orderId}/complete`);
    this.list = this.list.map((o) => (o.id === orderId ? updated : o));
    return updated;
  }

  completeOrderOptimistic(orderId, { onSync, onRollback } = {}) {
    return this._patchStatusOptimistic(orderId, 3, () => api.patch(`/orders/${orderId}/complete`), { onSync, onRollback });
  }

  async updateOrderStatus(orderId, status) {
    const updated = await api.patch(`/orders/${orderId}/status`, { status });
    this.list = this.list.map((o) => (o.id === orderId ? updated : o));
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
    onSync?.();

    return optimisticMutation({
      apply: () => {},
      rollback: () => {
        this._replaceInList(previous);
        onSync?.();
        onRollback?.();
      },
      request,
      onSuccess: (updated) => {
        this._replaceInList(updated);
        onSync?.();
      },
    });
  }
}

const orderService = new OrderService();
export default orderService;
