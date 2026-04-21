const BaseRepository = require('./baseRepository');

class OrderRepository extends BaseRepository {
  static tableName = 'orders';

  static schema = {
    id: 'SERIAL PRIMARY KEY',
    tenant_id: 'VARCHAR(20) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE',
    product_id: 'INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE',
    quantity: 'INTEGER NOT NULL',
    status: "VARCHAR(20) DEFAULT 'Created'",
    is_active: 'BOOLEAN DEFAULT true',
    approved_by: 'VARCHAR(255)',
    approved_at: 'TIMESTAMP',
    cancelled_by: 'VARCHAR(255)',
    cancelled_at: 'TIMESTAMP',
    cancel_reason: 'TEXT',
    created_by: 'VARCHAR(255)',
    updated_by: 'VARCHAR(255)',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()',
  };

  static indexes = [
    'CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id)',
    'CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id)',
    'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
  ];

  async findAll({ tenantId, status, activeFilter, page = 1, limit = 10 }) {
    await this.ensureTable();
    const offset = (page - 1) * limit;
    const conditions = ['o.tenant_id = $1'];
    const params = [tenantId];

    if (activeFilter === 'Active') conditions.push('o.is_active = true');
    else if (activeFilter === 'Inactive') conditions.push('o.is_active = false');

    if (status) {
      params.push(status);
      conditions.push(`o.status = $${params.length}`);
    }
    const where = `WHERE ${conditions.join(' AND ')}`;
    const { rows } = await this.pool.query(
      `SELECT o.*, p.name AS product_name FROM orders o
       JOIN products p ON o.product_id = p.id
       ${where} ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    const countRes = await this.pool.query(`SELECT COUNT(*) FROM orders o ${where}`, params);
    const base = 'SELECT COUNT(*) FROM orders WHERE tenant_id = $1';
    const activeRes = await this.pool.query(`${base} AND is_active = true`, [tenantId]);
    const inactiveRes = await this.pool.query(`${base} AND is_active = false`, [tenantId]);
    const pendingRes = await this.pool.query(`${base} AND is_active = true AND status = 'Pending'`, [tenantId]);
    const createdRes = await this.pool.query(`${base} AND is_active = true AND status = 'Created'`, [tenantId]);
    const confirmedRes = await this.pool.query(`${base} AND is_active = true AND status = 'Confirmed'`, [tenantId]);
    const cancelledRes = await this.pool.query(`${base} AND is_active = true AND status = 'Cancelled'`, [tenantId]);
    return {
      data: rows,
      total: parseInt(countRes.rows[0].count),
      totalActive: parseInt(activeRes.rows[0].count),
      totalInactive: parseInt(inactiveRes.rows[0].count),
      totalPending: parseInt(pendingRes.rows[0].count),
      totalCreated: parseInt(createdRes.rows[0].count),
      totalConfirmed: parseInt(confirmedRes.rows[0].count),
      totalCancelled: parseInt(cancelledRes.rows[0].count),
    };
  }

  async findById(id) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `SELECT o.*, p.name AS product_name, p.sku, p.cost_per_unit, p.id AS product_id, i.current_inventory
       FROM orders o
       JOIN products p ON o.product_id = p.id
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE o.id = $1`, [id]
    );
    return rows[0];
  }

  async create({ tenant_id, product_id, quantity, status, userEmail }) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      'INSERT INTO orders (tenant_id, product_id, quantity, status, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $5) RETURNING *',
      [tenant_id, product_id, quantity, status, userEmail]
    );
    return rows[0];
  }

  async confirm(id, userEmail) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `UPDATE orders SET status = 'Confirmed', approved_by = $2, approved_at = NOW(), updated_by = $2, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, userEmail]
    );
    return rows[0];
  }

  async cancel(id, { userEmail, reason }) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `UPDATE orders SET status = 'Cancelled', cancelled_by = $2, cancelled_at = NOW(), cancel_reason = $3, updated_by = $2, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, userEmail, reason]
    );
    return rows[0];
  }

  async delete(id, userEmail) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      "UPDATE orders SET is_active = false, updated_by = COALESCE($2, updated_by), updated_at = NOW() WHERE id = $1 AND is_active = true RETURNING *",
      [id, userEmail]
    );
    return rows[0];
  }
}

module.exports = new OrderRepository();
