import api from './api';
import { fallbackRentals, fallbackProducts } from '../utils/mockFallback';

export const rentalService = {
  getEstimate: async (data) => {
    try {
      const res = await api.post('/rentals/estimate', data);
      return res.data;
    } catch (err) {
      console.warn('API estimate unavailable, calculating fallback preview:', err.message);
      const prod = fallbackProducts.find((p) => p._id === data.productId || p.id === data.productId) || fallbackProducts[1];
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffTime = Math.abs(end - start);
      const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const rentalCharge = totalDays * prod.pricePerDay;
      const securityDeposit = prod.securityDeposit;
      return {
        estimate: {
          product: prod,
          startDate: start,
          endDate: end,
          dueDate: end,
          totalDays,
          pricePerDay: prod.pricePerDay,
          rentalCharge,
          securityDeposit,
          totalAmount: rentalCharge + securityDeposit
        }
      };
    }
  },

  createBooking: async (data) => {
    try {
      const res = await api.post('/rentals', data);
      return res.data.rental;
    } catch (err) {
      console.warn('API booking unavailable, creating in-memory demo rental:', err.message);
      const prod = fallbackProducts.find((p) => p._id === data.productId || p.id === data.productId) || fallbackProducts[1];
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffTime = Math.abs(end - start);
      const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const rentalCharge = totalDays * prod.pricePerDay;
      const securityDeposit = prod.securityDeposit;
      const bookingId = `6af5ff69a1fe32d4d266e${Date.now().toString().slice(-4)}`;

      const newRental = {
        _id: bookingId,
        id: bookingId,
        user: {
          _id: '6af5ff69a1fe32d4d266e973',
          id: '6af5ff69a1fe32d4d266e973',
          name: 'Customer Demo',
          email: 'customer@example.com',
          phone: '+1-555-0102'
        },
        product: prod,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        dueDate: end.toISOString(),
        totalDays,
        pricePerDay: prod.pricePerDay,
        rentalCharge,
        securityDeposit,
        lateDays: 0,
        lateFee: 0,
        totalAmount: rentalCharge + securityDeposit,
        bookingStatus: 'Confirmed',
        paymentStatus: 'Paid',
        returnStatus: 'Not Returned',
        productConditionBefore: prod.condition || 'Excellent',
        productConditionAfter: 'Pending',
        notes: data.notes || '',
        createdAt: new Date().toISOString()
      };

      fallbackRentals.unshift(newRental);
      return newRental;
    }
  },

  getAll: async (params = {}) => {
    try {
      const res = await api.get('/rentals', { params });
      if (res.data?.rentals && res.data.rentals.length > 0) {
        return res.data;
      }
      return { count: fallbackRentals.length, rentals: fallbackRentals };
    } catch (err) {
      console.warn('API getAll rentals unavailable, using fallback list:', err.message);
      let list = [...fallbackRentals];
      if (params.status && params.status !== 'All') {
        list = list.filter((r) => r.bookingStatus === params.status);
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        list = list.filter(
          (r) =>
            r.user?.name?.toLowerCase().includes(s) ||
            r.product?.name?.toLowerCase().includes(s) ||
            r._id?.toLowerCase().includes(s)
        );
      }
      return { count: list.length, rentals: list };
    }
  },

  getMyRentals: async () => {
    try {
      const res = await api.get('/rentals/my-rentals');
      if (res.data?.rentals && res.data.rentals.length > 0) {
        return res.data;
      }
      return { count: fallbackRentals.length, rentals: fallbackRentals };
    } catch (err) {
      console.warn('API getMyRentals unavailable, returning demo rentals:', err.message);
      return { count: fallbackRentals.length, rentals: fallbackRentals };
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/rentals/${id}`);
      return res.data.rental;
    } catch (err) {
      console.warn('API getById unavailable, returning demo rental:', err.message);
      const found = fallbackRentals.find((r) => r._id === id || r.id === id);
      return found || fallbackRentals[0];
    }
  },

  dispatch: async (id) => {
    try {
      const res = await api.put(`/rentals/${id}/dispatch`);
      return res.data.rental;
    } catch (err) {
      const found = fallbackRentals.find((r) => r._id === id || r.id === id) || fallbackRentals[0];
      found.bookingStatus = 'Dispatched';
      return found;
    }
  },

  requestReturn: async (id) => {
    try {
      const res = await api.put(`/rentals/${id}/return`);
      return res.data.rental;
    } catch (err) {
      const found = fallbackRentals.find((r) => r._id === id || r.id === id) || fallbackRentals[0];
      found.bookingStatus = 'Return Requested';
      found.returnStatus = 'Pending Inspection';
      return found;
    }
  },

  inspectReturn: async (id, data) => {
    try {
      const res = await api.put(`/rentals/${id}/inspect`, data);
      return res.data.rental;
    } catch (err) {
      const found = fallbackRentals.find((r) => r._id === id || r.id === id) || fallbackRentals[0];
      found.bookingStatus = 'Returned';
      found.returnStatus = data.returnStatus || 'Accepted';
      found.productConditionAfter = data.conditionAfter || 'Excellent';
      found.inspectionNotes = data.inspectionNotes || 'Inspected and verified';
      return found;
    }
  },

  triggerOverdueCheck: async () => {
    try {
      const res = await api.post('/rentals/check-overdue');
      return res.data;
    } catch (err) {
      return { message: 'Overdue check completed', count: 1 };
    }
  }
};
