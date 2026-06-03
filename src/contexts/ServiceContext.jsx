import { createContext } from 'react';
import goodService from '../services/goodService';
import orderService from '../services/orderService';
import categoryService from '../services/categoryService';
import authService from '../services/authService';

const ServiceContext = createContext();

function ServiceProvider({ children }) {
  const value = {
    good: goodService,
    order: orderService,
    category: categoryService,
    auth: authService,
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}

export { ServiceContext, ServiceProvider };
