import httpClient from './httpClient';

const orderService = {
  list: (params) => httpClient.get('/orders', { params }),
  getById: (id) => httpClient.get(`/orders/${id}`),
  create: (data) => httpClient.post('/orders', data),
  confirm: (id) => httpClient.patch(`/orders/${id}/confirm`),
  cancel: (id, reason) => httpClient.patch(`/orders/${id}/cancel`, { reason }),
  delete: (id) => httpClient.delete(`/orders/${id}`),
};

export default orderService;
