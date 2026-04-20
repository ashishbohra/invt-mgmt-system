const handle = require('../middleware/responseHandler');
const service = require('../services/userService');
const { ALL_ROLES, ALL_PORTALS } = require('../constants/enums');

module.exports = {
  list: handle(async (req) => {
    return service.list({ tenantId: req.user.tenantId, search: req.query.search, page: +req.query.page || 1, limit: +req.query.limit || 10 });
  }),
  getById: handle(async (req) => {
    return { data: await service.getById(req.params.id) };
  }),
  create: handle(async (req) => {
    return { data: await service.create(req.body) };
  }),
  update: handle(async (req) => {
    return { data: await service.update(req.params.id, req.body) };
  }),
  changePassword: handle(async (req) => {
    return service.changePassword(req.params.id, req.body);
  }),
  delete: handle(async (req) => {
    return service.delete(req.params.id);
  }),
  enums: handle(async () => {
    return { data: { roles: ALL_ROLES, portals: ALL_PORTALS } };
  }),
};
