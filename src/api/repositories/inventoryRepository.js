const pool = require('../config/db');

module.exports = {
  async findAll({ tenantId, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT i.*, p.name AS product_name, p.sku, p.cost_per_unit, p.reorder_threshold
       FROM inventory i JOIN products p ON i.product_id = p.id
       WHERE i.tenant_id = $1 ORDER BY p.name LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    const countRes = await pool.query(
      'SELECT COUNT(*) FROM inventory WHERE tenant_id = $1', [tenantId]
    );
    const belowRes = await pool.query(
      `SELECT COUNT(*) FROM inventory i JOIN products p ON i.product_id = p.id
       WHERE i.tenant_id = $1 AND i.current_inventory < p.reorder_threshold`, [tenantId]
    );
    return {
      data: rows,
      total: parseInt(countRes.rows[0].count),
      belowThreshold: parseInt(belowRes.rows[0].count),
    };
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT i.*, p.name AS product_name, p.sku, p.cost_per_unit, p.reorder_threshold, p.id AS product_id
       FROM inventory i JOIN products p ON i.product_id = p.id WHERE i.id = $1`, [id]
    );
    return rows[0];
  },

  async findByProductId(productId) {
    const { rows } = await pool.query('SELECT * FROM inventory WHERE product_id = $1', [productId]);
    return rows[0];
  },

  async create({ product_id, tenant_id, current_inventory }) {
    const { rows } = await pool.query(
      'INSERT INTO inventory (product_id, tenant_id, current_inventory) VALUES ($1, $2, $3) RETURNING *',
      [product_id, tenant_id, current_inventory]
    );
    return rows[0];
  },

  async updateStock(id, current_inventory) {
    const { rows } = await pool.query(
      'UPDATE inventory SET current_inventory = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [current_inventory, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM inventory WHERE id = $1', [id]);
  },
};
