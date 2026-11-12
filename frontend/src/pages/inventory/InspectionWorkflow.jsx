import { useState, useEffect } from 'react';
import { rentalService } from '../../services/rentalService';
import { useNotification } from '../../context/NotificationContext';
import {
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Package,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

export const InspectionWorkflow = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Inspection form
  const [conditionAfter, setConditionAfter] = useState('Excellent');
  const [returnStatus, setReturnStatus] = useState('Accepted');
  const [inspectionNotes, setInspectionNotes] = useState('');

  const { notifySuccess, notifyError } = useNotification();

  const fetchInspectionQueue = async () => {
    try {
      // Find rentals that are Return Requested or Pending Inspection
      const data = await rentalService.getAll();
      const queue = (data.rentals || []).filter(
        (r) => r.bookingStatus === 'Return Requested' || r.returnStatus === 'Pending Inspection'
      );
      setRentals(queue);
    } catch (err) {
      notifyError('Failed to load inspection queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectionQueue();
  }, []);

  const openInspection = (rental) => {
    setSelectedRental(rental);
    setConditionAfter(rental.productConditionBefore || 'Excellent');
    setReturnStatus('Accepted');
    setInspectionNotes('');
    setModalOpen(true);
  };

  const handleProcessInspection = async (e) => {
    e.preventDefault();
    if (!selectedRental) return;

    setSubmitting(true);
    try {
      await rentalService.inspectReturn(selectedRental._id, {
        conditionAfter,
        returnStatus,
        inspectionNotes
      });

      notifySuccess(
        returnStatus === 'Accepted'
          ? `Return accepted! Inventory stock for ${selectedRental.product?.name} incremented by 1.`
          : 'Inspection processed and return status flagged.'
      );

      setModalOpen(false);
      fetchInspectionQueue();
    } catch (err) {
      notifyError(err.message || 'Inspection failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Scanning warehouse returns for inspection..." />;
  }

  return (
    <div className="inspection-workflow">
      <div className="page-header">
        <div>
          <h1 className="page-title">Returned Product Inspection Station</h1>
          <p className="page-subtitle">Perform QA evaluations, adjust hardware physical conditions, and release available stock</p>
        </div>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Queue: <strong>{rentals.length}</strong> items awaiting inspection
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Rental ID</th>
                <th>Hardware Item</th>
                <th>Customer</th>
                <th>Pre-Rental Condition</th>
                <th>Rental Window</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
                    <ShieldCheck size={48} style={{ color: 'var(--success)', margin: '0 auto 1rem', display: 'block' }} />
                    <h3 style={{ color: '#0f172a' }}>Inspection Queue Clear!</h3>
                    <p style={{ marginTop: '0.4rem' }}>
                      All customer returned electronic devices have been inspected, graded, and restocked.
                    </p>
                  </td>
                </tr>
              ) : (
                rentals.map((r) => (
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
                          <div className="font-semibold">{r.product?.name}</div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.product?.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold">{r.user?.name}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.user?.email}</span>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{r.productConditionBefore || 'Excellent'}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {new Date(r.startDate).toLocaleDateString()} - {new Date(r.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <Badge status={r.bookingStatus} />
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openInspection(r)}
                      >
                        <ClipboardCheck size={14} /> Begin Inspection
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Quality Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Hardware Inspection: ${selectedRental?.product?.name}`}
        maxWidth="620px"
      >
        <form onSubmit={handleProcessInspection}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span>Initial Condition at Dispatch:</span>
              <strong>{selectedRental?.productConditionBefore || 'Excellent'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span>Customer Notes:</span>
              <span>{selectedRental?.notes || 'None recorded'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Security Deposit in Escrow:</span>
              <strong style={{ color: 'var(--success)' }}>${selectedRental?.securityDeposit}</strong>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Post-Rental Inspected Condition *</label>
            <select
              className="form-control"
              value={conditionAfter}
              onChange={(e) => setConditionAfter(e.target.value)}
              required
            >
              <option value="Excellent">Excellent (Like new, full accessories)</option>
              <option value="Good">Good (Normal minor wear, fully working)</option>
              <option value="Fair">Fair (Noticeable cosmetic signs, working)</option>
              <option value="Damaged">Damaged (Requires repair/damage assessment)</option>
              <option value="Under Maintenance">Under Maintenance (Sent to bench testing)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Inspection Verification Outcome *</label>
            <select
              className="form-control"
              value={returnStatus}
              onChange={(e) => setReturnStatus(e.target.value)}
              required
            >
              <option value="Accepted">Accepted (Restock unit, increase availableStock by 1)</option>
              <option value="Rejected">Rejected (Dispute / Missing accessories)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Warehouse Inspection Notes</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g. Cables checked, ports tested, glass clean, battery health 98%..."
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-md"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md"
              disabled={submitting}
            >
              {submitting ? 'Processing QA Report...' : 'Finalize & Update Inventory'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InspectionWorkflow;
