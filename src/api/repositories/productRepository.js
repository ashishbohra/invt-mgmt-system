const BaseRepository = require('./baseRepository');

class ProductRepository extends BaseRepository {
  static tableName = 'products';

  static schema = {
    id: 'SERIAL PRIMARY KEY',
    tenant_id: 'INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE',
    name: 'VARCHAR(255) NOT NULL',
    sku: 'VARCHAR(100) NOT NULL',
    category: 'VARCHAR(100) NOT NULL',
    status: "VARCHAR(20) DEFAULT 'Active'",
    reorder_threshold: 'INTEGER NOT NULL DEFAULT 0',
    cost_per_unit: 'NUMERIC(10,2) NOT NULL DEFAULT 0',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()',
  };

  static indexes = [
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_products_tenant_sku ON products(tenant_id, sku)',
    'CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id)',
    'CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)',
  ];

  async findAll({ tenantId, search, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' }) {
    await this.ensureTable();
    const offset = (page - 1) * limit;
    const conditions = ['p.tenant_id = $1'];
    const params = [tenantId];
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`);
    }
    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowed = ['name', 'sku', 'category', 'status', 'created_at'];
    const col = allowed.includes(sortBy) ? sortBy : 'created_at';
    const dir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    params.push(limit, offset);
    const { rows } = await this.pool.query(
      `SELECT p.* FROM products p ${where} ORDER BY p.${col} ${dir} LIMIT $${params.length - 1} OFFSET $${params.length}`, params
    );
    const countRes = await this.pool.query(
      `SELECT COUNT(*) FROM products p ${where}`, params.slice(0, -2)
    );
    return { data: rows, total: parseInt(countRes.rows[0].count) };
  }

  async findById(id) {
    await this.ensureTable();
    const { rows } = await this.pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return rows[0];
  }

  async findActiveByTenant(tenantId) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      "SELECT * FROM products WHERE tenant_id = $1 AND status = 'Active' ORDER BY name", [tenantId]
    );
    return rows;
  }

  async create(data) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `INSERT INTO products (tenant_id, name, sku, category, reorder_threshold, cost_per_unit)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.tenant_id, data.name, data.sku, data.category, data.reorder_threshold, data.cost_per_unit]
    );
    return rows[0];
  }

  async update(id, data) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `UPDATE products SET name = COALESCE($1, name), category = COALESCE($2, category),
       reorder_threshold = COALESCE($3, reorder_threshold), cost_per_unit = COALESCE($4, cost_per_unit),
       status = COALESCE($5, status), updated_at = NOW() WHERE id = $6 RETURNING *`,
      [data.name, data.category, data.reorder_threshold, data.cost_per_unit, data.status, id]
    );
    return rows[0];
  }

  async delete(id) {
    await this.ensureTable();
    await this.pool.query('DELETE FROM products WHERE id = $1', [id]);
  }
}

module.exports = new ProductRepository();
