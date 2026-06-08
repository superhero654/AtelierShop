/**
 * 认证服务 — 调用后端 API
 */
import { api } from '../utils/api';

class AuthService {
  // 登录成功后，服务端返回 user 对象（不含密码）
  async loginUser(username, password) {
    return api.post('/auth/login', { username, password });
  }

  async registerUser(data) {
    return api.post('/auth/register', data);
  }

  async updateUser(id, data) {
    return api.put(`/auth/user/${id}`, data);
  }

  async getUserById(id) {
    return api.get(`/auth/user/${id}`);
  }

  // 管理员
  async loginAdmin(username, password) {
    return api.post('/auth/admin/login', { username, password });
  }

  async getAdminList() {
    return api.get('/auth/admins');
  }
}

const authService = new AuthService();
export default authService;
