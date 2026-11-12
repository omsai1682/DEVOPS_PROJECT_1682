import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rentalService } from '../../services/rentalService';
import { useNotification } from '../../context/NotificationContext';
import {
  ArrowLeft,
  Truck,
  CheckCircle,
  Clock,
  RotateCcw,
  AlertTriangle,
  ClipboardCheck,
  Calendar,
  CreditCard
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';

export const RentalTracking = () => {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notifyError } = useNotification();

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const data = await rentalService.getById(id);
        setRental(data);
      } catch (err) {
        notifyError('Failed to load rental tracking details');
      } finally {
        setLoading(false);
      }
    };
    fetchRental();
  }, [id, notifyError]);

  if (loading) {
    return <LoadingSpinner text="Tracking rental shipment and status..." />;
  }

  if (!rental) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Rental Record Not Found</h2>
        <Link to="/my-rentals" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to My Rentals
        </Link>
      </div>
    );
  }

  const status = rental.bookingStatus;
  const isOverdue = status === 'Overdue';
  const isDispatched = ['Dispatched', 'Active', 'Return Requested', 'Returned'].includes(status);
  const isReturnRequested = ['Return Requested', 'Returned'].includes(status);
  const isReturned = status === 'Returned';

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <Link to="/my-rentals" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to My Rentals
      </Link>

      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            TRACKING ORDER #{rental._id.toUpperCase()}
          </span>
          <h1 className="page-title">{rental.product?.name}</h1>
          <p className="page-subtitle">Placed on {new Date(rental.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <Badge status={rental.bookingStatus} />
        </div>
      </div>

      {isOverdue && (
        <div className="alert-banner alert-danger" style={{ marginBottom: '2rem' }}>
          <AlertTriangle size={24} />
          <div>
            <h4 className="alert-title">Rental Past Due Date</h4>
            <p className="alert-message">
              This rental reached its due date on {new Date(rental.dueDate).toLocaleDateString()}.
              It is currently {rental.lateDays} day(s) overdue with an accrued late fee of ${rental.lateFee}.
              Please request return promptly to avoid additional charges.
            </p>
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        {/* Left Column: Tracking Timeline */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            Rental Lifecycle Status
          </h3>

          <div className="tracking-timeline">
            {/* Step 1: Booking Confirmed */}
            <div className="timeline-step completed">
              <div className="timeline-node"><CheckCircle size={14} /></div>
              <div className="timeline-title">Booking Confirmed & Payment Authorized</div>
              <div className="timeline-desc">
                Payment authorized. Security deposit secured in escrow.
                <br /><small>{new Date(rental.createdAt).toLocaleString()}</small>
              </div>
            </div>

            {/* Step 2: Dispatched */}
            <div className={`timeline-step ${isDispatched ? 'completed' : 'active'}`}>
              <div className="timeline-node">
                {isDispatched ? <CheckCircle size={14} /> : <Truck size={14} />}
              </div>
              <div className="timeline-title">Equipment Dispatched</div>
              <div className="timeline-desc">
                {rental.dispatchDate
                  ? `Unit packaged, verified, and dispatched on ${new Date(rental.dispatchDate).toLocaleString()}`
                  : 'Warehouse dispatch team is preparing your hardware.'}
              </div>
            </div>

            {/* Step 3: Active & In Use */}
            <div className={`timeline-step ${isReturnRequested || isReturned ? 'completed' : isDispatched ? 'active' : ''}`}>
              <div className="timeline-node">
                {isReturnRequested || isReturned ? <CheckCircle size={14} /> : <Clock size={14} />}
              </div>
              <div className="timeline-title">Active Rental Window</div>
              <div className="timeline-desc">
                Due Date: <strong>{new Date(rental.dueDate).toLocaleDateString()}</strong>
                {isOverdue && <span style={{ color: 'var(--danger)', display: 'block', fontWeight: 600 }}>Status: Overdue ({rental.lateDays} days late)</span>}
              </div>
            </div>

            {/* Step 4: Return Requested */}
            <div className={`timeline-step ${isReturned ? 'completed' : isReturnRequested ? 'active' : ''}`}>
              <div className="timeline-node">
                {isReturned ? <CheckCircle size={14} /> : <RotateCcw size={14} />}
              </div>
              <div className="timeline-title">Return Requested</div>
              <div className="timeline-desc">
                {rental.returnStatus !== 'Not Returned'
                  ? `Return status: ${rental.returnStatus}. Pending warehouse QA inspection.`
                  : 'Return not yet initiated.'}
              </div>
            </div>

            {/* Step 5: Inspected & Accepted */}
            <div className={`timeline-step ${isReturned ? 'completed' : ''}`}>
              <div className="timeline-node">
                <ClipboardCheck size={14} />
              </div>
              <div className="timeline-title">Quality Inspection & Completed</div>
              <div className="timeline-desc">
                {isReturned
                  ? `Inspection completed. Device accepted in ${rental.productConditionAfter} condition on ${new Date(rental.returnDate).toLocaleDateString()}. Deposit refunded.`
                  : 'Pending final return and supervisor inspection.'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Product Details */}
        <div>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Equipment Overview
            </h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <img
                src={rental.product?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                alt={rental.product?.name}
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10 }}
              />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{rental.product?.name}</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{rental.product?.brand} • {rental.product?.category}</p>
                <div style={{ marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>
                    Condition at rental: <strong>{rental.productConditionBefore}</strong>
                  </span>
                </div>
              </div>
            </div>

            {rental.inspectionNotes && (
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8, fontSize: '0.85rem', border: '1px solid var(--border)', marginTop: '0.75rem' }}>
                <strong>Warehouse Inspection Report:</strong>
                <p style={{ color: '#475569', marginTop: '0.25rem' }}>{rental.inspectionNotes}</p>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Final Condition: {rental.productConditionAfter} • Inspected By: {rental.inspectedBy?.name || 'Inventory Supervisor'}
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Financial Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Rental Duration</span>
                <span className="font-semibold">{rental.totalDays} day(s)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Rate per Day</span>
                <span className="font-semibold">${rental.pricePerDay}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Subtotal Rental Charge</span>
                <span className="font-semibold">${rental.rentalCharge}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Security Deposit</span>
                <span className="font-semibold">${rental.securityDeposit}</span>
              </div>
              {rental.lateFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                  <span>Late Fee ({rental.lateDays} days)</span>
                  <span className="font-bold">+${rental.lateFee}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border)',
                fontWeight: 800,
                fontSize: '1.15rem'
              }}>
                <span>Total Paid</span>
                <span style={{ color: 'var(--primary)' }}>${rental.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalTracking;
