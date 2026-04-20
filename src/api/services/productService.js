const repo = require('../repositories/productRepository');
const inventoryRepo = require('../repositories/inventoryRepository');

module.exports = {
  async list(query) {
    return repo.findAll(query);
  },

  async getById(id) {
    const product = await repo.findById(id);
    if (!product) throw { status: 404, message: 'Product not found' };
    return product;
  },

  async getActiveByTenant(tenantId) {
    return repo.findActiveByTenant(tenantId);
  },

  async create(data) {
    const product = await repo.create(data);
    await inventoryRepo.create({ product_id: product.id, tenant_id: data.tenant_id, current_inventory: 0 });
    return product;
  },

  async update(id, data) {
    const product = await repo.update(id, data);
    if (!product) throw { status: 404, message: 'Product not found' };
    return product;
  },

  async delete(id) {
    await repo.delete(id);
  },
};
