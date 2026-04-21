const repo = require('../repositories/userRepository');
const { validateEmail } = require('../utils/emailValidator');
const { validatePassword, hashPassword } = require('../utils/password');
const { validateRoles, validatePortals } = require('../utils/validators');
const { PORTALS } = require('../constants/enums');
const logger = require('../utils/logger');

module.exports = {
  async list(query) {
    logger.debug('UserService', 'Listing users', { tenantId: query.tenantId });
    return repo.findAll(query);
  },

  async getById(id) {
    logger.debug('UserService', `Getting user id=${id}`);
    const user = await repo.findById(id);
    if (!user) throw { status: 404, message: 'User not found' };
    return user;
  },

  async create({ tenant_id, name, email, password, roles, portals }) {
    if (!name) throw { status: 400, message: 'Name is required' };
    validateEmail(email);
    validatePassword(password);
    validateRoles(roles);
    validatePortals(portals);

    if (portals?.includes(PORTALS.USER) && !tenant_id) {
      throw { status: 400, message: 'Tenant ID is required for UserPortal users' };
    }

    const existing = await repo.findByEmail(email, tenant_id || null);
    if (existing) {
      logger.warn('UserService', `Duplicate email on create: ${email}`, { tenantId: tenant_id });
      throw { status: 409, message: 'Email already exists' + (tenant_id ? ' for this tenant' : '') };
    }

    const hashed = await hashPassword(password);
    const user = await repo.create({ tenant_id: tenant_id || null, name, email, password: hashed, roles, portals });
    logger.info('UserService', `User created id=${user.id}`, { email, roles, portals, tenantId: tenant_id });
    return user;
  },

  async update(id, data) {
    if (data.email) validateEmail(data.email);
    if (data.roles) validateRoles(data.roles);
    if (data.portals) validatePortals(data.portals);
    if (data.email) {
      const current = await repo.findById(id);
      if (current) {
        const existing = await repo.findByEmail(data.email, current.tenant_id);
        if (existing && existing.id !== parseInt(id)) throw { status: 409, message: 'Email already exists for this tenant' };
      }
    }
    const user = await repo.update(id, data);
    if (!user) throw { status: 404, message: 'User not found' };
    logger.info('UserService', `User updated id=${id}`, { fields: Object.keys(data) });
    return user;
  },

  async changePassword(id, { password }) {
    validatePassword(password);
    const hashed = await hashPassword(password);
    const user = await repo.updatePassword(id, hashed);
    if (!user) throw { status: 404, message: 'User not found' };
    logger.info('UserService', `Password changed for userId=${id}`);
    return { message: 'Password updated' };
  },

  async delete(id) {
    const user = await repo.softDelete(id);
    if (!user) throw { status: 404, message: 'User not found' };
    logger.info('UserService', `User soft-deleted id=${id}`);
    return { message: 'User deleted' };
  },
};
