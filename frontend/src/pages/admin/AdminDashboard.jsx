import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { rentalService } from '../../services/rentalService';
import { useNotification } from '../../context/NotificationContext';
import {
  Users,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  PlusCircle,
  FileText,
  CalendarCheck,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [overdueList, setOverdueList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);

  const { notifySuccess, notifyError } = useNotification();

  const loadDashboardData = async () => {
    try {
      const [sumRes, revRes, ovRes] = await Promise.all([
        reportService.getDashboardSummary(),
        reportService.getRevenueReport({ range: '30d' }),
        reportService.getOverdueReport()
      ]);

      setSummary(sumRes);
      setRevenueData(revRes.report);
      setOverdueList(ovRes.report || []);
    } catch (err) {
      notifyError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRunOverdueScan = async () => {
    setScanLoading(true);
    try {
      const res = await rentalService.triggerOverdueCheck();
      notifySuccess(res.message || 'Overdue scan completed');
      await loadDashboardData();
    } catch (err) {
      notifyError(err.message || 'Failed to scan overdue rentals');
    } finally {
      setScanLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Aggregating enterprise telemetry..." />;
  }

  // Chart data from category breakdown
  const categoryLabels = Object.keys(revenueData?.categoryBreakdown || {});
  const categoryValues = Object.values(revenueData?.categoryBreakdown || {});

  const chartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['Laptops', 'Cameras', 'Consoles', 'Audio'],
    datasets: [
      {
        label: 'Rental Revenue ($)',
        data: categoryValues.length > 0 ? categoryValues : [450, 320, 210, 180],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Command Center</h1>
          <p className="page-subtitle">Real-time electronics rental metrics, stock status, and revenue telemetry</p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={handleRunOverdueScan}
            disabled={scanLoading}
            title="Scan for overdue rentals past due date and calculate late fees"
          >
            <RefreshCw size={14} className={scanLoading ? 'spinner-circle' : ''} />
            {scanLoading ? 'Scanning...' : 'Scan Overdue Rentals'}
          </button>
          <Link to="/admin/products" className="btn btn-primary btn-sm">
            <PlusCircle size={14} /> Add Product
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Customers"
          value={summary?.totalUsers || 0}
          icon={Users}
          color="primary"
          change="Registered accounts"
        />
        <StatCard
          title="Total Products"
          value={summary?.totalProducts || 0}
          icon={Package}
          color="info"
          change={`${summary?.availableProducts || 0} in active stock`}
        />
        <StatCard
          title="Active Rentals"
          value={summary?.activeRentals || 0}
          icon={CalendarCheck}
          color="warning"
          change="Dispatched or in use"
        />
        <StatCard
          title="Overdue Items"
          value={summary?.overdueRentals || 0}
          icon={AlertTriangle}
          color="danger"
          trend="down"
          change="Requires penalty notice"
        />
        <StatCard
          title="Gross Revenue"
          value={`$${summary?.totalRevenue || 0}`}
          icon={DollarSign}
          color="success"
          trend="up"
          change="Rentals + Deposits + Fees"
        />
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
          Management Quick Actions
        </h4>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/products" className="btn btn-outline btn-sm">
            <Package size={16} /> Manage Products
          </Link>
          <Link to="/admin/rentals" className="btn btn-outline btn-sm">
            <CalendarCheck size={16} /> Manage Rentals
          </Link>
          <Link to="/admin/users" className="btn btn-outline btn-sm">
            <Users size={16} /> User Management
          </Link>
          <Link to="/admin/reports" className="btn btn-outline btn-sm">
            <FileText size={16} /> View Reports (4 Models)
          </Link>
        </div>
      </div>

      {/* Analytics Chart & Overdue Notice Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Revenue Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Revenue by Category</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Last 30 Days</span>
          </div>
          <div style={{ height: '260px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Revenue Breakdown Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Financial Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: '#64748b' }}>Base Rental Revenue:</span>
              <span className="font-bold">${summary?.rentalRevenue || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: '#64748b' }}>Security Deposits Held:</span>
              <span className="font-bold">${summary?.depositRevenue || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: '#64748b' }}>Late Penalty Fees Collected:</span>
              <span className="font-bold" style={{ color: 'var(--danger)' }}>${summary?.lateFeeRevenue || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
              <span>Total Accrued:</span>
              <span style={{ color: 'var(--primary)' }}>${summary?.totalRevenue || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Alert Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
            <h3 className="card-title">Priority Attention: Overdue Equipment</h3>
          </div>
          <Link to="/admin/reports" className="btn btn-outline btn-sm">
            View Overdue Report
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Rental ID</th>
                <th>Customer</th>
                <th>Equipment</th>
                <th>Due Date</th>
                <th>Days Overdue</th>
                <th>Late Penalty</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {overdueList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                    No overdue equipment currently. All active rentals are within schedule.
                  </td>
                </tr>
              ) : (
                overdueList.map((item) => (
                  <tr key={item.rentalId}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      #{item.rentalId.slice(-6).toUpperCase()}
                    </td>
                    <td>
                      <div className="font-semibold">{item.customer?.name}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.customer?.email}</span>
                    </td>
                    <td>{item.product?.name}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>
                      {new Date(item.dueDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="badge badge-danger">{item.lateDays} days</span>
                    </td>
                    <td className="font-bold" style={{ color: 'var(--danger)' }}>
                      +${item.lateFee}
                    </td>
                    <td>
                      <Link to={`/admin/rentals`} className="btn btn-outline btn-sm">
                        Manage
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

export default AdminDashboard;
