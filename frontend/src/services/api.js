import axios from 'axios';

// Default API URL from environment variables or fallback to relative/localhost
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Interceptor to attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('electro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle responses and unauthorized errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const originalRequest = error.config;
    // If 401 Unauthorized occurs on protected routes, remove token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (localStorage.getItem('electro_token')) {
        localStorage.removeItem('electro_token');
        localStorage.removeItem('electro_user');
        // Optional redirect to login if window is available
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login?expired=true';
        }
      }
    }
    const message =
      error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
