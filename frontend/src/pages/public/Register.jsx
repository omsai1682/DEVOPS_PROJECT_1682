import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Laptop, Lock, Mail, User, Phone, MapPin } from 'lucide-react';
import Alert from '../../components/Alert';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { notifySuccess } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        role: 'customer'
      });

      notifySuccess('Account created successfully! Welcome to ElectroRent.');
      navigate('/catalog');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <div className="card">
        <div className="card-header" style={{ flexDirection: 'column', textAlign: 'center', padding: '2rem 1.5rem 1rem' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1rem', width: 48, height: 48 }}>
            <Laptop size={26} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create Your Account</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Join ElectroRent to rent high-end electronics with fast delivery
          </p>
        </div>

        <div className="card-body">
          {error && <Alert type="danger" message={error} />}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. Alex Johnson"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <User size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Mail size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-col form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="+1-555-0100"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <Phone size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-col form-group">
                <label className="form-label" htmlFor="address">Delivery Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="City, State, Zip"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  <MapPin size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-col form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Lock size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-col form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <Lock size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-md"
              disabled={loading}
              style={{ marginTop: '1.25rem' }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
