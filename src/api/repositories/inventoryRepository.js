const BaseRepository = require('./baseRepository');

class InventoryRepository extends BaseRepository {
  static tableName = 'inventory';

  static schema = {
    id: 'SERIAL PRIMARY KEY',
    product_id: 'INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE',
    tenant_id: 'INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE',
    current_inventory: 'INTEGER NOT NULL DEFAULT 0',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()',
  };

  static indexes = [
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id)',
    'CREATE INDEX IF NOT EXISTS idx_inventory_tenant_id ON inventory(tenant_id)',
  ];

  async findAll({ tenantId, page = 1, limit = 10 }) {
    await this.ensureTable();
    const offset = (page - 1) * limit;
    const { rows } = await this.pool.query(
      `SELECT i.*, p.name AS product_name, p.sku, p.cost_per_unit, p.reorder_threshold
       FROM inventory i JOIN products p ON i.product_id = p.id
       WHERE i.tenant_id = $1 ORDER BY p.name LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM inventory WHERE tenant_id = $1', [tenantId]
    );
    const belowRes = await this.pool.query(
      `SELECT COUNT(*) FROM inventory i JOIN products p ON i.product_id = p.id
       WHERE i.tenant_id = $1 AND i.current_inventory < p.reorder_threshold`, [tenantId]
    );
    return {
      data: rows,
      total: parseInt(countRes.rows[0].count),
      belowThreshold: parseInt(belowRes.rows[0].count),
    };
  }

  async findById(id) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `SELECT i.*, p.name AS product_name, p.sku, p.cost_per_unit, p.reorder_threshold, p.id AS product_id
       FROM inventory i JOIN products p ON i.product_id = p.id WHERE i.id = $1`, [id]
    );
    return rows[0];
  }

  async findByProductId(productId) {
    await this.ensureTable();
    const { rows } = await this.pool.query('SELECT * FROM inventory WHERE product_id = $1', [productId]);
    return rows[0];
  }

  async create({ product_id, tenant_id, current_inventory }) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      'INSERT INTO inventory (product_id, tenant_id, current_inventory) VALUES ($1, $2, $3) RETURNING *',
      [product_id, tenant_id, current_inventory]
    );
    return rows[0];
  }

  async updateStock(id, current_inventory) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      'UPDATE inventory SET current_inventory = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [current_inventory, id]
    );
    return rows[0];
  }

  async delete(id) {
    await this.ensureTable();
    await this.pool.query('DELETE FROM inventory WHERE id = $1', [id]);
  }
}

module.exports = new InventoryRepository();
