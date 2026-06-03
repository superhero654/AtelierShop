import { defaultOrders } from '../mock/seedData';
import { generateOrderNo } from '../utils/format';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const STORAGE_KEY = 'orderList';

class OrderService {
  list = [];

  constructor() {
    this._loadData();
  }

  createOrder({ userId, items, address, receiver, phone, totalPrice }) {
    const maxId = this.list.reduce((max, item) => Math.max(max, item.id), 0);
    const order = {
      id: maxId + 1,
      userId,
      orderNo: generateOrderNo(),
      createTime: new Date().toISOString(),
      payTime: null,
      status: 0,
      totalPrice,
      address,
      receiver,
      phone,
      items,
      logistics: null,
    };
    this.list.push(order);
    this._saveData();
    return order;
  }

  payOrder(orderId) {
    const order = this.getOrderById(orderId);
    if (!order || order.status !== 0) return false;
    order.status = 1;
    order.payTime = new Date().toISOString();
    this._saveData();
    return true;
  }

  cancelOrder(orderId) {
    const order = this.getOrderById(orderId);
    if (!order || order.status !== 0) return false;
    order.status = 4;
    this._saveData();
    return true;
  }

  shipOrder(orderId) {
    const order = this.getOrderById(orderId);
    if (!order || order.status !== 1) return false;
    order.status = 2;
    order.logistics = {
      company: '顺丰速运',
      trackingNo: `SF${Date.now()}`,
      status: '运输中',
    };
    this._saveData();
    return true;
  }

  completeOrder(orderId) {
    const order = this.getOrderById(orderId);
    if (!order || order.status !== 2) return false;
    order.status = 3;
    if (order.logistics) {
      order.logistics.status = '已签收';
    }
    this._saveData();
    return true;
  }

  updateOrderStatus(orderId, status) {
    const order = this.getOrderById(orderId);
    if (!order) return false;
    order.status = status;
    this._saveData();
    return true;
  }

  getOrderById(orderId) {
    return this.list.find((item) => item.id === orderId);
  }

  getOrdersByUserId(userId) {
    return this.list
      .filter((item) => item.userId === userId)
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
  }

  getAllOrders() {
    return [...this.list].sort(
      (a, b) => new Date(b.createTime) - new Date(a.createTime)
    );
  }

  _saveData() {
    saveToStorage(STORAGE_KEY, this.list);
  }

  _loadData() {
    const list = loadFromStorage(STORAGE_KEY, null);
    if (list) {
      this.list = list;
    } else {
      this.list = [...defaultOrders];
      this._saveData();
    }
  }
}

const orderService = new OrderService();
export default orderService;
