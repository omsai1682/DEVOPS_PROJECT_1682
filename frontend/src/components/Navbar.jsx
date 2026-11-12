import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Laptop, ShoppingBag, User as UserIcon, LogOut, Shield, Warehouse } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin, isInventoryManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <Laptop size={22} />
          </div>
          <span className="brand-name">Electro<span className="text-primary">Rent</span></span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/catalog" className="nav-link">Browse Catalog</Link>

          {user && user.role === 'customer' && (
            <Link to="/my-rentals" className="nav-link">
              <ShoppingBag size={16} className="inline-icon" /> My Rentals
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin/dashboard" className="nav-link nav-link-badge">
              <Shield size={16} className="inline-icon" /> Admin Portal
            </Link>
          )}

          {isInventoryManager && (
            <Link to="/inventory/dashboard" className="nav-link nav-link-badge">
              <Warehouse size={16} className="inline-icon" /> Inventory Hub
            </Link>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="user-profile-menu">
              <div className="user-info-pill">
                <UserIcon size={16} />
                <span className="user-name">{user.name.split(' ')[0]}</span>
                <span className={`user-role-tag role-${user.role}`}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Log Out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
