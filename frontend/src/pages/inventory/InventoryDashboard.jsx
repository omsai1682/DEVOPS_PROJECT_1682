import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { rentalService } from '../../services/rentalService';
import { useNotification } from '../../context/NotificationContext';
import {
  Warehouse,
  PackageCheck,
  PackageX,
  AlertTriangle,
  Wrench,
  RotateCcw,
  ClipboardCheck,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export const InventoryDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [pendingReturns, setPendingReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifyError } = useNotification();

  const loadData = async () => {
    try {
      const [sumRes, rentalsRes] = await Promise.all([
        reportService.getDashboardSummary(),
        rentalService.getAll({ status: 'Return Requested' })
      ]);
      setSummary(sumRes);
      setPendingReturns(rentalsRes.rentals || []);
    } catch (err) {
      notifyError('Failed to load inventory warehouse metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Connecting to warehouse telemetry..." />;
  }

  return (
    <div className="inventory-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouse & Inventory Hub</h1>
          <p className="page-subtitle">Hardware inspection, quality assurance, condition scoring, and stock allocation</p>
        </div>
        <Link to="/inventory/inspection" className="btn btn-primary btn-md">
          <ClipboardCheck size={16} /> Open Inspection Station ({summary?.pendingInspections || 0})
        </Link>
      </div>

      {/* Inventory KPI Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Hardware Stock"
          value={summary?.totalProducts || 0}
          icon={Warehouse}
          color="primary"
          change="Catalog items"
        />
        <StatCard
          title="Available in Stock"
          value={summary?.availableProducts || 0}
          icon={PackageCheck}
          color="success"
          change="Ready for dispatch"
        />
        <StatCard
          title="Currently Rented"
          value={summary?.activeRentals || 0}
          icon={RotateCcw}
          color="info"
          change="In customer custody"
        />
        <StatCard
          title="Under Maintenance"
          value={summary?.maintenanceProducts || 0}
          icon={Wrench}
          color="warning"
          change="Service & repairs"
        />
        <StatCard
          title="Damaged Equipment"
          value={summary?.damagedProducts || 0}
          icon={AlertTriangle}
          color="danger"
          change="Flagged during QA"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ background: '#fef3c7', color: '#b45309', padding: 10, borderRadius: 10 }}>
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Returned Product Inspections</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                {pendingReturns.length} return(s) awaiting hardware physical check
              </p>
            </div>
          </div>
          <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Inspect returned items, record post-rental condition, verify accessories, and automatically release units back to inventory stock.
          </p>
          <Link to="/inventory/inspection" className="btn btn-primary btn-sm">
            Launch Inspection Workflow <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ background: '#dbeafe', color: '#1d4ed8', padding: 10, borderRadius: 10 }}>
              <SlidersHorizontal size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Stock & Condition Center</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Quick bulk updates and maintenance routing
              </p>
            </div>
          </div>
          <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Modify physical stock counts, flag damaged hardware for bench testing, or mark refurbished devices as available for customer rental.
          </p>
          <Link to="/inventory/stock" className="btn btn-outline btn-sm">
            Manage Stock & Conditions <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Pending Inspection Queue Preview */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Pending Returns Awaiting Quality Inspection</h3>
          <Link to="/inventory/inspection" className="btn btn-outline btn-sm">
            View All ({pendingReturns.length})
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Rental ID</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Dispatch Condition</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingReturns.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No pending inspections! All returned electronic devices are fully processed and stocked.
                  </td>
                </tr>
              ) : (
                pendingReturns.slice(0, 5).map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      #{r._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="font-semibold">{r.product?.name}</td>
                    <td>{r.user?.name}</td>
                    <td><span className="badge badge-neutral">{r.productConditionBefore}</span></td>
                    <td>{new Date(r.dueDate).toLocaleDateString()}</td>
                    <td>
                      <Link to="/inventory/inspection" className="btn btn-primary btn-sm">
                        Inspect Unit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
