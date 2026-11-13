import api from './api';
import { fallbackReports } from '../utils/mockFallback';

export const reportService = {
  getRentalReport: async (params = {}) => {
    try {
      const res = await api.get('/reports/rentals', { params });
      if (res.data?.report && res.data.report.length > 0) {
        return res.data;
      }
      return { count: fallbackReports.rentals.length, report: fallbackReports.rentals };
    } catch (err) {
      console.warn('API rental report unavailable, using demo fallback:', err.message);
      let report = [...fallbackReports.rentals];
      if (params.status && params.status !== 'All') {
        report = report.filter((r) => r.status === params.status);
      }
      return { count: report.length, report };
    }
  },

  getAvailabilityReport: async () => {
    try {
      const res = await api.get('/reports/availability');
      if (res.data?.report && res.data.report.length > 0) {
        return res.data;
      }
      return { count: fallbackReports.availability.length, report: fallbackReports.availability };
    } catch (err) {
      console.warn('API availability report unavailable, using demo fallback:', err.message);
      return { count: fallbackReports.availability.length, report: fallbackReports.availability };
    }
  },

  getRevenueReport: async (params = {}) => {
    try {
      const res = await api.get('/reports/revenue', { params });
      if (res.data?.report && res.data.report.totalRentals > 0) {
        return res.data;
      }
      return { report: fallbackReports.revenue };
    } catch (err) {
      console.warn('API revenue report unavailable, using demo fallback:', err.message);
      return { report: fallbackReports.revenue };
    }
  },

  getOverdueReport: async () => {
    try {
      const res = await api.get('/reports/overdue');
      if (res.data?.report && res.data.report.length > 0) {
        return res.data;
      }
      return { count: fallbackReports.overdue.length, report: fallbackReports.overdue };
    } catch (err) {
      console.warn('API overdue report unavailable, using demo fallback:', err.message);
      return { count: fallbackReports.overdue.length, report: fallbackReports.overdue };
    }
  },

  getDashboardSummary: async () => {
    try {
      const res = await api.get('/reports/dashboard-summary');
      if (res.data?.summary && res.data.summary.totalProducts > 0) {
        return res.data.summary;
      }
      return fallbackReports.dashboardSummary;
    } catch (err) {
      console.warn('API dashboard summary unavailable, using demo fallback:', err.message);
      return fallbackReports.dashboardSummary;
    }
  }
};
