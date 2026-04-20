const service = require('../services/productService');

const handle = (fn) => async (req, res) => {
  try { res.json(await fn(req)); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
};

module.exports = {
  list: handle((req) => service.list({
    tenantId: req.query.tenantId, search: req.query.search,
    page: +req.query.page || 1, limit: +req.query.limit || 10,
    sortBy: req.query.sortBy, sortOrder: req.query.sortOrder,
  })),
  getById: handle((req) => service.getById(req.params.id)),
  getActiveByTenant: handle((req) => service.getActiveByTenant(req.params.tenantId)),
  create: handle((req) => service.create(req.body)),
  update: handle((req) => service.update(req.params.id, req.body)),
  delete: handle(async (req) => { await service.delete(req.params.id); return { message: 'Deleted' }; }),
};
