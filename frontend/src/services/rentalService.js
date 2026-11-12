import api from './api';

export const rentalService = {
  getEstimate: async (data) => {
    const res = await api.post('/rentals/estimate', data);
    return res.data;
  },

  createBooking: async (data) => {
    const res = await api.post('/rentals', data);
    return res.data.rental;
  },

  getAll: async (params = {}) => {
    const res = await api.get('/rentals', { params });
    return res.data;
  },

  getMyRentals: async () => {
    const res = await api.get('/rentals/my-rentals');
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/rentals/${id}`);
    return res.data.rental;
  },

  dispatch: async (id) => {
    const res = await api.put(`/rentals/${id}/dispatch`);
    return res.data.rental;
  },

  requestReturn: async (id) => {
    const res = await api.put(`/rentals/${id}/return`);
    return res.data.rental;
  },

  inspectReturn: async (id, data) => {
    const res = await api.put(`/rentals/${id}/inspect`, data);
    return res.data.rental;
  },

  triggerOverdueCheck: async () => {
    const res = await api.post('/rentals/check-overdue');
    return res.data;
  }
};
