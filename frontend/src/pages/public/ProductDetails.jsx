import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { rentalService } from '../../services/rentalService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  ShieldCheck,
  Calendar,
  CreditCard,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rental date state (default: today to 3 days from now)
  const todayStr = new Date().toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(threeDaysLater);
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const prod = await productService.getById(id);
        setProduct(prod);
      } catch (err) {
        notifyError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, notifyError]);

  if (loading) {
    return <LoadingSpinner text="Loading product specifications..." />;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Catalog
        </Link>
      </div>
    );
  }

  // Calculate rental cost locally or with estimate API
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const rentalCharge = diffDays * product.pricePerDay;
  const securityDeposit = product.securityDeposit || 0;
  const totalAmount = rentalCharge + securityDeposit;
  const isAvailable = product.status === 'Available' && product.availableStock > 0;

  const handleBookingSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      await rentalService.createBooking({
        productId: product._id,
        startDate,
        endDate,
        notes
      });

      notifySuccess('Rental booked successfully! Your equipment reservation is confirmed.');
      setIsModalOpen(false);
      navigate('/my-rentals');
    } catch (err) {
      setBookingError(err.message || 'Failed to complete booking');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <Link to="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '3rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Product Image & Badges */}
        <div>
          <div className="card" style={{ overflow: 'hidden', borderRadius: '16px', position: 'relative' }}>
            <img
              src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
              alt={product.name}
              style={{ width: '100%', height: '400px', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <Badge status={product.status} />
            </div>
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              Condition: {product.condition}
            </div>
          </div>

          {/* Value Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={24} style={{ color: 'var(--success)' }} />
              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Full QC Inspection</h5>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Cleaned & tested</p>
              </div>
            </div>
            <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Truck size={24} style={{ color: 'var(--primary)' }} />
              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Priority Dispatch</h5>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Direct dispatch tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Specs & Rental Calculator */}
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              {product.category} • {product.brand}
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem', letterSpacing: '-0.02em' }}>
              {product.name}
            </h1>
            <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem' }}>
              {product.model}
            </p>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {product.description || 'High-performance electronic hardware available for production and event rentals.'}
          </p>

          {/* Pricing & Stock Banner */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.75rem'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Daily Rental Rate</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>${product.pricePerDay}</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}> / day</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Available Units</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: isAvailable ? 'var(--success)' : 'var(--danger)' }}>
                {product.availableStock} in stock
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>(Total: {product.stock})</span>
            </div>
          </div>

          {/* Rental Date Selection & Cost Breakdown Form */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Configure Rental Period
            </h3>

            <div className="form-row">
              <div className="form-col form-group">
                <label className="form-label">Rental Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  min={todayStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-col form-group">
                <label className="form-label">Rental End Date</label>
                <input
                  type="date"
                  className="form-control"
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project / Delivery Notes (Optional)</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Special delivery instructions or project requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Price Breakdown Calculation */}
            <div style={{
              background: '#f1f5f9',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.25rem',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Duration:</span>
                <span className="font-semibold">{diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Rental Fee ({diffDays} × ${product.pricePerDay}):</span>
                <span className="font-semibold">${rentalCharge}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Refundable Security Deposit:</span>
                <span className="font-semibold">${securityDeposit}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.6rem',
                borderTop: '1px solid #cbd5e1',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#0f172a'
              }}>
                <span>Total Amount Due:</span>
                <span style={{ color: 'var(--primary)' }}>${totalAmount}</span>
              </div>
            </div>

            <button
              className={`btn btn-block btn-lg ${isAvailable ? 'btn-primary' : 'btn-secondary'}`}
              disabled={!isAvailable}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
                } else {
                  setIsModalOpen(true);
                }
              }}
            >
              {isAvailable ? 'Proceed to Rental Confirmation' : 'Currently Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation & Simulated Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Rental & Payment Authorization"
      >
        {bookingError && <Alert type="danger" message={bookingError} />}

        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ color: '#475569', fontSize: '0.925rem', marginBottom: '1rem' }}>
            Please review your electronic equipment booking summary before authorizing reservation.
          </p>

          <div className="card" style={{ padding: '1rem', background: '#f8fafc', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{product.name}</h4>
            <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div>• Rental Window: <strong>{startDate}</strong> to <strong>{endDate}</strong> ({diffDays} days)</div>
              <div>• Daily Rate: <strong>${product.pricePerDay}</strong></div>
              <div>• Rental Charge: <strong>${rentalCharge}</strong></div>
              <div>• Security Deposit (Refundable): <strong>${securityDeposit}</strong></div>
              <div style={{ color: '#0f172a', fontWeight: 700, marginTop: '0.4rem', fontSize: '0.95rem' }}>
                • Total Payment: <span style={{ color: 'var(--primary)' }}>${totalAmount}</span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            color: '#065f46',
            fontSize: '0.85rem'
          }}>
            <CreditCard size={20} />
            <div>
              <strong>Simulated DevOps Payment Gateway:</strong> Your card will be authorized for ${totalAmount}. Security deposit is released upon return inspection.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-outline btn-md"
            onClick={() => setIsModalOpen(false)}
            disabled={bookingLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-success btn-md"
            onClick={handleBookingSubmit}
            disabled={bookingLoading}
          >
            {bookingLoading ? 'Processing Booking...' : 'Authorize & Confirm Rental'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetails;
