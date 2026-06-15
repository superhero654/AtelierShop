import { createContext, useCallback, useEffect, useState } from 'react';
import goodService from '../services/goodService';
import orderService from '../services/orderService';
import categoryService from '../services/categoryService';
import authService from '../services/authService';
import { CATALOG_POLL_INTERVAL_MS, onCatalogChange } from '../utils/dataSync';

const ServiceContext = createContext();

function ServiceProvider({ children }) {
  const [loading, setLoading] = useState({
    goods: true,
    categories: true,
    orders: true,
  });

  const refreshCatalog = useCallback(async (scope = 'all') => {
    const tasks = [];
    if (scope === 'goods' || scope === 'all') {
      tasks.push(goodService.fetchAll());
    }
    if (scope === 'categories' || scope === 'all') {
      tasks.push(categoryService.fetchAll());
    }
    await Promise.allSettled(tasks);
  }, []);

  useEffect(() => {
    goodService.fetchAll()
      .finally(() => setLoading((prev) => ({ ...prev, goods: false })));
    categoryService.fetchAll()
      .finally(() => setLoading((prev) => ({ ...prev, categories: false })));
    orderService.fetchAll()
      .finally(() => setLoading((prev) => ({ ...prev, orders: false })));
  }, []);

  useEffect(() => {
    return onCatalogChange((scope) => {
      refreshCatalog(scope);
    });
  }, [refreshCatalog]);

  useEffect(() => {
    const poll = () => {
      if (document.visibilityState === 'visible') {
        refreshCatalog('all');
      }
    };

    const intervalId = setInterval(poll, CATALOG_POLL_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshCatalog('all');
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refreshCatalog]);

  const value = {
    good: goodService,
    order: orderService,
    category: categoryService,
    auth: authService,
    loading,
    refreshCatalog,
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}

export { ServiceContext, ServiceProvider };
