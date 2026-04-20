const handle = require('../middleware/responseHandler');
const service = require('../services/authService');

module.exports = {
  adminLogin: handle(async (req) => {
    return { data: await service.adminLogin(req.body) };
  }),
  userLogin: handle(async (req) => {
    return { data: await service.userLogin({ ...req.body, tenantId: req.tenantId }) };
  }),
};
