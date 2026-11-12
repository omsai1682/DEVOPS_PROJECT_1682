import { Link } from 'react-router-dom';
import { Laptop, ShieldCheck, RefreshCw, Clock, CheckCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        {/* Value props banner */}
        <div className="footer-highlights">
          <div className="highlight-item">
            <ShieldCheck size={28} className="highlight-icon" />
            <div>
              <h4>100% Inspected Devices</h4>
              <p>Thorough testing before & after every rental</p>
            </div>
          </div>
          <div className="highlight-item">
            <RefreshCw size={28} className="highlight-icon" />
            <div>
              <h4>Flexible Rental Periods</h4>
              <p>Rent from 1 day to multiple months easily</p>
            </div>
          </div>
          <div className="highlight-item">
            <Clock size={28} className="highlight-icon" />
            <div>
              <h4>Instant Status & Tracking</h4>
              <p>Live dispatch and automated overdue alerts</p>
            </div>
          </div>
        </div>

        <div className="footer-content">
          <div className="footer-col brand-col">
            <div className="nav-brand">
              <div className="brand-icon">
                <Laptop size={20} />
              </div>
              <span className="brand-name">Electro<span className="text-primary">Rent</span></span>
            </div>
            <p className="footer-desc">
              Next-generation electronic equipment rental platform built with high availability,
              robust role authorization, and complete DevOps CI/CD automation.
            </p>
            <div className="devops-pill">
              <CheckCircle size={14} /> Production Ready • Micro-tested • Dockerized
            </div>
          </div>

          <div className="footer-col">
            <h5>Navigation</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/catalog">Product Catalog</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Categories</h5>
            <ul>
              <li><Link to="/catalog?category=Laptops">Laptops & Workstations</Link></li>
              <li><Link to="/catalog?category=Cameras">Cameras & Lenses</Link></li>
              <li><Link to="/catalog?category=Gaming Consoles">Gaming Consoles</Link></li>
              <li><Link to="/catalog?category=Projectors">Audio & Projectors</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>DevOps Architecture</h5>
            <p className="footer-small">
              React SPA + Node Express REST + MongoDB Atlas. Integrated automated CI/CD pipeline with GitHub Actions & Docker Compose.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ElectroRent Management System. Built for College DevOps Project Demonstration.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
