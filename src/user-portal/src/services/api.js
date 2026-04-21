import axios from 'axios';

const TENANT_NAME = process.env.REACT_APP_TENANT_NAME || '';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api' });

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('user_auth');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (TENANT_NAME) config.headers['X-Tenant-Name'] = TENANT_NAME;
  return config;
});

export const authApi = {
  login: (data) => api.post('/auth/login', data),
};

export const tenantApi = {
  list: (params) => api.get('/tenants', { params: { ...params, limit: 100 } }),
};

export const productApi = {
  list: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getActive: (tenantId) => api.get(`/products/active/${tenantId}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const inventoryApi = {
  list: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  getByProductId: (productId) => api.get(`/inventory/product/${productId}`),
  updateStock: (id, current_inventory) => api.patch(`/inventory/${id}`, { current_inventory }),
};

export const orderApi = {
  list: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  confirm: (id) => api.patch(`/orders/${id}/confirm`),
  cancel: (id, reason) => api.patch(`/orders/${id}/cancel`, { reason }),
  delete: (id) => api.delete(`/orders/${id}`),
};
