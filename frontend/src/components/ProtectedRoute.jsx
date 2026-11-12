import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <LoadingSpinner size="large" text="Verifying authentication session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If logged in as customer trying to access admin route, redirect to my-rentals or home
    if (user.role === 'customer') {
      return <Navigate to="/my-rentals" replace />;
    }
    // If inventory manager trying to access admin user management, redirect to inventory dashboard
    if (user.role === 'inventory_manager') {
      return <Navigate to="/inventory/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
