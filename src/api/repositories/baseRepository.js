const path = require('path');
const pool = require('../config/db');
const logger = require('../utils/logger');

const synced = new Set();
const registry = {};

const tableToFile = {
  users: 'userRepository',
  tenants: 'tenantRepository',
  products: 'productRepository',
  inventory: 'inventoryRepository',
  orders: 'orderRepository',
};

function getBaseType(def) {
  return def.replace(/PRIMARY KEY/i, '').replace(/NOT NULL/i, '').replace(/UNIQUE/i, '')
    .replace(/DEFAULT\s+.*/i, '').replace(/REFERENCES\s+.*/i, '').trim();
}

function getDefault(def) {
  const m = def.match(/DEFAULT\s+(.+?)(?:\s+REFERENCES|\s*$)/i);
  return m ? m[1].trim() : null;
}

function getDependencies(schema) {
  const deps = [];
  for (const def of Object.values(schema)) {
    const m = def.match(/REFERENCES\s+(\w+)/i);
    if (m && !deps.includes(m[1])) deps.push(m[1]);
  }
  return deps;
}

function resolveRepo(tableName) {
  if (registry[tableName]) return registry[tableName];
  const file = tableToFile[tableName];
  if (file) {
    require(path.join(__dirname, `${file}.js`));
    return registry[tableName];
  }
  return null;
}

async function syncSingleTable(tableName, schema, indexes) {
  const start = Date.now();
  const exists = await pool.query(
    `SELECT 1 FROM information_schema.tables WHERE table_name = $1 AND table_schema = 'public'`, [tableName]
  );

  if (exists.rowCount === 0) {
    const colDefs = Object.entries(schema).map(([c, d]) => `${c} ${d}`).join(', ');
    await pool.query(`CREATE TABLE ${tableName} (${colDefs})`);
    logger.info('Schema', `Table "${tableName}" created`, { columns: Object.keys(schema) });
  } else {
    const { rows } = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = 'public'`, [tableName]
    );
    const existing = rows.map((r) => r.column_name);

    for (const [col, def] of Object.entries(schema)) {
      if (!existing.includes(col)) {
        const baseType = getBaseType(def);
        const defaultVal = getDefault(def);
        await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${col} ${baseType}${defaultVal ? ` DEFAULT ${defaultVal}` : ''}`);
        logger.info('Schema', `Column "${tableName}.${col}" added`, { type: baseType });
      }
    }

    const defined = Object.keys(schema);
    for (const col of existing) {
      if (!defined.includes(col)) {
        await pool.query(`ALTER TABLE ${tableName} DROP COLUMN ${col} CASCADE`);
        logger.warn('Schema', `Column "${tableName}.${col}" removed`);
      }
    }
  }

  for (const idx of indexes || []) await pool.query(idx);
  synced.add(tableName);
  logger.debug('Schema', `"${tableName}" synced (${Date.now() - start}ms)`);
}

class BaseRepository {
  constructor() {
    if (!this.constructor.tableName) throw new Error('tableName must be defined');
    if (!this.constructor.schema) throw new Error('schema must be defined');
    registry[this.constructor.tableName] = this.constructor;
  }

  get pool() { return pool; }
  get table() { return this.constructor.tableName; }

  async ensureTable() {
    if (synced.has(this.table)) return;

    logger.debug('Schema', `Syncing "${this.table}" and dependencies...`);

    const deps = getDependencies(this.constructor.schema);
    for (const dep of deps) {
      if (dep === this.table || synced.has(dep)) continue;
      const depClass = resolveRepo(dep);
      if (depClass) {
        const nestedDeps = getDependencies(depClass.schema);
        for (const nd of nestedDeps) {
          if (nd !== dep && !synced.has(nd)) {
            const ndClass = resolveRepo(nd);
            if (ndClass) await syncSingleTable(nd, ndClass.schema, ndClass.indexes);
          }
        }
        await syncSingleTable(dep, depClass.schema, depClass.indexes);
      }
    }

    await syncSingleTable(this.table, this.constructor.schema, this.constructor.indexes);
  }
}

BaseRepository.registry = registry;
BaseRepository.tableToFile = tableToFile;

module.exports = BaseRepository;
