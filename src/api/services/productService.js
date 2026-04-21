const repo = require('../repositories/productRepository');
const inventoryRepo = require('../repositories/inventoryRepository');
const logger = require('../utils/logger');

module.exports = {
  async list(query) {
    logger.debug('ProductService', 'Listing products', { tenantId: query.tenantId });
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
    await inventoryRepo.create({ product_id: product.id, tenant_id: data.tenant_id, current_inventory: 0, userEmail: data.userEmail });
    logger.info('ProductService', `Product created id=${product.id}`, { sku: data.sku, tenantId: data.tenant_id, createdBy: data.userEmail });
    return product;
  },

  async update(id, data) {
    const product = await repo.update(id, data);
    if (!product) throw { status: 404, message: 'Product not found' };
    logger.info('ProductService', `Product updated id=${id}`, { updatedBy: data.userEmail });
    return product;
  },

  async delete(id, userEmail) {
    const product = await repo.findById(id);
    if (!product || !product.is_active) throw { status: 404, message: 'Product not found' };
    await inventoryRepo.deactivateByProductId(id, userEmail);
    const deleted = await repo.delete(id, userEmail);
    logger.info('ProductService', `Product soft-deleted id=${id} (inventory deactivated)`, { deletedBy: userEmail });
    return deleted;
  },
};
