/**
 * 内存数据库 + 种子数据
 * Vercel Serverless 环境下数据在每次冷启动时重置
 */
import { goods, categories, users, admins, orders, carousel } from './seed.js';

class Table {
  constructor(seed) {
    this.data = seed.map((item) => ({ ...item }));
  }

  all() {
    return this.data;
  }

  find(id) {
    return this.data.find((item) => item.id === id) || null;
  }

  insert(row) {
    const maxId = this.data.reduce((max, item) => Math.max(max, item.id || 0), 0);
    const newRow = { ...row, id: maxId + 1 };
    this.data.push(newRow);
    return newRow;
  }

  update(id, updates) {
    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.data[index] = { ...this.data[index], ...updates };
    return this.data[index];
  }

  delete(id) {
    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.data.splice(index, 1);
    return true;
  }
}

export const goodsTable = new Table(goods);
export const categoriesTable = new Table(categories);
export const usersTable = new Table(users);
export const adminsTable = new Table(admins);
export const ordersTable = new Table(orders);
export const carouselTable = new Table(carousel);
