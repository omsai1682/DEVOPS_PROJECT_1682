import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { useNotification } from '../../context/NotificationContext';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

export const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form state
  const initialForm = {
    name: '',
    category: 'Laptops',
    brand: '',
    model: '',
    description: '',
    condition: 'Excellent',
    pricePerDay: '',
    securityDeposit: '',
    stock: 1,
    image: '',
    status: 'Available'
  };
  const [formData, setFormData] = useState(initialForm);

  const { notifySuccess, notifyError } = useNotification();

  const categories = [
    'All',
    'Laptops',
    'Cameras',
    'Projectors',
    'Speakers',
    'TVs',
    'Gaming Consoles',
    'Tablets',
    'Smart Watches',
    'Headphones',
    'Other Electronics'
  ];

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data.products || []);
    } catch (err) {
      notifyError('Failed to load inventory catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedProduct(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setIsEditing(true);
    setSelectedProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      model: prod.model || '',
      description: prod.description || '',
      condition: prod.condition,
      pricePerDay: prod.pricePerDay,
      securityDeposit: prod.securityDeposit,
      stock: prod.stock,
      image: prod.image || '',
      status: prod.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      if (isEditing) {
        await productService.update(selectedProduct._id, formData);
        notifySuccess('Product updated successfully!');
      } else {
        await productService.create(formData);
        notifySuccess('New electronic product added to inventory!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      notifyError(err.message || 'Operation failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setFormSubmitting(true);
    try {
      await productService.delete(selectedProduct._id);
      notifySuccess('Product deleted successfully');
      setDeleteModalOpen(false);
      fetchProducts();
    } catch (err) {
      notifyError(err.message || 'Failed to delete product');
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch =
      searchTerm === '' ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.model?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner text="Loading product inventory..." />;
  }

  return (
    <div className="product-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Electronic Product Management</h1>
          <p className="page-subtitle">Add, edit, adjust stock, and update physical hardware condition</p>
        </div>
        <button className="btn btn-primary btn-md" onClick={openAddModal}>
          <Plus size={16} /> Add New Equipment
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
              placeholder="Search equipment by name or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          </div>

          <div style={{ minWidth: '200px' }}>
            <select
              className="form-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Daily Rate</th>
                <th>Deposit</th>
                <th>Stock (Avail/Total)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No products matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                          alt={p.name}
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }}
                        />
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.brand} • {p.model || 'Standard'}</span>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>
                      <span className="badge badge-neutral">{p.condition}</span>
                    </td>
                    <td className="font-semibold">${p.pricePerDay}/day</td>
                    <td>${p.securityDeposit}</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: p.availableStock > 0 ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {p.availableStock}
                      </span> / {p.stock}
                    </td>
                    <td>
                      <Badge status={p.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openEditModal(p)}
                          title="Edit Equipment"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
                          onClick={() => {
                            setSelectedProduct(p);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete Equipment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Equipment Specifications' : 'Register New Electronic Equipment'}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-col form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dell XPS 15"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-col form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col form-group">
              <label className="form-label">Brand *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dell, Sony, Apple"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
              />
            </div>
            <div className="form-col form-group">
              <label className="form-label">Model / Specs</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Core i7 32GB RAM"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Hardware details, accessories included..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-col form-group">
              <label className="form-label">Price per Day ($) *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                required
              />
            </div>
            <div className="form-col form-group">
              <label className="form-label">Security Deposit ($) *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                required
              />
            </div>
            <div className="form-col form-group">
              <label className="form-label">Total Stock Units *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col form-group">
              <label className="form-label">Condition</label>
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
              <label className="form-label">Availability Status</label>
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

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-md"
              onClick={() => setIsModalOpen(false)}
              disabled={formSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md"
              disabled={formSubmitting}
            >
              {formSubmitting ? 'Saving...' : isEditing ? 'Update Equipment' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Equipment Deletion"
      >
        <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
          Are you sure you want to permanently delete <strong>{selectedProduct?.name}</strong>?
          This action will remove it from the catalog and cannot be undone.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            className="btn btn-outline btn-md"
            onClick={() => setDeleteModalOpen(false)}
            disabled={formSubmitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger btn-md"
            onClick={handleDelete}
            disabled={formSubmitting}
          >
            {formSubmitting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductManagement;
