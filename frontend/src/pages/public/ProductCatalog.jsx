import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { Search, Filter, ArrowUpDown, Check, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';

export const ProductCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('category') || 'All';
  const selectedCondition = searchParams.get('condition') || 'All';
  const searchTerm = searchParams.get('search') || '';
  const sortOption = searchParams.get('sort') || 'newest';

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
    'Headphones'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (selectedCondition !== 'All') params.condition = selectedCondition;
        if (searchTerm) params.search = searchTerm;
        if (sortOption === 'price_asc') params.sort = 'price_asc';
        if (sortOption === 'price_desc') params.sort = 'price_desc';

        const data = await productService.getAll(params);
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedCondition, searchTerm, sortOption]);

  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === 'All' || value === '') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Electronic Equipment Catalog</h1>
          <p className="page-subtitle">
            Verified, enterprise-grade hardware available for short and long-term rental
          </p>
        </div>
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Showing <strong>{products.length}</strong> items
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by brand, model, or specs..."
              value={searchTerm}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          </div>

          {/* Condition Filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-control"
              value={selectedCondition}
              onChange={(e) => updateFilter('condition', e.target.value)}
            >
              <option value="All">All Conditions</option>
              <option value="New">New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          {/* Sorting */}
          <div style={{ minWidth: '180px' }}>
            <select
              className="form-control"
              value={sortOption}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingTop: '1rem',
          marginTop: '1rem',
          borderTop: '1px solid var(--border)'
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilter('category', cat)}
              style={{
                background: selectedCategory === cat ? 'var(--primary)' : '#f1f5f9',
                color: selectedCategory === cat ? 'white' : '#475569',
                border: 'none',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching electronic products..." />
      ) : products.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={40} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No products found</h3>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            Try adjusting your search criteria or resetting the category filter.
          </p>
          <button
            className="btn btn-outline btn-sm"
            style={{ marginTop: '1rem' }}
            onClick={() => setSearchParams({})}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="catalog-grid">
          {products.map((p) => {
            const isAvailable = p.status === 'Available' && p.availableStock > 0;
            return (
              <div key={p._id} className="product-card">
                <div className="product-img-wrap">
                  <img
                    src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                    alt={p.name}
                    className="product-img"
                  />
                  <div className="product-badge-overlay">
                    <Badge status={p.status} />
                  </div>
                  <div className="product-condition-tag">{p.condition}</div>
                </div>

                <div className="product-card-body">
                  <span className="product-category">{p.category}</span>
                  <h3 className="product-name">{p.name}</h3>
                  <p className="product-model">{p.brand} • {p.model || 'Standard'}</p>

                  <div style={{
                    fontSize: '0.8rem',
                    color: '#64748b',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Stock: <strong>{p.availableStock}</strong> of {p.stock} avail</span>
                    <span>Deposit: <strong>${p.securityDeposit}</strong></span>
                  </div>

                  <div className="product-card-footer">
                    <div className="price-box">
                      <span className="price-amount">${p.pricePerDay}</span>
                      <span className="price-unit">per day</span>
                    </div>

                    <Link
                      to={`/product/${p._id}`}
                      className={`btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {isAvailable ? 'Rent Device' : 'View Details'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
