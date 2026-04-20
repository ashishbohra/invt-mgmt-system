const handle = require('../middleware/responseHandler');
const service = require('../services/productService');

module.exports = {
  list: handle(async (req) => {
    return service.list({
      tenantId: req.user.tenantId, search: req.query.search,
      page: +req.query.page || 1, limit: +req.query.limit || 10,
      sortBy: req.query.sortBy, sortOrder: req.query.sortOrder,
    });
  }),
  getById: handle(async (req) => {
    return { data: await service.getById(req.params.id) };
  }),
  getActiveByTenant: handle(async (req) => {
    return { data: await service.getActiveByTenant(req.user.tenantId) };
  }),
  create: handle(async (req) => {
    return { data: await service.create({ ...req.body, tenant_id: req.user.tenantId }) };
  }),
  update: handle(async (req) => {
    return { data: await service.update(req.params.id, req.body) };
  }),
  delete: handle(async (req) => {
    await service.delete(req.params.id);
    return { message: 'Product deleted' };
  }),
};
