import axios from 'axios';

// Default API URL from environment variables or fallback to live Render backend
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // When running on cloud hosting (Vercel, Netlify)
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://devops-project-1682.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

const baseURL = getBaseUrl();

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 45000
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
