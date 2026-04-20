import httpClient from './httpClient';

const authService = {
  login: (data) => httpClient.post('/auth/admin/login', data),
};

export default authService;
