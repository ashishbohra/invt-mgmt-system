import httpClient from './httpClient';

const productService = {
  list: (params) => httpClient.get('/products', { params }),
  getById: (id) => httpClient.get(`/products/${id}`),
  create: (data) => httpClient.post('/products', data),
  update: (id, data) => httpClient.put(`/products/${id}`, data),
  delete: (id) => httpClient.delete(`/products/${id}`),
};

export default productService;
