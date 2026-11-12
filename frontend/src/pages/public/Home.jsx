import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import {
  Laptop,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Layers,
  Award,
  Clock
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productService.getAll({ status: 'Available' });
        setFeaturedProducts(data.products.slice(0, 4));
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { name: 'Laptops', count: 'High-end specs', icon: '💻' },
    { name: 'Cameras', count: '4K Full-Frame', icon: '📷' },
    { name: 'Gaming Consoles', count: 'PS5 & Xbox', icon: '🎮' },
    { name: 'Projectors', count: 'Home & Office', icon: '📽️' },
    { name: 'Speakers', count: 'Hi-Fi Audio', icon: '🔊' },
    { name: 'Tablets', count: 'iPads & Stylus', icon: '📱' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        padding: '5rem 0 6rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.5rem'
            }}>
              <Sparkles size={16} /> Enterprise Electronic Equipment Rentals
            </div>
            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem'
            }}>
              Rent Premium Electronics with <span style={{ color: '#38bdf8' }}>Zero Hassle</span>
            </h1>
            <p style={{
              fontSize: '1.15rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}>
              Access state-of-the-art workstations, mirrorless cameras, gaming consoles,
              and audio gear. Transparent daily rates, real-time dispatch tracking, and insured returns.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/catalog" className="btn btn-primary btn-lg">
                Explore Equipment Catalog <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                Demo Portal Logins
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ padding: '4rem 0 2rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Why Professionals Choose ElectroRent
            </h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
              Designed with complete rental lifecycle automation, quality inspection, and transparent pricing.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '12px',
                backgroundColor: '#dbeafe',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <Zap size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dynamic Price Calculation</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Instant calculation of rental charges based on rental dates, duration, security deposit, and transparent terms.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '12px',
                backgroundColor: '#d1fae5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Inventory Inspection</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Every returned electronic unit is inspected by dedicated warehouse supervisors to guarantee condition accuracy.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '12px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Automated Overdue Tracking</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Built-in overdue detection scans past-due bookings, calculates prorated late fees, and updates stock metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section style={{ padding: '2rem 0 3rem' }}>
        <div className="container">
          <div className="page-header" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Browse by Category</h2>
              <p className="page-subtitle">Select a category to discover curated rental devices</p>
            </div>
            <Link to="/catalog" className="btn btn-outline btn-sm">
              View All Categories <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}>
            {categories.map((c) => (
              <Link
                key={c.name}
                to={`/catalog?category=${encodeURIComponent(c.name)}`}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  textDecoration: 'none',
                  transition: 'transform 0.15s ease'
                }}
              >
                <span style={{ fontSize: '2rem' }}>{c.icon}</span>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{c.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '2rem 0 4rem' }}>
        <div className="container">
          <div className="page-header" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Popular Electronic Products</h2>
              <p className="page-subtitle">Ready for instant dispatch and verified condition</p>
            </div>
            <Link to="/catalog" className="btn btn-primary btn-sm">
              See All Gear <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading featured devices..." />
          ) : (
            <div className="catalog-grid">
              {featuredProducts.map((p) => (
                <div key={p._id} className="product-card">
                  <div className="product-img-wrap">
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                      alt={p.name}
                      className="product-img"
                    />
                    <div className="product-condition-tag">{p.condition}</div>
                  </div>
                  <div className="product-card-body">
                    <span className="product-category">{p.category}</span>
                    <h3 className="product-name">{p.name}</h3>
                    <p className="product-model">{p.brand} • {p.model || 'Standard edition'}</p>
                    <div className="product-card-footer">
                      <div className="price-box">
                        <span className="price-amount">${p.pricePerDay}</span>
                        <span className="price-unit">per day</span>
                      </div>
                      <Link to={`/product/${p._id}`} className="btn btn-primary btn-sm">
                        Rent Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
