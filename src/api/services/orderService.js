const repo = require('../repositories/orderRepository');
const inventoryRepo = require('../repositories/inventoryRepository');
const productRepo = require('../repositories/productRepository');
const logger = require('../utils/logger');

module.exports = {
  async list(query) {
    logger.debug('OrderService', 'Listing orders', { tenantId: query.tenantId });
    return repo.findAll(query);
  },

  async getById(id) {
    logger.debug('OrderService', `Getting order id=${id}`);
    const order = await repo.findById(id);
    if (!order) throw { status: 404, message: 'Order not found' };
    return order;
  },

  async create({ tenant_id, product_id, quantity }) {
    if (!tenant_id || !product_id || !quantity) {
      throw { status: 400, message: 'tenant_id, product_id, and quantity are required' };
    }
    if (quantity <= 0) throw { status: 400, message: 'Quantity must be greater than 0' };

    const product = await productRepo.findById(product_id);
    if (!product) throw { status: 404, message: 'Product not found' };
    if (product.status !== 'Active') {
      logger.warn('OrderService', `Order rejected — product inactive`, { productId: product_id });
      throw { status: 400, message: 'Orders can only be placed for Active products' };
    }
    if (product.tenant_id !== tenant_id) {
      logger.warn('OrderService', `Order rejected — tenant mismatch`, { productTenant: product.tenant_id, requestTenant: tenant_id });
      throw { status: 400, message: 'Product does not belong to this tenant' };
    }

    const inv = await inventoryRepo.findByProductId(product_id);
    const currentStock = inv ? inv.current_inventory : 0;
    const status = currentStock >= quantity ? 'Created' : 'Pending';

    const order = await repo.create({ tenant_id, product_id, quantity, status });
    logger.info('OrderService', `Order created id=${order.id}`, { status, quantity, currentStock, productId: product_id });
    return order;
  },

  async confirm(id) {
    const order = await repo.findById(id);
    if (!order) throw { status: 404, message: 'Order not found' };
    if (order.status === 'Confirmed') throw { status: 400, message: 'Order is already confirmed' };
    if (order.status === 'Cancelled') throw { status: 400, message: 'Cannot confirm a cancelled order' };

    const inv = await inventoryRepo.findByProductId(order.product_id);
    if (!inv || inv.current_inventory < order.quantity) {
      logger.warn('OrderService', `Confirm rejected — insufficient stock`, { orderId: id, required: order.quantity, available: inv?.current_inventory });
      throw { status: 400, message: 'Insufficient inventory to confirm order' };
    }

    const newStock = inv.current_inventory - order.quantity;
    await inventoryRepo.updateStock(inv.id, newStock);
    const updated = await repo.update(id, { status: 'Confirmed' });
    logger.info('OrderService', `Order confirmed id=${id}`, { deducted: order.quantity, newStock });
    return updated;
  },

  async cancel(id) {
    const order = await repo.findById(id);
    if (!order) throw { status: 404, message: 'Order not found' };
    if (order.status === 'Confirmed') throw { status: 400, message: 'Cannot cancel a confirmed order' };
    if (order.status === 'Cancelled') throw { status: 400, message: 'Order is already cancelled' };

    const updated = await repo.update(id, { status: 'Cancelled' });
    logger.info('OrderService', `Order cancelled id=${id}`);
    return updated;
  },

  async delete(id) {
    logger.info('OrderService', `Order deleted id=${id}`);
    await repo.delete(id);
  },
};
