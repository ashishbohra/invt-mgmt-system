const pool = require('../config/db');

module.exports = {
  async findAll({ search, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const where = search ? `WHERE name ILIKE $3` : '';
    const params = search ? [limit, offset, `%${search}%`] : [limit, offset];
    const { rows } = await pool.query(
      `SELECT * FROM tenants ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, params
    );
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM tenants ${where}`, search ? [`%${search}%`] : []
    );
    return { data: rows, total: parseInt(countRes.rows[0].count) };
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM tenants WHERE id = $1', [id]);
    return rows[0];
  },

  async findByName(name) {
    const { rows } = await pool.query('SELECT * FROM tenants WHERE name = $1', [name]);
    return rows[0];
  },

  async create({ name }) {
    const { rows } = await pool.query(
      'INSERT INTO tenants (name) VALUES ($1) RETURNING *', [name]
    );
    return rows[0];
  },

  async update(id, { name, status }) {
    const { rows } = await pool.query(
      'UPDATE tenants SET name = COALESCE($1, name), status = COALESCE($2, status), updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, status, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM tenants WHERE id = $1', [id]);
  },
};
