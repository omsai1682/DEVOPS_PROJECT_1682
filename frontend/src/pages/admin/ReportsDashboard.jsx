import { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { useNotification } from '../../context/NotificationContext';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  CheckCircle,
  AlertTriangle,
  Layers,
  DollarSign
} from 'lucide-react';
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
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState('rentals'); // rentals | availability | revenue | overdue
  const [loading, setLoading] = useState(false);

  // Report 1: Rental Booking Data & Filters
  const [rentalData, setRentalData] = useState([]);
  const [rentalStatusFilter, setRentalStatusFilter] = useState('All');
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');

  // Report 2: Availability Data
  const [availabilityData, setAvailabilityData] = useState([]);

  // Report 3: Revenue Data & Filters
  const [revenueData, setRevenueData] = useState(null);
  const [revenueRange, setRevenueRange] = useState('30d');
  const [customRevStart, setCustomRevStart] = useState('');
  const [customRevEnd, setCustomRevEnd] = useState('');

  // Report 4: Overdue Data
  const [overdueData, setOverdueData] = useState([]);

  const { notifyError, notifySuccess } = useNotification();

  // Load active report tab data
  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        if (activeTab === 'rentals') {
          const res = await reportService.getRentalReport({
            status: rentalStatusFilter,
            startDate: rentalStartDate,
            endDate: rentalEndDate
          });
          setRentalData(res.report || []);
        } else if (activeTab === 'availability') {
          const res = await reportService.getAvailabilityReport();
          setAvailabilityData(res.report || []);
        } else if (activeTab === 'revenue') {
          const res = await reportService.getRevenueReport({
            range: revenueRange,
            startDate: customRevStart,
            endDate: customRevEnd
          });
          setRevenueData(res.report);
        } else if (activeTab === 'overdue') {
          const res = await reportService.getOverdueReport();
          setOverdueData(res.report || []);
        }
      } catch (err) {
        notifyError('Failed to generate report data');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [
    activeTab,
    rentalStatusFilter,
    rentalStartDate,
    rentalEndDate,
    revenueRange,
    customRevStart,
    customRevEnd,
    notifyError
  ]);

  // Export CSV Helper
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      notifyError('No report data to export');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((item) =>
      Object.values(item)
        .map((val) => `"${typeof val === 'object' ? JSON.stringify(val).replace(/"/g, '""') : val}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notifySuccess('Report exported to CSV successfully');
  };

  return (
    <div className="reports-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Reports & Telemetry</h1>
          <p className="page-subtitle">Exportable analytics, utilization rates, financial audits, and overdue logs</p>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'rentals' ? 'active' : ''}`}
          onClick={() => setActiveTab('rentals')}
        >
          1. Rental Booking Report
        </button>
        <button
          className={`tab-btn ${activeTab === 'availability' ? 'active' : ''}`}
          onClick={() => setActiveTab('availability')}
        >
          2. Product Availability Report
        </button>
        <button
          className={`tab-btn ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          3. Revenue & Financial Report
        </button>
        <button
          className={`tab-btn ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          4. Overdue Rental Report
        </button>
      </div>

      {/* TAB 1: RENTAL BOOKING REPORT */}
      {activeTab === 'rentals' && (
        <div>
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Booking Status</label>
                  <select
                    className="form-control"
                    style={{ minWidth: '150px' }}
                    value={rentalStatusFilter}
                    onChange={(e) => setRentalStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Return Requested">Return Requested</option>
                    <option value="Returned">Returned</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={rentalStartDate}
                    onChange={(e) => setRentalStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={rentalEndDate}
                    onChange={(e) => setRentalEndDate(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={() => exportToCSV(rentalData, 'Rental_Booking_Report')}
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rental ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Duration</th>
                    <th>Rental Charge</th>
                    <th>Total Paid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="9"><LoadingSpinner text="Generating rental report..." /></td></tr>
                  ) : rentalData.length === 0 ? (
                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No rental records matching filters.</td></tr>
                  ) : (
                    rentalData.map((r) => (
                      <tr key={r.rentalId}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          #{r.rentalId.slice(-6).toUpperCase()}
                        </td>
                        <td>
                          <div className="font-semibold">{r.customer?.name}</div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.customer?.email}</span>
                        </td>
                        <td>{r.product?.name}</td>
                        <td>{new Date(r.startDate).toLocaleDateString()}</td>
                        <td>{new Date(r.endDate).toLocaleDateString()}</td>
                        <td>{r.totalDays}d</td>
                        <td>${r.rentalCharge}</td>
                        <td className="font-semibold">${r.totalAmount}</td>
                        <td><Badge status={r.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT AVAILABILITY REPORT */}
      {activeTab === 'availability' && (
        <div>
          <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => exportToCSV(availabilityData, 'Product_Availability_Report')}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Total Stock</th>
                    <th>Available</th>
                    <th>Rented Qty</th>
                    <th>Utilization</th>
                    <th>Condition</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8"><LoadingSpinner text="Compiling availability report..." /></td></tr>
                  ) : availabilityData.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No products found.</td></tr>
                  ) : (
                    availabilityData.map((p) => (
                      <tr key={p.productId}>
                        <td>
                          <div className="font-semibold">{p.product}</div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.brand}</span>
                        </td>
                        <td>{p.category}</td>
                        <td className="font-semibold">{p.stock}</td>
                        <td style={{ color: p.availableStock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                          {p.availableStock}
                        </td>
                        <td>{p.rentedStock}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${p.utilizationRate}%`, height: '100%', background: 'var(--primary)' }}></div>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.utilizationRate}%</span>
                          </div>
                        </td>
                        <td><span className="badge badge-neutral">{p.condition}</span></td>
                        <td><Badge status={p.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REVENUE REPORT */}
      {activeTab === 'revenue' && (
        <div>
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {['today', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    className={`btn btn-sm ${revenueRange === range ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setRevenueRange(range)}
                  >
                    {range === 'today' ? 'Today' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                  </button>
                ))}
              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={() => exportToCSV(revenueData?.timelineBreakdown || [], 'Revenue_Report')}
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          {/* Revenue KPI Summary */}
          <div className="stats-grid">
            <div className="stat-card stat-card-primary">
              <span className="stat-card-title">Completed Rentals</span>
              <h3 className="stat-card-value">{revenueData?.totalRentals || 0}</h3>
            </div>
            <div className="stat-card stat-card-success">
              <span className="stat-card-title">Rental Revenue</span>
              <h3 className="stat-card-value">${revenueData?.rentalRevenue || 0}</h3>
            </div>
            <div className="stat-card stat-card-info">
              <span className="stat-card-title">Security Deposits</span>
              <h3 className="stat-card-value">${revenueData?.deposits || 0}</h3>
            </div>
            <div className="stat-card stat-card-warning">
              <span className="stat-card-title">Late Penalty Fees</span>
              <h3 className="stat-card-value">${revenueData?.lateFees || 0}</h3>
            </div>
            <div className="stat-card stat-card-primary">
              <span className="stat-card-title">Total Revenue</span>
              <h3 className="stat-card-value">${revenueData?.totalRevenue || 0}</h3>
            </div>
          </div>

          {/* Revenue Visual Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Category Distribution</h3>
              <div style={{ height: '260px' }}>
                <Doughnut
                  data={{
                    labels: Object.keys(revenueData?.categoryBreakdown || {}),
                    datasets: [
                      {
                        data: Object.values(revenueData?.categoryBreakdown || {}),
                        backgroundColor: [
                          '#3b82f6',
                          '#10b981',
                          '#f59e0b',
                          '#ef4444',
                          '#8b5cf6',
                          '#06b6d4',
                          '#ec4899'
                        ]
                      }
                    ]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Financial Components</h3>
              <div style={{ height: '260px' }}>
                <Bar
                  data={{
                    labels: ['Rental Base', 'Deposits', 'Late Fees', 'Total Gross'],
                    datasets: [
                      {
                        label: 'Amount ($)',
                        data: [
                          revenueData?.rentalRevenue || 0,
                          revenueData?.deposits || 0,
                          revenueData?.lateFees || 0,
                          revenueData?.totalRevenue || 0
                        ],
                        backgroundColor: ['#3b82f6', '#06b6d4', '#f59e0b', '#10b981'],
                        borderRadius: 6
                      }
                    ]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OVERDUE RENTAL REPORT */}
      {activeTab === 'overdue' && (
        <div>
          <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Identifies active leases where Current Date &gt; Due Date and product has not been returned.
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => exportToCSV(overdueData, 'Overdue_Rentals_Report')}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rental ID</th>
                    <th>Customer Name</th>
                    <th>Contact Phone</th>
                    <th>Equipment</th>
                    <th>Due Date</th>
                    <th>Days Overdue</th>
                    <th>Accrued Late Fee</th>
                    <th>Total Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="9"><LoadingSpinner text="Detecting overdue accounts..." /></td></tr>
                  ) : overdueData.length === 0 ? (
                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>All equipment rentals are returned or on schedule. No overdue rentals found.</td></tr>
                  ) : (
                    overdueData.map((o) => (
                      <tr key={o.rentalId}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          #{o.rentalId.slice(-6).toUpperCase()}
                        </td>
                        <td>{o.customer?.name}</td>
                        <td>{o.customer?.phone || 'N/A'}</td>
                        <td className="font-semibold">{o.product?.name}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: 600 }}>
                          {new Date(o.dueDate).toLocaleDateString()}
                        </td>
                        <td><span className="badge badge-danger">{o.lateDays} days</span></td>
                        <td className="font-bold" style={{ color: 'var(--danger)' }}>+${o.lateFee}</td>
                        <td className="font-bold">${o.totalAmount}</td>
                        <td><Badge status={o.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
