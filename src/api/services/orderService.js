const repo = require('../repositories/orderRepository');
const inventoryRepo = require('../repositories/inventoryRepository');

module.exports = {
  async list(query) {
    return repo.findAll(query);
  },

  async getById(id) {
    const order = await repo.findById(id);
    if (!order) throw { status: 404, message: 'Order not found' };
    return order;
  },

  async create({ tenant_id, product_id, quantity }) {
    const inv = await inventoryRepo.findByProductId(product_id);
    const currentStock = inv ? inv.current_inventory : 0;
    const status = currentStock >= quantity ? 'Created' : 'Pending';
    return repo.create({ tenant_id, product_id, quantity, status });
  },

  async confirm(id) {
    const order = await repo.findById(id);
    if (!order) throw { status: 404, message: 'Order not found' };
    const inv = await inventoryRepo.findByProductId(order.product_id);
    if (!inv || inv.current_inventory < order.quantity) {
      throw { status: 400, message: 'Insufficient inventory to confirm order' };
    }
    await inventoryRepo.updateStock(inv.id, inv.current_inventory - order.quantity);
    return repo.update(id, { status: 'Confirmed' });
  },

  async cancel(id) {
    return repo.update(id, { status: 'Cancelled' });
  },

  async delete(id) {
    await repo.delete(id);
  },
};
