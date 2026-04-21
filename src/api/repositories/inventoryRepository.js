const BaseRepository = require('./baseRepository');

class InventoryRepository extends BaseRepository {
  static tableName = 'inventory';

  static schema = {
    id: 'SERIAL PRIMARY KEY',
    product_id: 'INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE',
    tenant_id: 'VARCHAR(20) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE',
    current_inventory: 'INTEGER NOT NULL DEFAULT 0',
    is_active: 'BOOLEAN DEFAULT true',
    created_by: 'VARCHAR(255)',
    updated_by: 'VARCHAR(255)',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()',
  };

  static indexes = [
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id)',
    'CREATE INDEX IF NOT EXISTS idx_inventory_tenant_id ON inventory(tenant_id)',
  ];

  async findAll({ tenantId, status, filter, page = 1, limit = 10 }) {
    await this.ensureTable();
    const offset = (page - 1) * limit;
    const conditions = ['i.tenant_id = $1'];
    const params = [tenantId];

    if (status === 'Active') conditions.push('i.is_active = true AND p.is_active = true');
    else if (status === 'Inactive') conditions.push('(i.is_active = false OR p.is_active = false)');
    else conditions.push('p.is_active = true AND i.is_active = true');

    if (filter === 'below') conditions.push('i.current_inventory < p.reorder_threshold');

    const where = `WHERE ${conditions.join(' AND ')}`;

    const { rows } = await this.pool.query(
      `SELECT i.*, p.name AS product_name, p.sku, p.cost_per_unit, p.reorder_threshold, p.is_active AS product_active
       FROM inventory i JOIN products p ON i.product_id = p.id
       ${where} ORDER BY p.name LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    const countRes = await this.pool.query(
      `SELECT COUNT(*) FROM inventory i JOIN products p ON i.product_id = p.id ${where}`, [tenantId]
    );
    const activeRes = await this.pool.query(
      'SELECT COUNT(*) FROM inventory i JOIN products p ON i.product_id = p.id WHERE i.tenant_id = $1 AND i.is_active = true AND p.is_active = true', [tenantId]
    );
    const inactiveRes = await this.pool.query(
      'SELECT COUNT(*) FROM inventory i JOIN products p ON i.product_id = p.id WHERE i.tenant_id = $1 AND (i.is_active = false OR p.is_active = false)', [tenantId]
    );
    const belowRes = await this.pool.query(
      `SELECT COUNT(*) FROM inventory i JOIN products p ON i.product_id = p.id
       WHERE i.tenant_id = $1 AND i.is_active = true AND p.is_active = true AND i.current_inventory < p.reorder_threshold`, [tenantId]
    );
    return {
      data: rows,
      total: parseInt(countRes.rows[0].count),
      totalActive: parseInt(activeRes.rows[0].count),
      totalInactive: parseInt(inactiveRes.rows[0].count),
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
    const { rows } = await this.pool.query('SELECT * FROM inventory WHERE product_id = $1 AND is_active = true', [productId]);
    return rows[0];
  }

  async create({ product_id, tenant_id, current_inventory, userEmail }) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      'INSERT INTO inventory (product_id, tenant_id, current_inventory, created_by, updated_by) VALUES ($1, $2, $3, $4, $4) RETURNING *',
      [product_id, tenant_id, current_inventory, userEmail]
    );
    return rows[0];
  }

  async updateStock(id, current_inventory, userEmail) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      'UPDATE inventory SET current_inventory = $1, updated_by = COALESCE($3, updated_by), updated_at = NOW() WHERE id = $2 AND is_active = true RETURNING *',
      [current_inventory, id, userEmail]
    );
    return rows[0];
  }

  async deactivateByProductId(productId, userEmail) {
    await this.ensureTable();
    await this.pool.query(
      "UPDATE inventory SET is_active = false, updated_by = COALESCE($2, updated_by), updated_at = NOW() WHERE product_id = $1 AND is_active = true",
      [productId, userEmail]
    );
  }
}

module.exports = new InventoryRepository();
