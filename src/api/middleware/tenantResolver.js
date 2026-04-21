const tenantRepo = require('../repositories/tenantRepository');
const logger = require('../utils/logger');

module.exports = async (req, res, next) => {
  try {
    let tenant = null;

    // 1. Try X-Tenant-Name header
    const tenantName = req.headers['x-tenant-name'];
    if (tenantName) {
      tenant = await tenantRepo.findByName(tenantName);
    }

    // 2. Try origin/referer domain against tenant domains in DB
    if (!tenant) {
      const origin = req.headers.origin || req.headers.referer || '';
      if (origin) {
        tenant = await tenantRepo.findByDomain(origin);
      }
    }

    if (!tenant && !tenantName) {
      logger.debug('TenantResolver', 'No tenant context — skipping');
      return next();
    }

    if (!tenant) {
      logger.warn('TenantResolver', `Tenant not found for: ${tenantName || 'unknown domain'}`);
      return res.status(401).json({ success: false, error: 'Unauthorized — tenant not recognized' });
    }

    if (tenant.status !== 'Active') {
      logger.warn('TenantResolver', `Tenant "${tenant.name}" is inactive`);
      return res.status(401).json({ success: false, error: 'Unauthorized — tenant is inactive' });
    }

    req.tenantId = tenant.tenant_id;
    req.tenantName = tenant.name;
    logger.debug('TenantResolver', `Resolved tenant: ${tenant.name} (tenant_id=${tenant.tenant_id})`);
    next();
  } catch (e) {
    logger.error('TenantResolver', 'Failed to resolve tenant', { message: e.message });
    next();
  }
};
