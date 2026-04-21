const repo = require('../repositories/orderRepository');
const inventoryRepo = require('../repositories/inventoryRepository');
const productRepo = require('../repositories/productRepository');
const logger = require('../utils/logger');

module.exports = {
  async list(query) {
    return repo.findAll(query);
  },

  async getById(id) {
    const order = await repo.findById(id);
    if (!order) throw { status: 404, message: 'Order not found' };
    return order;
  },

  async create({ tenant_id, product_id, quantity, userEmail }) {
    if (!tenant_id || !product_id || !quantity) throw { status: 400, message: 'product_id and quantity are required' };
    if (quantity <= 0) throw { status: 400, message: 'Quantity must be greater than 0' };

    const product = await productRepo.findById(product_id);
    if (!product) throw { status: 404, message: 'Product not found' };
    if (product.status !== 'Active') throw { status: 400, message: 'Orders can only be placed for Active products' };
    if (product.tenant_id !== tenant_id) throw { status: 400, message: 'Product does not belong to this tenant' };

    const inv = await inventoryRepo.findByProductId(product_id);
    const currentStock = inv ? inv.current_inventory : 0;
    const status = currentStock >= quantity ? 'Created' : 'Pending';

    const order = await repo.create({ tenant_id, product_id, quantity, status, userEmail });
    logger.info('OrderService', `Order created id=${order.id}`, { status, quantity, createdBy: userEmail });
    return order;
  },

  async confirm(id, userEmail) {
    const order = await repo.findById(id);
    if (!order) throw { status: 404, message: 'Order not found' };
    if (order.status === 'Confirmed') throw { status: 400, message: 'Order is already confirmed' };
    if (order.status === 'Cancelled') throw { status: 400, message: 'Cannot confirm a cancelled order' };

    const inv = await inventoryRepo.findByProductId(order.product_id);
    if (!inv || inv.current_inventory < order.quantity) throw { status: 400, message: 'Insufficient inventory to confirm order' };

    await inventoryRepo.updateStock(inv.id, inv.current_inventory - order.quantity, userEmail);
    const updated = await repo.update(id, { status: 'Confirmed', userEmail });
    logger.info('OrderService', `Order confirmed id=${id}`, { confirmedBy: userEmail });
    return updated;
  },

  async cancel(id, userEmail) {
    const order = await repo.findById(id);
    if (!order) throw { status: 404, message: 'Order not found' };
    if (order.status === 'Confirmed') throw { status: 400, message: 'Cannot cancel a confirmed order' };
    if (order.status === 'Cancelled') throw { status: 400, message: 'Order is already cancelled' };

    const updated = await repo.update(id, { status: 'Cancelled', userEmail });
    logger.info('OrderService', `Order cancelled id=${id}`, { cancelledBy: userEmail });
    return updated;
  },

  async delete(id) {
    await repo.delete(id);
  },
};
