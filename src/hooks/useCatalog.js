import { useMemo, useSyncExternalStore } from 'react';
import goodService from '../services/goodService';
import categoryService from '../services/categoryService';

function useGoodVersion() {
  return useSyncExternalStore(
    (cb) => goodService.subscribe(cb),
    () => goodService.getVersion(),
    () => goodService.getVersion(),
  );
}

function useCategoryVersion() {
  return useSyncExternalStore(
    (cb) => categoryService.subscribe(cb),
    () => categoryService.getVersion(),
    () => categoryService.getVersion(),
  );
}

export function useGoodList(filters = {}) {
  const version = useGoodVersion();
  return useMemo(
    () => goodService.getGoodList(filters),
    [version, filters.status, filters.categoryId, filters.hot, filters.keyword],
  );
}

export function useGoodById(id) {
  const version = useGoodVersion();
  return useMemo(() => goodService.getGoodById(id), [version, id]);
}

export function useCategoryList() {
  const version = useCategoryVersion();
  return useMemo(() => categoryService.getCategoryList(), [version]);
}

export function useCategoryById(id) {
  const version = useCategoryVersion();
  return useMemo(
    () => (id != null ? categoryService.getCategoryById(id) : null),
    [version, id],
  );
}
