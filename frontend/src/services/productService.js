import api from './api';
import { fallbackProducts } from '../utils/mockFallback';

export const productService = {
  getAll: async (params = {}) => {
    try {
      const res = await api.get('/products', { params });
      return res.data;
    } catch (err) {
      console.warn('API unavailable, utilizing client-side fallback catalog:', err.message);
      let filtered = [...fallbackProducts];

      if (params.category && params.category !== 'All') {
        filtered = filtered.filter((p) => p.category === params.category);
      }
      if (params.condition && params.condition !== 'All') {
        filtered = filtered.filter((p) => p.condition === params.condition);
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.brand.toLowerCase().includes(s) ||
            p.model.toLowerCase().includes(s)
        );
      }
      if (params.sort === 'price_asc') {
        filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
      } else if (params.sort === 'price_desc') {
        filtered.sort((a, b) => b.pricePerDay - a.pricePerDay);
      }

      return { count: filtered.length, products: filtered };
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/products/${id}`);
      return res.data.product;
    } catch (err) {
      console.warn('API unavailable, retrieving from fallback catalog:', err.message);
      const found = fallbackProducts.find((p) => p._id === id);
      if (found) return found;
      // Return first product as fallback if mock ID differs
      return fallbackProducts[0];
    }
  },

  create: async (data) => {
    const res = await api.post('/products', data);
    return res.data.product;
  },

  update: async (id, data) => {
    const res = await api.put(`/products/${id}`, data);
    return res.data.product;
  },

  delete: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  }
};
