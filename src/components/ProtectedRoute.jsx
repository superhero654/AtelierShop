import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false, allowedRoles }) {
  const { user, admin, isLoggedIn, isAdminLoggedIn } = useAuth();
  const location = useLocation();

  if (requireAdmin) {
    if (!isAdminLoggedIn) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    if (allowedRoles && !allowedRoles.includes(admin.role)) {
      return <Navigate to="/admin/orders" replace />;
    }
    return children;
  }

  if (!isLoggedIn) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}
