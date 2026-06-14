/**
 * API 请求工具
 * - 开发环境：通过 Vite proxy 转发到 Spring Boot 后端 (localhost:8080)
 * - 生产环境：通过 VITE_API_BASE 环境变量指向线上后端
 */

const BASE = import.meta.env.VITE_API_BASE || '/api';

function buildAuthHeaders(includeJson = true) {
  const headers = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  try {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user?.id) headers['X-User-Id'] = user.id;
  } catch {}
  try {
    const admin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (admin?.id) headers['X-Admin-Id'] = admin.id;
  } catch {}
  return headers;
}

async function request(method, path, data = null) {
  const headers = buildAuthHeaders(true);
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

async function upload(path, formData) {
  const headers = buildAuthHeaders(false);
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: formData });
  const body = await res.json();
  if (!res.ok) {
    const err = new Error(body.error || `上传失败 (${res.status})`);
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
  upload,
};
