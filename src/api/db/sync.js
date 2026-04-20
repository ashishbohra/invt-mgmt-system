const { Client } = require('pg');
const logger = require('../utils/logger');
require('dotenv').config();

async function ensureDatabase() {
  logger.info('DB', 'Checking database existence...');
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });
  await client.connect();
  const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [process.env.DB_NAME]);
  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
    logger.info('DB', `Database "${process.env.DB_NAME}" created`);
  } else {
    logger.debug('DB', `Database "${process.env.DB_NAME}" already exists`);
  }
  await client.end();
}

module.exports = ensureDatabase;
