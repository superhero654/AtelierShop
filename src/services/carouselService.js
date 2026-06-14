import { api } from '../utils/api';

export async function fetchCarousel() {
  return api.get('/carousel');
}
