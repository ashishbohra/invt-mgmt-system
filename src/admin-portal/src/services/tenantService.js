import httpClient from './httpClient';

const tenantService = {
  list: (params) => httpClient.get('/tenants', { params }),
  getById: (id) => httpClient.get(`/tenants/${id}`),
  create: (data) => httpClient.post('/tenants', data),
  update: (id, data) => httpClient.put(`/tenants/${id}`, data),
  delete: (id) => httpClient.delete(`/tenants/${id}`),
};

export default tenantService;
