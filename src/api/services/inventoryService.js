const repo = require('../repositories/inventoryRepository');
const logger = require('../utils/logger');

module.exports = {
  async list(query) {
    logger.debug('InventoryService', 'Listing inventory', { tenantId: query.tenantId });
    return repo.findAll(query);
  },

  async getById(id) {
    logger.debug('InventoryService', `Getting inventory id=${id}`);
    const inv = await repo.findById(id);
    if (!inv) throw { status: 404, message: 'Inventory record not found' };
    return inv;
  },

  async updateStock(id, current_inventory) {
    const inv = await repo.updateStock(id, current_inventory);
    if (!inv) throw { status: 404, message: 'Inventory record not found' };
    logger.info('InventoryService', `Stock updated id=${id}`, { newStock: current_inventory });
    return inv;
  },

  async delete(id) {
    logger.info('InventoryService', `Inventory deleted id=${id}`);
    await repo.delete(id);
  },
};
