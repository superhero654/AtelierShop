import { defaultGoods } from '../mock/seedData';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const STORAGE_KEY = 'goodList';

class GoodService {
  list = [];

  constructor() {
    this._loadData();
  }

  getGoodById(id) {
    return this.list.find((item) => item.id === id);
  }

  getGoodList(filters = {}) {
    let result = [...this.list];
    if (filters.status) {
      result = result.filter((item) => item.status === filters.status);
    }
    if (filters.categoryId) {
      result = result.filter((item) => item.categoryId === Number(filters.categoryId));
    }
    if (filters.hot) {
      result = result.filter((item) => item.hot);
    }
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(kw) ||
          (item.description && item.description.toLowerCase().includes(kw))
      );
    }
    return result;
  }

  addGood(good) {
    const maxId = this.list.reduce((max, item) => Math.max(max, item.id), 0);
    const newGood = {
      status: 'on',
      hot: false,
      stock: 0,
      description: '',
      ...good,
      id: maxId + 1,
    };
    this.list.push(newGood);
    this._saveData();
    return newGood;
  }

  deleteGood(id) {
    this.list = this.list.filter((item) => item.id !== id);
    this._saveData();
  }

  updateGood(good) {
    this.list = this.list.map((item) =>
      item.id === good.id ? { ...item, ...good } : item
    );
    this._saveData();
  }

  toggleStatus(id) {
    const good = this.getGoodById(id);
    if (good) {
      good.status = good.status === 'on' ? 'off' : 'on';
      this._saveData();
    }
    return good;
  }

  _saveData() {
    saveToStorage(STORAGE_KEY, this.list);
  }

  _loadData() {
    const list = loadFromStorage(STORAGE_KEY, null);
    if (list) {
      this.list = list;
    } else {
      this.list = [...defaultGoods];
      this._saveData();
    }
  }
}

const goodService = new GoodService();
export default goodService;
