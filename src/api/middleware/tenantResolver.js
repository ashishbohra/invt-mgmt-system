const { TENANT_HOST_MAP } = require('../config/tenantHosts');
const tenantRepo = require('../repositories/tenantRepository');
const logger = require('../utils/logger');

module.exports = async (req, res, next) => {
  try {
    let tenantName = req.headers['x-tenant-name'];

    if (!tenantName) {
      const origin = req.headers.origin || req.headers.referer || '';
      for (const [host, name] of Object.entries(TENANT_HOST_MAP)) {
        if (origin.includes(host)) {
          tenantName = name;
          break;
        }
      }
    }

    if (!tenantName) {
      logger.debug('TenantResolver', 'No tenant context — skipping');
      return next();
    }

    const tenant = await tenantRepo.findByName(tenantName);
    if (tenant) {
      req.tenantId = tenant.tenant_id;
      req.tenantName = tenant.name;
      logger.debug('TenantResolver', `Resolved tenant: ${tenant.name} (tenant_id=${tenant.tenant_id})`);
    } else {
      logger.debug('TenantResolver', `Tenant "${tenantName}" not found — skipping`);
    }

    next();
  } catch (e) {
    logger.error('TenantResolver', 'Failed to resolve tenant', { message: e.message });
    next();
  }
};
