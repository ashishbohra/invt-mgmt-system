const repo = require('../repositories/orderRepository');
const inventoryRepo = require('../repositories/inventoryRepository');
const productRepo = require('../repositories/productRepository');
const { ROLES } = require('../constants/enums');
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
    if (!product_id || !quantity) throw { status: 400, message: 'product_id and quantity are required' };
    if (quantity <= 0) throw { status: 400, message: 'Quantity must be greater than 0' };

    const product = await productRepo.findById(product_id);
    if (!product) throw { status: 404, message: 'Product not found' };
    if (!product.is_active) throw { status: 400, message: 'Orders can only be placed for Active products' };
    if (product.tenant_id !== tenant_id) throw { status: 400, message: 'Product does not belong to this tenant' };

    const inv = await inventoryRepo.findByProductId(product_id);
    const currentStock = inv ? inv.current_inventory : 0;
    if (currentStock < quantity) {
      throw { status: 400, message: `Insufficient inventory. Available: ${currentStock}, Requested: ${quantity}` };
    }

    const order = await repo.create({ tenant_id, product_id, quantity, status: 'Created', userEmail });
    logger.info('OrderService', `Order created id=${order.id}`, { quantity, createdBy: userEmail });
    return order;
  },

  async confirm(id, { userEmail, roles }) {
    if (!roles || !roles.includes(ROLES.MANAGER)) {
      throw { status: 403, message: 'Only Manager can approve orders' };
    }

    const order = await repo.findById(id);
    if (!order) throw { status: 404, message: 'Order not found' };
    if (order.status === 'Confirmed') throw { status: 400, message: 'Order is already confirmed' };
    if (order.status === 'Cancelled') throw { status: 400, message: 'Cannot confirm a cancelled order' };

    const inv = await inventoryRepo.findByProductId(order.product_id);
    if (!inv || inv.current_inventory < order.quantity) throw { status: 400, message: 'Insufficient inventory to confirm order' };

    await inventoryRepo.updateStock(inv.id, inv.current_inventory - order.quantity, userEmail);
    const updated = await repo.confirm(id, userEmail);
    logger.info('OrderService', `Order confirmed id=${id}`, { approvedBy: userEmail });
    return updated;
  },

  async cancel(id, { userEmail, roles, reason }) {
    if (!roles || !roles.includes(ROLES.MANAGER)) {
      throw { status: 403, message: 'Only Manager can cancel orders' };
    }
    if (!reason || !reason.trim()) {
      throw { status: 400, message: 'Cancel reason is required' };
    }

    const order = await repo.findById(id);
    if (!order) throw { status: 404, message: 'Order not found' };
    if (order.status === 'Confirmed') throw { status: 400, message: 'Cannot cancel a confirmed order' };
    if (order.status === 'Cancelled') throw { status: 400, message: 'Order is already cancelled' };

    const updated = await repo.cancel(id, { userEmail, reason: reason.trim() });
    logger.info('OrderService', `Order cancelled id=${id}`, { cancelledBy: userEmail, reason });
    return updated;
  },

  async delete(id, userEmail) {
    const order = await repo.delete(id, userEmail);
    if (!order) throw { status: 404, message: 'Order not found' };
    logger.info('OrderService', `Order soft-deleted id=${id}`, { deletedBy: userEmail });
  },
};
