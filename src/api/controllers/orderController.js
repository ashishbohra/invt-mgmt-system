const handle = require('../middleware/responseHandler');
const service = require('../services/orderService');

module.exports = {
  list: handle(async (req) => {
    return service.list({ tenantId: req.user.tenantId, status: req.query.status, activeFilter: req.query.activeFilter, page: +req.query.page || 1, limit: +req.query.limit || 10 });
  }),
  getById: handle(async (req) => {
    return { data: await service.getById(req.params.id) };
  }),
  create: handle(async (req) => {
    return { data: await service.create({ ...req.body, tenant_id: req.user.tenantId, userEmail: req.user.email }) };
  }),
  confirm: handle(async (req) => {
    return { data: await service.confirm(req.params.id, { userEmail: req.user.email, roles: req.user.roles }) };
  }),
  cancel: handle(async (req) => {
    return { data: await service.cancel(req.params.id, { userEmail: req.user.email, roles: req.user.roles, reason: req.body.reason }) };
  }),
  delete: handle(async (req) => {
    await service.delete(req.params.id, req.user.email);
    return { message: 'Order deleted' };
  }),
};
