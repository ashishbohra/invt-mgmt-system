const repo = require('../repositories/tenantRepository');

module.exports = {
  async list(query) {
    return repo.findAll(query);
  },

  async getById(id) {
    const tenant = await repo.findById(id);
    if (!tenant) throw { status: 404, message: 'Tenant not found' };
    return tenant;
  },

  async create({ name }) {
    const existing = await repo.findByName(name);
    if (existing) throw { status: 409, message: 'Tenant name already exists' };
    return repo.create({ name });
  },

  async update(id, data) {
    if (data.name) {
      const existing = await repo.findByName(data.name);
      if (existing && existing.id !== parseInt(id)) throw { status: 409, message: 'Tenant name already exists' };
    }
    const tenant = await repo.update(id, data);
    if (!tenant) throw { status: 404, message: 'Tenant not found' };
    return tenant;
  },

  async delete(id) {
    await repo.delete(id);
  },
};
