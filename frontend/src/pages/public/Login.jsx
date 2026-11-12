import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Laptop, Lock, Mail, Shield, Warehouse, User as UserIcon } from 'lucide-react';
import Alert from '../../components/Alert';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { notifySuccess } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      notifySuccess(`Welcome back, ${user.name}!`);

      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'inventory_manager') {
        navigate('/inventory/dashboard', { replace: true });
      } else {
        navigate('/catalog', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click role demo fillers for college evaluation
  const fillCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('Password@123');
    } else if (role === 'inventory') {
      setEmail('inventory@example.com');
      setPassword('Password@123');
    } else if (role === 'customer') {
      setEmail('customer@example.com');
      setPassword('Password@123');
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <div className="card">
        <div className="card-header" style={{ flexDirection: 'column', textAlign: 'center', padding: '2rem 1.5rem 1rem' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1rem', width: 48, height: 48 }}>
            <Laptop size={26} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Log in to manage rentals, inspect inventory, or browse devices
          </p>
        </div>

        <div className="card-body">
          {/* Quick Demo Selector */}
          <div className="demo-accounts-panel">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ⚡ 1-Click Demo Evaluation Profiles:
            </span>
            <div className="demo-btn-grid">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillCredentials('admin')}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
              >
                <Shield size={13} /> Admin
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillCredentials('inventory')}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
              >
                <Warehouse size={13} /> Inventory
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillCredentials('customer')}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
              >
                <UserIcon size={13} /> Customer
              </button>
            </div>
          </div>

          {error && <Alert type="danger" message={error} />}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-md"
              disabled={loading}
              style={{ marginTop: '1.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: '#64748b' }}>
            Don&apos;t have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create customer account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
