import httpClient from './httpClient';

const inventoryService = {
  list: (params) => httpClient.get('/inventory', { params }),
  getById: (id) => httpClient.get(`/inventory/${id}`),
  getByProductId: (productId) => httpClient.get(`/inventory/product/${productId}`),
  updateStock: (id, current_inventory) => httpClient.patch(`/inventory/${id}`, { current_inventory }),
};

export default inventoryService;
