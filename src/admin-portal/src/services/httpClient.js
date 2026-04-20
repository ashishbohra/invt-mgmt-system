import axios from 'axios';
import config from '../config';

const httpClient = axios.create({ baseURL: config.apiUrl });

httpClient.interceptors.request.use((req) => {
  const token = sessionStorage.getItem('admin_auth');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

httpClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('admin_auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default httpClient;
