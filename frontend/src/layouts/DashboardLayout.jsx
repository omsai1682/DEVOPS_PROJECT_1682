import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, Home } from 'lucide-react';

export const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <span className="system-pill">DevOps Production Cluster</span>
          </div>
          <div className="topbar-right">
            <Link to="/" className="topbar-icon-btn" title="Back to storefront">
              <Home size={18} />
            </Link>
            <div className="topbar-divider"></div>
            <div className="topbar-user">
              <span className="topbar-user-greeting">Signed in as <strong>{user?.name}</strong></span>
              <span className="topbar-role-badge">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
