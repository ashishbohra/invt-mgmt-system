const service = require('../services/inventoryService');

const handle = (fn) => async (req, res) => {
  try { res.json(await fn(req)); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
};

module.exports = {
  list: handle((req) => service.list({ tenantId: req.query.tenantId, page: +req.query.page || 1, limit: +req.query.limit || 10 })),
  getById: handle((req) => service.getById(req.params.id)),
  updateStock: handle((req) => service.updateStock(req.params.id, req.body.current_inventory)),
  delete: handle(async (req) => { await service.delete(req.params.id); return { message: 'Deleted' }; }),
};
