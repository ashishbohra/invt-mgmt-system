const BaseRepository = require('./baseRepository');

class ProductRepository extends BaseRepository {
  static tableName = 'products';

  static schema = {
    id: 'SERIAL PRIMARY KEY',
    tenant_id: 'VARCHAR(20) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE',
    name: 'VARCHAR(255) NOT NULL',
    sku: 'VARCHAR(100) NOT NULL',
    category: 'VARCHAR(100) NOT NULL',
    is_active: 'BOOLEAN DEFAULT true',
    reorder_threshold: 'INTEGER NOT NULL DEFAULT 0',
    cost_per_unit: 'NUMERIC(10,2) NOT NULL DEFAULT 0',
    created_by: 'VARCHAR(255)',
    updated_by: 'VARCHAR(255)',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()',
  };

  static indexes = [
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_products_tenant_sku ON products(tenant_id, sku)',
    'CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id)',
    'CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active)',
  ];

  async findAll({ tenantId, search, status, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' }) {
    await this.ensureTable();
    const offset = (page - 1) * limit;
    const conditions = ['tenant_id = $1'];
    const params = [tenantId];
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR sku ILIKE $${params.length})`);
    }
    if (status === 'Active') conditions.push('is_active = true');
    else if (status === 'Inactive') conditions.push('is_active = false');

    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowed = ['name', 'sku', 'category', 'is_active', 'created_at'];
    const col = allowed.includes(sortBy) ? sortBy : 'created_at';
    const dir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    params.push(limit, offset);
    const { rows } = await this.pool.query(
      `SELECT * FROM products ${where} ORDER BY ${col} ${dir} LIMIT $${params.length - 1} OFFSET $${params.length}`, params
    );
    const countRes = await this.pool.query(`SELECT COUNT(*) FROM products ${where}`, params.slice(0, -2));
    const activeRes = await this.pool.query('SELECT COUNT(*) FROM products WHERE tenant_id = $1 AND is_active = true', [tenantId]);
    const inactiveRes = await this.pool.query('SELECT COUNT(*) FROM products WHERE tenant_id = $1 AND is_active = false', [tenantId]);
    return {
      data: rows,
      total: parseInt(countRes.rows[0].count),
      totalActive: parseInt(activeRes.rows[0].count),
      totalInactive: parseInt(inactiveRes.rows[0].count),
    };
  }

  async findById(id) {
    await this.ensureTable();
    const { rows } = await this.pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return rows[0];
  }

  async findActiveByTenant(tenantId) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      'SELECT * FROM products WHERE tenant_id = $1 AND is_active = true ORDER BY name', [tenantId]
    );
    return rows;
  }

  async create(data) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `INSERT INTO products (tenant_id, name, sku, category, reorder_threshold, cost_per_unit, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7) RETURNING *`,
      [data.tenant_id, data.name, data.sku, data.category, data.reorder_threshold, data.cost_per_unit, data.userEmail]
    );
    return rows[0];
  }

  async update(id, data) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `UPDATE products SET name = COALESCE($1, name), category = COALESCE($2, category),
       reorder_threshold = COALESCE($3, reorder_threshold), cost_per_unit = COALESCE($4, cost_per_unit),
       updated_by = COALESCE($5, updated_by), updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [data.name, data.category, data.reorder_threshold, data.cost_per_unit, data.userEmail, id]
    );
    return rows[0];
  }

  async delete(id, userEmail) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      "UPDATE products SET is_active = false, updated_by = COALESCE($2, updated_by), updated_at = NOW() WHERE id = $1 AND is_active = true RETURNING *",
      [id, userEmail]
    );
    return rows[0];
  }
}

module.exports = new ProductRepository();
