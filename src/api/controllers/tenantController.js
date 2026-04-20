const service = require('../services/tenantService');

const handle = (fn) => async (req, res) => {
  try { res.json(await fn(req)); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
};

module.exports = {
  list: handle((req) => service.list({ search: req.query.search, page: +req.query.page || 1, limit: +req.query.limit || 10 })),
  getById: handle((req) => service.getById(req.params.id)),
  create: handle((req) => service.create(req.body)),
  update: handle((req) => service.update(req.params.id, req.body)),
  delete: handle(async (req) => { await service.delete(req.params.id); return { message: 'Deleted' }; }),
};
