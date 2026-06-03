import { defaultUsers, defaultAdmins } from '../mock/seedData';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const USERS_KEY = 'userList';
const ADMINS_KEY = 'adminList';

class AuthService {
  users = [];
  admins = [];

  constructor() {
    this._loadData();
  }

  // ── 前台用户 ──

  loginUser(username, password) {
    const user = this.users.find(
      (u) => (u.username === username || u.email === username) && u.password === password
    );
    return user ? { ...user, password: undefined } : null;
  }

  registerUser({ username, email, password, nickname }) {
    const exists = this.users.some(
      (u) => u.username === username || u.email === email
    );
    if (exists) return { error: '用户名或邮箱已被注册' };

    const maxId = this.users.reduce((max, u) => Math.max(max, u.id), 0);
    const user = {
      id: maxId + 1,
      username,
      email,
      password,
      nickname: nickname || username,
      phone: '',
      address: '',
    };
    this.users.push(user);
    this._saveUsers();
    return { ...user, password: undefined };
  }

  updateUser(id, data) {
    this.users = this.users.map((u) =>
      u.id === id ? { ...u, ...data } : u
    );
    this._saveUsers();
    return this.users.find((u) => u.id === id);
  }

  getUserById(id) {
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user, password: undefined } : null;
  }

  // ── 后台管理员 ──

  loginAdmin(username, password) {
    const admin = this.admins.find(
      (a) => a.username === username && a.password === password
    );
    return admin ? { ...admin, password: undefined } : null;
  }

  getAdminList() {
    return this.admins.map(({ password, ...rest }) => rest);
  }

  _saveUsers() {
    saveToStorage(USERS_KEY, this.users);
  }

  _saveAdmins() {
    saveToStorage(ADMINS_KEY, this.admins);
  }

  _loadData() {
    const users = loadFromStorage(USERS_KEY, null);
    this.users = users || [...defaultUsers];
    if (!users) this._saveUsers();

    const admins = loadFromStorage(ADMINS_KEY, null);
    this.admins = admins || [...defaultAdmins];
    if (!admins) this._saveAdmins();
  }
}

const authService = new AuthService();
export default authService;
