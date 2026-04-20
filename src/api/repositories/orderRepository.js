const BaseRepository = require('./baseRepository');

class OrderRepository extends BaseRepository {
  static tableName = 'orders';

  static schema = {
    id: 'SERIAL PRIMARY KEY',
    tenant_id: 'INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE',
    product_id: 'INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE',
    quantity: 'INTEGER NOT NULL',
    status: "VARCHAR(20) DEFAULT 'Created'",
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()',
  };

  static indexes = [
    'CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id)',
    'CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id)',
    'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
  ];

  async findAll({ tenantId, page = 1, limit = 10 }) {
    await this.ensureTable();
    const offset = (page - 1) * limit;
    const { rows } = await this.pool.query(
      `SELECT o.*, p.name AS product_name FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.tenant_id = $1 ORDER BY o.created_at DESC LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    const countRes = await this.pool.query('SELECT COUNT(*) FROM orders WHERE tenant_id = $1', [tenantId]);
    const pendingRes = await this.pool.query("SELECT COUNT(*) FROM orders WHERE tenant_id = $1 AND status = 'Pending'", [tenantId]);
    const createdRes = await this.pool.query("SELECT COUNT(*) FROM orders WHERE tenant_id = $1 AND status = 'Created'", [tenantId]);
    return {
      data: rows,
      total: parseInt(countRes.rows[0].count),
      totalPending: parseInt(pendingRes.rows[0].count),
      totalCreated: parseInt(createdRes.rows[0].count),
    };
  }

  async findById(id) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `SELECT o.*, p.name AS product_name, p.sku, p.cost_per_unit,
       i.current_inventory FROM orders o
       JOIN products p ON o.product_id = p.id
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE o.id = $1`, [id]
    );
    return rows[0];
  }

  async create({ tenant_id, product_id, quantity, status }) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      'INSERT INTO orders (tenant_id, product_id, quantity, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [tenant_id, product_id, quantity, status]
    );
    return rows[0];
  }

  async update(id, { status }) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0];
  }

  async delete(id) {
    await this.ensureTable();
    await this.pool.query('DELETE FROM orders WHERE id = $1', [id]);
  }
}

module.exports = new OrderRepository();
