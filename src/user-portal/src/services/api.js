import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

export const tenantApi = {
  list: (params) => api.get('/tenants', { params: { ...params, limit: 100 } }),
};

export const productApi = {
  list: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getActive: (tenantId) => api.get(`/products/active/${tenantId}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const inventoryApi = {
  list: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  updateStock: (id, current_inventory) => api.patch(`/inventory/${id}`, { current_inventory }),
  delete: (id) => api.delete(`/inventory/${id}`),
};

export const orderApi = {
  list: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  confirm: (id) => api.patch(`/orders/${id}/confirm`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  delete: (id) => api.delete(`/orders/${id}`),
};
