const handle = require('../middleware/responseHandler');
const service = require('../services/tenantService');

module.exports = {
  list: handle(async (req) => {
    return service.list({
      search: req.query.search, status: req.query.status,
      page: +req.query.page || 1, limit: +req.query.limit || 10,
      sortBy: req.query.sortBy, sortOrder: req.query.sortOrder,
    });
  }),
  getById: handle(async (req) => {
    return { data: await service.getById(req.params.id) };
  }),
  create: handle(async (req) => {
    return { data: await service.create({ ...req.body, userEmail: req.user?.email }) };
  }),
  update: handle(async (req) => {
    return { data: await service.update(req.params.id, { ...req.body, userEmail: req.user?.email }) };
  }),
  delete: handle(async (req) => {
    await service.delete(req.params.id);
    return { message: 'Tenant deleted' };
  }),
};
