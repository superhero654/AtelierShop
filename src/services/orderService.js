/**
 * 订单服务 — 缓存式读写
 */
import { api } from '../utils/api';

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

  async cancelOrder(orderId) {
    const updated = await api.patch(`/orders/${orderId}/cancel`);
    this.list = this.list.map((o) => (o.id === orderId ? updated : o));
    return updated;
  }

  async shipOrder(orderId) {
    const updated = await api.patch(`/orders/${orderId}/ship`);
    this.list = this.list.map((o) => (o.id === orderId ? updated : o));
    return updated;
  }

  async completeOrder(orderId) {
    const updated = await api.patch(`/orders/${orderId}/complete`);
    this.list = this.list.map((o) => (o.id === orderId ? updated : o));
    return updated;
  }

  async updateOrderStatus(orderId, status) {
    const updated = await api.patch(`/orders/${orderId}/status`, { status });
    this.list = this.list.map((o) => (o.id === orderId ? updated : o));
    return updated;
  }
}

const orderService = new OrderService();
export default orderService;
