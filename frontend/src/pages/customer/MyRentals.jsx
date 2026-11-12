import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rentalService } from '../../services/rentalService';
import { useNotification } from '../../context/NotificationContext';
import { ShoppingBag, ArrowRight, RotateCcw, AlertTriangle, Truck } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

export const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { notifySuccess, notifyError } = useNotification();

  const fetchRentals = async () => {
    try {
      const data = await rentalService.getMyRentals();
      setRentals(data.rentals || []);
    } catch (err) {
      notifyError('Failed to load your rentals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleReturnRequest = async () => {
    if (!selectedRental) return;
    setActionLoading(true);
    try {
      await rentalService.requestReturn(selectedRental._id);
      notifySuccess('Return requested successfully! Warehouse team will inspect your item.');
      setReturnModalOpen(false);
      fetchRentals();
    } catch (err) {
      notifyError(err.message || 'Failed to request return');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your equipment rentals..." />;
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Equipment Rentals</h1>
          <p className="page-subtitle">Track dispatch status, due dates, returns, and payment receipts</p>
        </div>
        <Link to="/catalog" className="btn btn-primary btn-sm">
          Rent More Gear <ArrowRight size={14} />
        </Link>
      </div>

      {rentals.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <ShoppingBag size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Rentals Found</h3>
          <p style={{ color: '#64748b', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
            You haven&apos;t rented any electronic equipment yet. Explore our catalog of laptops, cameras, consoles and more.
          </p>
          <Link to="/catalog" className="btn btn-primary">
            Browse Product Catalog
          </Link>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Rental ID</th>
                  <th>Product Details</th>
                  <th>Rental Period</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((r) => {
                  const isOverdue = r.bookingStatus === 'Overdue';
                  const canRequestReturn = ['Confirmed', 'Dispatched', 'Active', 'Overdue'].includes(r.bookingStatus);

                  return (
                    <tr key={r._id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        #{r._id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={r.product?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                            alt={r.product?.name}
                            style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }}
                          />
                          <div>
                            <div className="font-semibold">{r.product?.name || 'Device'}</div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {r.product?.category} • {r.totalDays} day(s)
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <div>Start: {new Date(r.startDate).toLocaleDateString()}</div>
                          <div style={{ color: '#64748b' }}>End: {new Date(r.endDate).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isOverdue ? 'var(--danger)' : '#0f172a' }}>
                          {new Date(r.dueDate).toLocaleDateString()}
                          {isOverdue && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <AlertTriangle size={12} /> {r.lateDays}d late (+${r.lateFee})
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">${r.totalAmount}</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Deposit: ${r.securityDeposit}
                        </span>
                      </td>
                      <td>
                        <Badge status={r.bookingStatus} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <Link
                            to={`/rental/track/${r._id}`}
                            className="btn btn-outline btn-sm"
                            title="Track Rental Progress"
                          >
                            <Truck size={14} /> Track
                          </Link>

                          {canRequestReturn && (
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Request Return"
                              onClick={() => {
                                setSelectedRental(r);
                                setReturnModalOpen(true);
                              }}
                            >
                              <RotateCcw size={14} /> Return
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Request Confirmation Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Request Equipment Return"
      >
        <p style={{ color: '#475569', fontSize: '0.925rem', marginBottom: '1.25rem' }}>
          Are you ready to initiate the return for <strong>{selectedRental?.product?.name}</strong>?
          Our inventory manager will perform an inspection upon receiving the unit and release your
          refundable deposit (${selectedRental?.securityDeposit}).
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            className="btn btn-outline btn-md"
            onClick={() => setReturnModalOpen(false)}
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary btn-md"
            onClick={handleReturnRequest}
            disabled={actionLoading}
          >
            {actionLoading ? 'Submitting...' : 'Confirm Return Request'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MyRentals;
