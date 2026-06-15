import { createContext, useEffect, useState } from 'react';
import goodService from '../services/goodService';
import orderService from '../services/orderService';
import categoryService from '../services/categoryService';
import authService from '../services/authService';

const ServiceContext = createContext();

function ServiceProvider({ children }) {
  const [loading, setLoading] = useState({
    goods: true,
    categories: true,
    orders: true,
  });

  useEffect(() => {
    goodService.fetchAll()
      .finally(() => setLoading((prev) => ({ ...prev, goods: false })));
    categoryService.fetchAll()
      .finally(() => setLoading((prev) => ({ ...prev, categories: false })));
    orderService.fetchAll()
      .finally(() => setLoading((prev) => ({ ...prev, orders: false })));
  }, []);

  const value = {
    good: goodService,
    order: orderService,
    category: categoryService,
    auth: authService,
    loading,
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}

export { ServiceContext, ServiceProvider };
