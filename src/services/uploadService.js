import { api } from '../utils/api';

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const result = await api.upload('/upload', formData);
  return result.url;
}
