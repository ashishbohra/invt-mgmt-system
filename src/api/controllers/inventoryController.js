const handle = require('../middleware/responseHandler');
const service = require('../services/inventoryService');

module.exports = {
  list: handle(async (req) => {
    return service.list({
      tenantId: req.user.tenantId, status: req.query.status, filter: req.query.filter,
      page: +req.query.page || 1, limit: +req.query.limit || 10,
    });
  }),
  getById: handle(async (req) => {
    return { data: await service.getById(req.params.id) };
  }),
  updateStock: handle(async (req) => {
    return { data: await service.updateStock(req.params.id, req.body.current_inventory, req.user.email) };
  }),
};
