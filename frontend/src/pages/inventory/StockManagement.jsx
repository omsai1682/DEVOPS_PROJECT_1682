import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { useNotification } from '../../context/NotificationContext';
import { SlidersHorizontal, Search, RefreshCw, CheckCircle, Edit, Save } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

export const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Edit stock/condition modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    stock: 1,
    availableStock: 1,
    condition: 'Excellent',
    status: 'Available'
  });
  const [submitting, setSubmitting] = useState(false);

  const { notifySuccess, notifyError } = useNotification();

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data.products || []);
    } catch (err) {
      notifyError('Failed to load inventory stock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openEdit = (p) => {
    setSelectedProduct(p);
    setFormData({
      stock: p.stock,
      availableStock: p.availableStock,
      condition: p.condition,
      status: p.status
    });
    setEditModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);

    try {
      await productService.update(selectedProduct._id, formData);
      notifySuccess(`Updated ${selectedProduct.name} stock & status`);
      setEditModalOpen(false);
      fetchProducts();
    } catch (err) {
      notifyError(err.message || 'Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch =
      searchTerm === '' ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner text="Loading stock allocations..." />;
  }

  return (
    <div className="stock-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Allocation & Hardware Condition</h1>
          <p className="page-subtitle">Real-time stock adjustments, condition grading, and maintenance routing</p>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search product stock..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Laptops">Laptops</option>
              <option value="Cameras">Cameras</option>
              <option value="Gaming Consoles">Gaming Consoles</option>
              <option value="Speakers">Speakers</option>
              <option value="Projectors">Projectors</option>
              <option value="Tablets">Tablets</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Hardware Product</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Total Units</th>
                <th>Available</th>
                <th>Currently Rented</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const rented = Math.max(0, p.stock - p.availableStock);
                return (
                  <tr key={p._id}>
                    <td>
                      <div className="font-semibold">{p.name}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.brand}</span>
                    </td>
                    <td>{p.category}</td>
                    <td><span className="badge badge-neutral">{p.condition}</span></td>
                    <td className="font-semibold">{p.stock}</td>
                    <td style={{ color: p.availableStock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                      {p.availableStock}
                    </td>
                    <td>{rented}</td>
                    <td><Badge status={p.status} /></td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEdit(p)}
                        title="Update Stock and Condition"
                      >
                        <Edit size={14} /> Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Adjust Stock: ${selectedProduct?.name}`}
      >
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-col form-group">
              <label className="form-label">Total Stock Count *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-col form-group">
              <label className="form-label">Available Stock Count *</label>
              <input
                type="number"
                min="0"
                max={formData.stock}
                className="form-control"
                value={formData.availableStock}
                onChange={(e) => setFormData({ ...formData, availableStock: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col form-group">
              <label className="form-label">Condition Assessment</label>
              <select
                className="form-control"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="New">New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Damaged">Damaged</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
            <div className="form-col form-group">
              <label className="form-label">Equipment Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-md"
              onClick={() => setEditModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Save Adjustments'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockManagement;
