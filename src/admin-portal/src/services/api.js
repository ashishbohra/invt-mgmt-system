import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

export const tenantApi = {
  list: (params) => api.get('/tenants', { params }),
  getById: (id) => api.get(`/tenants/${id}`),
  create: (data) => api.post('/tenants', data),
  update: (id, data) => api.put(`/tenants/${id}`, data),
  delete: (id) => api.delete(`/tenants/${id}`),
};
