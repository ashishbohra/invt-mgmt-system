const express = require('express');
const cors = require('cors');
const swaggerSpec = require('./swagger');
const dbSync = require('./db/sync');
const requestLogger = require('./middleware/requestLogger');
const tenantResolver = require('./middleware/tenantResolver');
const authenticate = require('./middleware/authenticate');
const requireTenant = require('./middleware/requireTenant');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(tenantResolver);

app.get('/api-docs/openapi.json', (req, res) => res.json(swaggerSpec));

// Public — no auth
app.use('/api/auth', require('./routes/auth'));
app.use('/api/health', require('./routes/health'));
app.use('/api/users', require('./routes/users'));

// Auth only — admin portal (no tenant required)
app.use('/api/tenants', authenticate, require('./routes/tenants'));

// Auth + tenant required — user portal (tenant-scoped data)
app.use('/api/products', authenticate, requireTenant, require('./routes/products'));
app.use('/api/inventory', authenticate, requireTenant, require('./routes/inventory'));
app.use('/api/orders', authenticate, requireTenant, require('./routes/orders'));

app.use((err, req, res, next) => {
  logger.error('Server', 'Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({ success: false, error: 'Internal server error' });
});

async function start() {
  logger.info('Server', 'Starting Inventory Management API...');
  await dbSync();

  const { apiReference } = await import('@scalar/express-api-reference');
  app.use('/api-docs', apiReference({
    spec: { content: swaggerSpec },
    theme: 'default',
  }));

  app.listen(PORT, () => {
    logger.info('Server', `Running on http://localhost:${PORT}`);
    logger.info('Server', `Scalar API Docs: http://localhost:${PORT}/api-docs`);
  });
}

start().catch((err) => {
  logger.error('Server', 'Startup failed', { message: err.message, stack: err.stack });
  process.exit(1);
});
