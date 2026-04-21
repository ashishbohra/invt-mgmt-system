const handle = require('../middleware/responseHandler');
const service = require('../services/userService');
const tenantRepo = require('../repositories/tenantRepository');
const { ALL_ROLES, ALL_PORTALS, PORTALS } = require('../constants/enums');

module.exports = {
  list: handle(async (req) => {
    return service.list({ tenantId: req.user.tenantId, search: req.query.search, page: +req.query.page || 1, limit: +req.query.limit || 10 });
  }),
  getById: handle(async (req) => {
    return { data: await service.getById(req.params.id) };
  }),
  create: handle(async (req) => {
    const body = { ...req.body };
    const tenantName = body.tenant_name;
    delete body.tenant_id;
    delete body.tenant_name;
    if (body.portals?.includes(PORTALS.USER)) {
      if (!tenantName) throw { status: 400, message: 'Tenant is required for UserPortal users' };
      const tenant = await tenantRepo.findByName(tenantName);
      if (!tenant) throw { status: 404, message: 'Tenant not found' };
      body.tenant_id = tenant.tenant_id;
    } else {
      body.tenant_id = null;
    }
    return { data: await service.create(body) };
  }),
  update: handle(async (req) => {
    const body = { ...req.body };
    if ('tenant_name' in body) {
      if (body.tenant_name) {
        const tenant = await tenantRepo.findByName(body.tenant_name);
        if (!tenant) throw { status: 404, message: 'Tenant not found' };
        body.tenant_id = tenant.tenant_id;
      } else {
        body.tenant_id = null;
      }
      delete body.tenant_name;
    }
    return { data: await service.update(req.params.id, body) };
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
