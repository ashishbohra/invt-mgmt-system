const handle = require('../middleware/responseHandler');
const service = require('../services/productService');
const { ALL_CATEGORIES } = require('../constants/enums');

module.exports = {
  categories: handle(async () => {
    return { data: ALL_CATEGORIES };
  }),
  list: handle(async (req) => {
    return service.list({
      tenantId: req.user.tenantId, search: req.query.search, status: req.query.status,
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
    return { data: await service.create({ ...req.body, tenant_id: req.user.tenantId, userEmail: req.user.email }) };
  }),
  update: handle(async (req) => {
    return { data: await service.update(req.params.id, { ...req.body, userEmail: req.user.email }) };
  }),
  delete: handle(async (req) => {
    await service.delete(req.params.id, req.user.email);
    return { message: 'Product deleted' };
  }),
};
