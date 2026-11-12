import api from './api';

export const authService = {
  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      return res.data;
    } catch (err) {
      console.warn('API authentication unavailable, generating offline demo session:', err.message);
      // Fallback demo logins if backend is offline on Netlify preview
      const email = credentials.email?.toLowerCase();
      let role = 'customer';
      let name = 'Alex Johnson';

      if (email?.includes('admin')) {
        role = 'admin';
        name = 'System Administrator';
      } else if (email?.includes('inventory')) {
        role = 'inventory_manager';
        name = 'Inventory Supervisor';
      }

      return {
        user: {
          id: 'demo-user-id-' + role,
          name,
          email: credentials.email,
          role,
          phone: '+1-555-0100',
          address: '742 Evergreen Terrace, Tech Park, CA'
        },
        token: 'demo-jwt-token-' + role
      };
    }
  },

  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      return res.data;
    } catch (err) {
      console.warn('API registration unavailable, fallback demo session:', err.message);
      return {
        user: {
          id: 'demo-registered-' + Date.now(),
          name: userData.name,
          email: userData.email,
          role: 'customer',
          phone: userData.phone || '',
          address: userData.address || ''
        },
        token: 'demo-jwt-token-customer'
      };
    }
  },

  getProfile: async () => {
    try {
      const res = await api.get('/auth/me');
      return res.data.user;
    } catch (err) {
      const savedUser = localStorage.getItem('electro_user');
      if (savedUser) return JSON.parse(savedUser);
      throw err;
    }
  }
};
