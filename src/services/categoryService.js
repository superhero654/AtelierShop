import { defaultCategories } from '../mock/seedData';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const STORAGE_KEY = 'categoryList';

class CategoryService {
  list = [];

  constructor() {
    this._loadData();
  }

  getCategoryList() {
    return this.list;
  }

  getCategoryById(id) {
    return this.list.find((item) => item.id === id);
  }

  addCategory(category) {
    const maxId = this.list.reduce((max, item) => Math.max(max, item.id), 0);
    const newCategory = { ...category, id: maxId + 1 };
    this.list.push(newCategory);
    this._saveData();
    return newCategory;
  }

  updateCategory(category) {
    this.list = this.list.map((item) =>
      item.id === category.id ? { ...item, ...category } : item
    );
    this._saveData();
  }

  deleteCategory(id) {
    this.list = this.list.filter((item) => item.id !== id);
    this._saveData();
  }

  _saveData() {
    saveToStorage(STORAGE_KEY, this.list);
  }

  _loadData() {
    const list = loadFromStorage(STORAGE_KEY, null);
    if (list) {
      this.list = list;
    } else {
      this.list = [...defaultCategories];
      this._saveData();
    }
  }
}

const categoryService = new CategoryService();
export default categoryService;
