import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Users,
  CalendarCheck,
  BarChart3,
  ClipboardCheck,
  SlidersHorizontal,
  LogOut,
  Laptop,
  ArrowLeft
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout, isAdmin, isInventoryManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Laptop size={20} />
        </div>
        <div className="brand-text">
          <h4>ElectroRent</h4>
          <span className="portal-label">
            {isAdmin ? 'Admin Console' : 'Inventory Portal'}
          </span>
        </div>
      </div>

      <div className="sidebar-user-card">
        <div className="avatar-circle">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="user-details">
          <p className="user-name">{user?.name}</p>
          <span className="user-role-badge">{user?.role?.replace('_', ' ')}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isAdmin && (
          <>
            <div className="nav-section-title">ADMINISTRATION</div>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Package size={18} />
              <span>Product Management</span>
            </NavLink>
            <NavLink
              to="/admin/rentals"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <CalendarCheck size={18} />
              <span>Rental Management</span>
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>User Management</span>
            </NavLink>
            <NavLink
              to="/admin/reports"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Reports Dashboard</span>
            </NavLink>
          </>
        )}

        {isInventoryManager && (
          <>
            <div className="nav-section-title">INVENTORY CONTROL</div>
            <NavLink
              to="/inventory/dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Inventory Dashboard</span>
            </NavLink>
            <NavLink
              to="/inventory/inspection"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <ClipboardCheck size={18} />
              <span>Product Inspection</span>
            </NavLink>
            <NavLink
              to="/inventory/stock"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <SlidersHorizontal size={18} />
              <span>Stock & Condition</span>
            </NavLink>
            <NavLink
              to="/admin/reports"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Reports & Analytics</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/catalog" className="sidebar-link secondary-link">
          <ArrowLeft size={18} />
          <span>Customer Storefront</span>
        </NavLink>
        <button onClick={handleLogout} className="sidebar-logout-btn">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
