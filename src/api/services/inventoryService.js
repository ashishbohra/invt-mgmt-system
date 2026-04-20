const repo = require('../repositories/inventoryRepository');

module.exports = {
  async list(query) {
    return repo.findAll(query);
  },

  async getById(id) {
    const inv = await repo.findById(id);
    if (!inv) throw { status: 404, message: 'Inventory record not found' };
    return inv;
  },

  async updateStock(id, current_inventory) {
    const inv = await repo.updateStock(id, current_inventory);
    if (!inv) throw { status: 404, message: 'Inventory record not found' };
    return inv;
  },

  async delete(id) {
    await repo.delete(id);
  },
};
