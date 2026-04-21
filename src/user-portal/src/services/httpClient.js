import axios from 'axios';

const httpClient = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api' });

httpClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('user_auth');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      sessionStorage.removeItem('user_auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default httpClient;
