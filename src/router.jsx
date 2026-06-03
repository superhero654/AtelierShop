import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const UserPage = lazy(() => import('./pages/UserPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DetailPage = lazy(() => import('./pages/DetailPage'));
const CreateOrderPage = lazy(() => import('./pages/CreateOrderPage'));
const PayPage = lazy(() => import('./pages/PayPage'));
const OrderListPage = lazy(() => import('./pages/OrderListPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminProductPage = lazy(() => import('./pages/admin/AdminProductPage'));
const AdminOrderPage = lazy(() => import('./pages/admin/AdminOrderPage'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 64, color: 'var(--color-text-muted)' }}>
      加载中…
    </div>
  );
}

function LazyPage({ Component }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, element: <LazyPage Component={HomePage} /> },
      { path: 'category', element: <LazyPage Component={CategoryPage} /> },
      { path: 'category/:categoryId', element: <LazyPage Component={CategoryPage} /> },
      { path: 'cart', element: <LazyPage Component={CartPage} /> },
      { path: 'user', element: <LazyPage Component={UserPage} /> },
      { path: 'login', element: <LazyPage Component={LoginPage} /> },
      { path: 'register', element: <LazyPage Component={RegisterPage} /> },
      { path: 'detail/:goodId', element: <LazyPage Component={DetailPage} /> },
      { path: 'createOrder', element: <LazyPage Component={CreateOrderPage} /> },
      { path: 'pay/:orderId', element: <LazyPage Component={PayPage} /> },
      { path: 'orders', element: <LazyPage Component={OrderListPage} /> },
      { path: 'orderDetail/:orderId', element: <LazyPage Component={OrderDetailPage} /> },
      { path: 'home', element: <Navigate to="/" replace /> },
    ],
  },
  {
    path: '/admin/login',
    element: <LazyPage Component={AdminLoginPage} />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/products" replace /> },
      { path: 'products', element: <LazyPage Component={AdminProductPage} /> },
      { path: 'orders', element: <LazyPage Component={AdminOrderPage} /> },
    ],
  },
]);

export default router;
