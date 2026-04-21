const BaseRepository = require('./baseRepository');

class TenantRepository extends BaseRepository {
  static tableName = 'tenants';

  static schema = {
    id: 'SERIAL PRIMARY KEY',
    tenant_id: 'VARCHAR(20) UNIQUE',
    name: 'VARCHAR(255) NOT NULL',
    domains: "JSONB DEFAULT '[]'::jsonb",
    status: "VARCHAR(20) DEFAULT 'Active'",
    created_by: 'VARCHAR(255)',
    updated_by: 'VARCHAR(255)',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()',
  };

  static indexes = [
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_name ON tenants(LOWER(name))',
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_tenant_id ON tenants(tenant_id)',
  ];

  static generateTenantId(name, id) {
    const prefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X');
    return `TEN-${prefix}-${id}`;
  }

  async findAll({ search, status, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' }) {
    await this.ensureTable();
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR tenant_id ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowed = ['name', 'status', 'created_at'];
    const col = allowed.includes(sortBy) ? sortBy : 'created_at';
    const dir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    params.push(limit, offset);
    const { rows } = await this.pool.query(
      `SELECT * FROM tenants ${where} ORDER BY ${col} ${dir} LIMIT $${params.length - 1} OFFSET $${params.length}`, params
    );
    const countRes = await this.pool.query(
      `SELECT COUNT(*) FROM tenants ${where}`, params.slice(0, -2)
    );
    const activeRes = await this.pool.query("SELECT COUNT(*) FROM tenants WHERE status = 'Active'");
    const inactiveRes = await this.pool.query("SELECT COUNT(*) FROM tenants WHERE status = 'Inactive'");
    return {
      data: rows,
      total: parseInt(countRes.rows[0].count),
      totalActive: parseInt(activeRes.rows[0].count),
      totalInactive: parseInt(inactiveRes.rows[0].count),
    };
  }

  async findById(id) {
    await this.ensureTable();
    const { rows } = await this.pool.query('SELECT * FROM tenants WHERE id = $1', [id]);
    return rows[0];
  }

  async findByName(name) {
    await this.ensureTable();
    const { rows } = await this.pool.query('SELECT * FROM tenants WHERE LOWER(name) = LOWER($1)', [name]);
    return rows[0];
  }

  async findByTenantId(tenantId) {
    await this.ensureTable();
    const { rows } = await this.pool.query('SELECT * FROM tenants WHERE tenant_id = $1', [tenantId]);
    return rows[0];
  }

  async findByDomain(origin) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `SELECT * FROM tenants WHERE domains @> to_jsonb($1::text)`,
      [origin]
    );
    if (rows[0]) return rows[0];
    // Also try matching just host:port from origin
    try {
      const url = new URL(origin);
      const host = url.host;
      const { rows: r2 } = await this.pool.query(
        `SELECT * FROM tenants WHERE domains @> to_jsonb($1::text)`,
        [host]
      );
      return r2[0];
    } catch {
      return null;
    }
  }

  async create({ name, domains, userEmail }) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      'INSERT INTO tenants (name, domains, created_by, updated_by) VALUES ($1, $2, $3, $3) RETURNING *',
      [name.toLowerCase(), JSON.stringify(domains || []), userEmail]
    );
    const tenant = rows[0];
    tenant.tenant_id = TenantRepository.generateTenantId(name, tenant.id);
    const updated = await this.pool.query(
      'UPDATE tenants SET tenant_id = $1 WHERE id = $2 RETURNING *',
      [tenant.tenant_id, tenant.id]
    );
    return updated.rows[0];
  }

  async update(id, { name, domains, status, userEmail }) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `UPDATE tenants SET name = COALESCE($1, name), domains = COALESCE($2, domains),
       status = COALESCE($3, status), updated_by = COALESCE($5, updated_by), updated_at = NOW() WHERE id = $4 RETURNING *`,
      [name ? name.toLowerCase() : null, domains ? JSON.stringify(domains) : null, status, id, userEmail]
    );
    return rows[0];
  }

  async delete(id) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      "UPDATE tenants SET status = 'Inactive', updated_at = NOW() WHERE id = $1 RETURNING *", [id]
    );
    return rows[0];
  }
}

module.exports = new TenantRepository();
