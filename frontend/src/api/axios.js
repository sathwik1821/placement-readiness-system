import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000
});

api.interceptors.request.use(
  (config) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const err = new Error('Need internet connection: You are currently offline.');
      err.isOffline = true;
      return Promise.reject(err);
    }
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers = config.headers || {};
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    const geminiKey = localStorage.getItem('gemini_api_key');
    if (geminiKey && geminiKey.trim()) {
      config.headers = config.headers || {};
      if (typeof config.headers.set === 'function') {
        config.headers.set('X-Gemini-Api-Key', geminiKey.trim());
      } else {
        config.headers['X-Gemini-Api-Key'] = geminiKey.trim();
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof navigator !== 'undefined' && (!navigator.onLine || error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      error.isOffline = true;
      error.userMessage = 'Need internet connection. Please verify your network to continue.';
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
