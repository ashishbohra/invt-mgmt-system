const repo = require('../repositories/productRepository');
const inventoryRepo = require('../repositories/inventoryRepository');
const logger = require('../utils/logger');

module.exports = {
  async list(query) {
    logger.debug('ProductService', 'Listing products', { tenantId: query.tenantId });
    return repo.findAll(query);
  },

  async getById(id) {
    logger.debug('ProductService', `Getting product id=${id}`);
    const product = await repo.findById(id);
    if (!product) throw { status: 404, message: 'Product not found' };
    return product;
  },

  async getActiveByTenant(tenantId) {
    logger.debug('ProductService', `Getting active products for tenantId=${tenantId}`);
    return repo.findActiveByTenant(tenantId);
  },

  async create(data) {
    const product = await repo.create(data);
    await inventoryRepo.create({ product_id: product.id, tenant_id: data.tenant_id, current_inventory: 0 });
    logger.info('ProductService', `Product created id=${product.id}`, { sku: data.sku, tenantId: data.tenant_id });
    return product;
  },

  async update(id, data) {
    const product = await repo.update(id, data);
    if (!product) throw { status: 404, message: 'Product not found' };
    logger.info('ProductService', `Product updated id=${id}`, { fields: Object.keys(data) });
    return product;
  },

  async delete(id) {
    logger.info('ProductService', `Product deleted id=${id} (cascade to inventory)`);
    await repo.delete(id);
  },
};
