import httpClient from './httpClient';

const authService = {
  login: (data) => httpClient.post('/auth/login', data),
};

export default authService;
