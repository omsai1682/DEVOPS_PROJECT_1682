import api from './api';

export const productService = {
  getAll: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data.product;
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
