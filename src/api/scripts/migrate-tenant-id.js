/**
 * Migration: Convert tenant_id from INTEGER to VARCHAR(20) in products, inventory, orders.
 * Also adds created_by/updated_by audit columns (handled by auto-sync on next API start).
 *
 * Run once: node src/api/scripts/migrate-tenant-id.js
 *
 * WARNING: This drops orders, inventory, products tables and their data.
 * Tenants and users tables are preserved.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration...\n');

    // Drop in dependency order (orders -> inventory -> products)
    const tables = ['orders', 'inventory', 'products'];
    for (const table of tables) {
      const exists = await client.query(
        `SELECT 1 FROM information_schema.tables WHERE table_name = $1 AND table_schema = 'public'`, [table]
      );
      if (exists.rowCount > 0) {
        await client.query(`DROP TABLE ${table} CASCADE`);
        console.log(`  Dropped table: ${table}`);
      } else {
        console.log(`  Table ${table} does not exist, skipping`);
      }
    }

    // Check if users.tenant_id is still INTEGER and convert it
    const colInfo = await client.query(
      `SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tenant_id'`
    );
    if (colInfo.rowCount > 0 && colInfo.rows[0].data_type === 'integer') {
      console.log('\n  Converting users.tenant_id from INTEGER to VARCHAR(20)...');

      // Drop constraints referencing tenant_id
      const fks = await client.query(`
        SELECT tc.constraint_name FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'users' AND kcu.column_name = 'tenant_id' AND tc.constraint_type = 'FOREIGN KEY'
      `);
      for (const fk of fks.rows) {
        await client.query(`ALTER TABLE users DROP CONSTRAINT ${fk.constraint_name}`);
        console.log(`  Dropped FK constraint: ${fk.constraint_name}`);
      }

      // Drop indexes on tenant_id
      const idxs = await client.query(`
        SELECT indexname FROM pg_indexes WHERE tablename = 'users' AND indexdef LIKE '%tenant_id%'
      `);
      for (const idx of idxs.rows) {
        await client.query(`DROP INDEX IF EXISTS ${idx.indexname}`);
        console.log(`  Dropped index: ${idx.indexname}`);
      }

      // Alter column type
      await client.query(`ALTER TABLE users ALTER COLUMN tenant_id TYPE VARCHAR(20) USING tenant_id::text`);
      console.log('  Converted users.tenant_id to VARCHAR(20)');

      // Re-add FK to tenants(tenant_id)
      await client.query(`ALTER TABLE users ADD CONSTRAINT fk_users_tenant_id FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE`);
      console.log('  Added FK: users.tenant_id -> tenants(tenant_id)');
    } else {
      console.log('\n  users.tenant_id is already VARCHAR, skipping conversion');
    }

    // Add audit columns to tenants if missing
    const tenantCols = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'tenants'`
    );
    const tenantColNames = tenantCols.rows.map(r => r.column_name);
    if (!tenantColNames.includes('created_by')) {
      await client.query('ALTER TABLE tenants ADD COLUMN created_by VARCHAR(255)');
      console.log('  Added tenants.created_by');
    }
    if (!tenantColNames.includes('updated_by')) {
      await client.query('ALTER TABLE tenants ADD COLUMN updated_by VARCHAR(255)');
      console.log('  Added tenants.updated_by');
    }

    // Add audit columns to users if missing
    const userCols = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`
    );
    const userColNames = userCols.rows.map(r => r.column_name);
    if (!userColNames.includes('created_by')) {
      await client.query('ALTER TABLE users ADD COLUMN created_by VARCHAR(255)');
      console.log('  Added users.created_by');
    }
    if (!userColNames.includes('updated_by')) {
      await client.query('ALTER TABLE users ADD COLUMN updated_by VARCHAR(255)');
      console.log('  Added users.updated_by');
    }

    console.log('\nMigration complete. Start the API — auto-sync will recreate products, inventory, orders tables.\n');
  } catch (err) {
    console.error('\nMigration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
