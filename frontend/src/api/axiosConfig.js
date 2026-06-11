import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});

// Intercept requests to attach JWT token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept responses to catch 401 Unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If the error comes from the login endpoint, don't force a reload so the frontend can show the error
      if (error.config && error.config.url && error.config.url.includes('/auth/login')) {
        return Promise.reject(error);
      }
      
      // Token expired or invalid for other protected endpoints
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      // Redirect to login page and force React to remount state
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
