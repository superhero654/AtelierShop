import { createContext, useEffect, useState } from 'react';
import goodService from '../services/goodService';
import orderService from '../services/orderService';
import categoryService from '../services/categoryService';
import authService from '../services/authService';

const ServiceContext = createContext();

function ServiceProvider({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      goodService.fetchAll(),
      categoryService.fetchAll(),
      orderService.fetchAll(),
    ]).then(() => setReady(true));
  }, []);

  const value = {
    good: goodService,
    order: orderService,
    category: categoryService,
    auth: authService,
  };

  if (!ready) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontSize: 18, color: '#666',
      }}>
        加载中…
      </div>
    );
  }

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}

export { ServiceContext, ServiceProvider };
