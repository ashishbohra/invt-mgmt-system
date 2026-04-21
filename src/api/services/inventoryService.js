const repo = require('../repositories/inventoryRepository');
const logger = require('../utils/logger');

module.exports = {
  async list(query) {
    return repo.findAll(query);
  },

  async getById(id) {
    const inv = await repo.findById(id);
    if (!inv) throw { status: 404, message: 'Inventory record not found' };
    return inv;
  },

  async getByProductId(productId) {
    const inv = await repo.findByProductId(productId);
    return inv || { current_inventory: 0 };
  },

  async updateStock(id, current_inventory, userEmail) {
    const inv = await repo.updateStock(id, current_inventory, userEmail);
    if (!inv) throw { status: 404, message: 'Inventory record not found' };
    logger.info('InventoryService', `Stock updated id=${id}`, { newStock: current_inventory, updatedBy: userEmail });
    return inv;
  },
};
