import api from './api';

export const userService = {
  getAll: async (params = {}) => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data.user;
  },

  update: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data.user;
  },

  delete: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  }
};
