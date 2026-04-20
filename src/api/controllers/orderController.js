const service = require('../services/orderService');

const handle = (fn) => async (req, res) => {
  try { res.json(await fn(req)); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
};

module.exports = {
  list: handle((req) => service.list({ tenantId: req.query.tenantId, page: +req.query.page || 1, limit: +req.query.limit || 10 })),
  getById: handle((req) => service.getById(req.params.id)),
  create: handle((req) => service.create(req.body)),
  confirm: handle((req) => service.confirm(req.params.id)),
  cancel: handle((req) => service.cancel(req.params.id)),
  delete: handle(async (req) => { await service.delete(req.params.id); return { message: 'Deleted' }; }),
};
