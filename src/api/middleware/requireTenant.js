const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  if (!req.user?.tenantId) {
    logger.warn('TenantGuard', 'No tenant context in token', { url: req.originalUrl, userId: req.user?.userId });
    return res.status(403).json({ success: false, error: 'Tenant context required. Login with a tenant-scoped user.' });
  }
  next();
};
