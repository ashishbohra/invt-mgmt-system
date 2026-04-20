const pool = require('../config/db');

module.exports = {
  async findAll({ tenantId, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT o.*, p.name AS product_name FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.tenant_id = $1 ORDER BY o.created_at DESC LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    const countRes = await pool.query('SELECT COUNT(*) FROM orders WHERE tenant_id = $1', [tenantId]);
    const pendingRes = await pool.query("SELECT COUNT(*) FROM orders WHERE tenant_id = $1 AND status = 'Pending'", [tenantId]);
    const createdRes = await pool.query("SELECT COUNT(*) FROM orders WHERE tenant_id = $1 AND status = 'Created'", [tenantId]);
    return {
      data: rows,
      total: parseInt(countRes.rows[0].count),
      totalPending: parseInt(pendingRes.rows[0].count),
      totalCreated: parseInt(createdRes.rows[0].count),
    };
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT o.*, p.name AS product_name, p.sku, p.cost_per_unit,
       i.current_inventory FROM orders o
       JOIN products p ON o.product_id = p.id
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE o.id = $1`, [id]
    );
    return rows[0];
  },

  async create({ tenant_id, product_id, quantity, status }) {
    const { rows } = await pool.query(
      'INSERT INTO orders (tenant_id, product_id, quantity, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [tenant_id, product_id, quantity, status]
    );
    return rows[0];
  },

  async update(id, { status }) {
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
  },
};
