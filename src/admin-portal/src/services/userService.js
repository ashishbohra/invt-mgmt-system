import httpClient from './httpClient';

const userService = {
  list: (params) => httpClient.get('/users', { params }),
  getById: (id) => httpClient.get(`/users/${id}`),
  create: (data) => httpClient.post('/users', data),
  update: (id, data) => httpClient.put(`/users/${id}`, data),
  changePassword: (id, data) => httpClient.patch(`/users/${id}/password`, data),
  delete: (id) => httpClient.delete(`/users/${id}`),
  getEnums: () => httpClient.get('/users/enums'),
};

export default userService;
