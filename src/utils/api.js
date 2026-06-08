/**
 * API 请求工具
 * 通过 Vite proxy 转发到 PHP 后端 (localhost:3001)
 */

const BASE = '/api';

async function request(method, path, data = null) {
  const headers = { 'Content-Type': 'application/json' };

  // 附加用户/管理员身份标识
  try {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user?.id) headers['X-User-Id'] = user.id;
  } catch {}
  try {
    const admin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (admin?.id) headers['X-Admin-Id'] = admin.id;
  } catch {}

  const opts = { method, headers };
  if (data !== null) {
    opts.body = JSON.stringify(data);
  }

  const res = await fetch(`${BASE}${path}`, opts);
  const body = await res.json();

  if (!res.ok) {
    const err = new Error(body.error || `请求失败 (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, data) => request('POST', path, data),
  put: (path, data) => request('PUT', path, data),
  patch: (path, data) => request('PATCH', path, data),
  delete: (path) => request('DELETE', path),
};
