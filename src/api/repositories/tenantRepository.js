const BaseRepository = require('./baseRepository');

class TenantRepository extends BaseRepository {
  static tableName = 'tenants';

  static schema = {
    id: 'SERIAL PRIMARY KEY',
    name: 'VARCHAR(255) NOT NULL',
    domains: "JSONB DEFAULT '[]'::jsonb",
    status: "VARCHAR(20) DEFAULT 'Active'",
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()',
  };

  static indexes = [
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_name ON tenants(name)',
  ];

  async findAll({ search, status, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' }) {
    await this.ensureTable();
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`name ILIKE $${params.length}`);
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
    const { rows } = await this.pool.query('SELECT * FROM tenants WHERE name = $1', [name]);
    return rows[0];
  }

  async create({ name, domains }) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      'INSERT INTO tenants (name, domains) VALUES ($1, $2) RETURNING *',
      [name, JSON.stringify(domains || [])]
    );
    return rows[0];
  }

  async update(id, { name, domains, status }) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `UPDATE tenants SET name = COALESCE($1, name), domains = COALESCE($2, domains),
       status = COALESCE($3, status), updated_at = NOW() WHERE id = $4 RETURNING *`,
      [name, domains ? JSON.stringify(domains) : null, status, id]
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
