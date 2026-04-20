const repo = require('../repositories/tenantRepository');
const logger = require('../utils/logger');

module.exports = {
  async list(query) {
    logger.debug('TenantService', 'Listing tenants', query);
    return repo.findAll(query);
  },

  async getById(id) {
    logger.debug('TenantService', `Getting tenant id=${id}`);
    const tenant = await repo.findById(id);
    if (!tenant) throw { status: 404, message: 'Tenant not found' };
    return tenant;
  },

  async create({ name, domains }) {
    const existing = await repo.findByName(name);
    if (existing) {
      logger.warn('TenantService', `Duplicate tenant name: ${name}`);
      throw { status: 409, message: 'Tenant name already exists' };
    }
    const tenant = await repo.create({ name, domains });
    logger.info('TenantService', `Tenant created id=${tenant.id}`, { name, domains });
    return tenant;
  },

  async update(id, data) {
    if (data.name) {
      const existing = await repo.findByName(data.name);
      if (existing && existing.id !== parseInt(id)) throw { status: 409, message: 'Tenant name already exists' };
    }
    const tenant = await repo.update(id, data);
    if (!tenant) throw { status: 404, message: 'Tenant not found' };
    logger.info('TenantService', `Tenant updated id=${id}`, { fields: Object.keys(data) });
    return tenant;
  },

  async delete(id) {
    const tenant = await repo.delete(id);
    if (!tenant) throw { status: 404, message: 'Tenant not found' };
    logger.info('TenantService', `Tenant soft-deleted id=${id} (set Inactive)`);
    return { message: 'Tenant deactivated' };
  },
};
