import api from './api';

export const reportService = {
  getRentalReport: async (params = {}) => {
    const res = await api.get('/reports/rentals', { params });
    return res.data;
  },

  getAvailabilityReport: async () => {
    const res = await api.get('/reports/availability');
    return res.data;
  },

  getRevenueReport: async (params = {}) => {
    const res = await api.get('/reports/revenue', { params });
    return res.data;
  },

  getOverdueReport: async () => {
    const res = await api.get('/reports/overdue');
    return res.data;
  },

  getDashboardSummary: async () => {
    const res = await api.get('/reports/dashboard-summary');
    return res.data.summary;
  }
};
