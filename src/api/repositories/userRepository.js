const BaseRepository = require('./baseRepository');

class UserRepository extends BaseRepository {
  static tableName = 'users';

  static schema = {
    id: 'SERIAL PRIMARY KEY',
    tenant_id: 'VARCHAR(20) REFERENCES tenants(tenant_id) ON DELETE CASCADE',
    name: 'VARCHAR(255) NOT NULL',
    email: 'VARCHAR(255) NOT NULL',
    password: 'VARCHAR(255) NOT NULL',
    roles: "JSONB NOT NULL DEFAULT '[]'::jsonb",
    portals: "JSONB NOT NULL DEFAULT '[]'::jsonb",
    is_active: 'BOOLEAN DEFAULT true',
    created_by: 'VARCHAR(255)',
    updated_by: 'VARCHAR(255)',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()',
  };

  static indexes = [
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email) WHERE is_active = true',
    'CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id)',
    'CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)',
  ];

  async findAll({ tenantId, search, page = 1, limit = 10 }) {
    await this.ensureTable();
    const offset = (page - 1) * limit;
    const conditions = ['u.is_active = true'];
    const params = [];

    if (tenantId) {
      params.push(tenantId);
      conditions.push(`u.tenant_id = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    params.push(limit, offset);

    const { rows } = await this.pool.query(
      `SELECT u.id, u.tenant_id, t.name as tenant_name, u.name, u.email, u.roles, u.portals, u.is_active, u.created_at, u.updated_at
       FROM users u LEFT JOIN tenants t ON u.tenant_id = t.tenant_id
       ${where} ORDER BY u.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params
    );
    const countRes = await this.pool.query(
      `SELECT COUNT(*) FROM users u ${where}`, params.slice(0, -2)
    );
    return { data: rows, total: parseInt(countRes.rows[0].count) };
  }

  async findById(id) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `SELECT u.id, u.tenant_id, t.name as tenant_name, u.name, u.email, u.roles, u.portals, u.is_active, u.created_at, u.updated_at
       FROM users u LEFT JOIN tenants t ON u.tenant_id = t.tenant_id
       WHERE u.id = $1 AND u.is_active = true`, [id]
    );
    return rows[0];
  }

  async findByEmail(email, tenantId) {
    await this.ensureTable();
    if (tenantId !== undefined && tenantId !== null) {
      const { rows } = await this.pool.query(
        'SELECT * FROM users WHERE email = $1 AND tenant_id = $2 AND is_active = true', [email, tenantId]
      );
      return rows[0];
    }
    const { rows } = await this.pool.query(
      'SELECT * FROM users WHERE email = $1 AND tenant_id IS NULL AND is_active = true', [email]
    );
    return rows[0];
  }

  async create({ tenant_id, name, email, password, roles, portals, userEmail }) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `INSERT INTO users (tenant_id, name, email, password, roles, portals, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       RETURNING id, tenant_id, name, email, roles, portals, is_active, created_by, updated_by, created_at, updated_at`,
      [tenant_id, name, email, password, JSON.stringify(roles), JSON.stringify(portals), userEmail]
    );
    return rows[0];
  }

  async update(id, { tenant_id, name, email, roles, portals, userEmail }) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `UPDATE users SET
         tenant_id = COALESCE($1, tenant_id),
         name = COALESCE($2, name), email = COALESCE($3, email),
         roles = COALESCE($4, roles), portals = COALESCE($5, portals),
         updated_by = COALESCE($7, updated_by), updated_at = NOW()
       WHERE id = $6 AND is_active = true
       RETURNING id, tenant_id, name, email, roles, portals, is_active, created_by, updated_by, created_at, updated_at`,
      [tenant_id, name, email, roles ? JSON.stringify(roles) : null, portals ? JSON.stringify(portals) : null, id, userEmail]
    );
    return rows[0];
  }

  async updatePassword(id, password) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 AND is_active = true RETURNING id',
      [password, id]
    );
    return rows[0];
  }

  async softDelete(id) {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 AND is_active = true RETURNING id',
      [id]
    );
    return rows[0];
  }
}

module.exports = new UserRepository();
