import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rentalService } from '../../services/rentalService';
import { useNotification } from '../../context/NotificationContext';
import {
  CalendarCheck,
  Search,
  Filter,
  Truck,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  ClipboardCheck,
  Eye
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

export const RentalManagement = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRental, setSelectedRental] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { notifySuccess, notifyError } = useNotification();

  const statuses = [
    'All',
    'Confirmed',
    'Dispatched',
    'Return Requested',
    'Returned',
    'Overdue',
    'Cancelled'
  ];

  const fetchRentals = async () => {
    try {
      const data = await rentalService.getAll();
      setRentals(data.rentals || []);
    } catch (err) {
      notifyError('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleDispatch = async (rentalId) => {
    setActionLoading(true);
    try {
      await rentalService.dispatch(rentalId);
      notifySuccess('Equipment marked as dispatched!');
      fetchRentals();
    } catch (err) {
      notifyError(err.message || 'Dispatch failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunOverdueScan = async () => {
    setActionLoading(true);
    try {
      const res = await rentalService.triggerOverdueCheck();
      notifySuccess(res.message || 'Overdue check completed');
      fetchRentals();
    } catch (err) {
      notifyError(err.message || 'Overdue scan failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRentals = rentals.filter((r) => {
    const matchesStatus = statusFilter === 'All' || r.bookingStatus === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r._id?.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner text="Fetching active rental leases..." />;
  }

  return (
    <div className="rental-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Enterprise Rental Operations</h1>
          <p className="page-subtitle">Track dispatches, active bookings, return workflows, and overdue penalties</p>
        </div>
        <button
          className="btn btn-outline btn-md"
          onClick={handleRunOverdueScan}
          disabled={actionLoading}
        >
          <RefreshCw size={16} className={actionLoading ? 'spinner-circle' : ''} />
          {actionLoading ? 'Checking...' : 'Run Overdue Scan'}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by customer name, email, product, or rental ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          </div>

          <div style={{ minWidth: '200px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Booking Statuses' : s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rental Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Window / Due Date</th>
                <th>Charge & Deposit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No rental bookings found matching filters.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((r) => {
                  const isOverdue = r.bookingStatus === 'Overdue';
                  const canDispatch = r.bookingStatus === 'Confirmed';
                  const canInspect = r.bookingStatus === 'Return Requested';

                  return (
                    <tr key={r._id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        #{r._id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        <div className="font-semibold">{r.user?.name || 'Customer'}</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.user?.email}</span>
                      </td>
                      <td>
                        <div className="font-semibold">{r.product?.name}</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.product?.category}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          Due: <strong style={{ color: isOverdue ? 'var(--danger)' : '#0f172a' }}>
                            {new Date(r.dueDate).toLocaleDateString()}
                          </strong>
                        </div>
                        {isOverdue && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>
                            Overdue by {r.lateDays}d (+${r.lateFee})
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="font-semibold">${r.totalAmount}</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Rent: ${r.rentalCharge} • Dep: ${r.securityDeposit}
                        </span>
                      </td>
                      <td>
                        <Badge status={r.bookingStatus} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {canDispatch && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleDispatch(r._id)}
                              disabled={actionLoading}
                              title="Dispatch Equipment"
                            >
                              <Truck size={14} /> Dispatch
                            </button>
                          )}

                          {canInspect && (
                            <Link
                              to="/inventory/inspection"
                              className="btn btn-warning btn-sm"
                              style={{ background: '#f59e0b', color: 'white' }}
                              title="Go to Warehouse Inspection"
                            >
                              <ClipboardCheck size={14} /> Inspect
                            </Link>
                          )}

                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              setSelectedRental(r);
                              setDetailsModalOpen(true);
                            }}
                            title="View Full Rental Breakdown"
                          >
                            <Eye size={14} /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rental Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Rental Dossier: #${selectedRental?._id?.toUpperCase()}`}
        maxWidth="640px"
      >
        {selectedRental && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{selectedRental.product?.name}</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Customer: {selectedRental.user?.name} ({selectedRental.user?.email})</p>
              </div>
              <Badge status={selectedRental.bookingStatus} />
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div><strong>Dates:</strong> {new Date(selectedRental.startDate).toLocaleDateString()} to {new Date(selectedRental.endDate).toLocaleDateString()} ({selectedRental.totalDays} days)</div>
              <div><strong>Due Date:</strong> {new Date(selectedRental.dueDate).toLocaleDateString()}</div>
              <div><strong>Daily Rate:</strong> ${selectedRental.pricePerDay}</div>
              <div><strong>Base Rental Charge:</strong> ${selectedRental.rentalCharge}</div>
              <div><strong>Security Deposit:</strong> ${selectedRental.securityDeposit}</div>
              {selectedRental.lateFee > 0 && (
                <div style={{ color: 'var(--danger)', fontWeight: 700 }}>
                  <strong>Late Penalty ({selectedRental.lateDays} days overdue):</strong> +${selectedRental.lateFee}
                </div>
              )}
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.4rem', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
                Total Payment Authorized: ${selectedRental.totalAmount}
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
              <div><strong>Condition at Dispatch:</strong> {selectedRental.productConditionBefore || 'Excellent'}</div>
              <div><strong>Condition after Return:</strong> {selectedRental.productConditionAfter || 'Pending Inspection'}</div>
              {selectedRental.notes && <div><strong>Customer Notes:</strong> {selectedRental.notes}</div>}
              {selectedRental.inspectionNotes && <div><strong>Inspection Notes:</strong> {selectedRental.inspectionNotes}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline btn-md" onClick={() => setDetailsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RentalManagement;
