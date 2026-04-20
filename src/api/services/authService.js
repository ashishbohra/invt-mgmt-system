const userRepo = require('../repositories/userRepository');
const { validateEmail } = require('../utils/emailValidator');
const { comparePassword } = require('../utils/password');
const { signToken, decodeToken } = require('../utils/jwt');
const logger = require('../utils/logger');

const { PORTALS } = require('../constants/enums');

async function verifyAndSign(user) {
  const token = signToken({
    userId: user.id,
    tenantId: user.tenant_id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    portals: user.portals,
  });
  const decoded = decodeToken(token);
  return {
    token,
    expiresAt: new Date(decoded.exp * 1000).toISOString(),
    user: { id: user.id, tenantId: user.tenant_id, name: user.name, email: user.email, roles: user.roles, portals: user.portals },
  };
}

async function authenticate(email, password, tenantId) {
  if (!email || !password) throw { status: 400, message: 'Email and password are required' };
  validateEmail(email);

  const user = await userRepo.findByEmail(email, tenantId);
  if (!user) throw { status: 401, message: 'Invalid email or password' };

  const valid = await comparePassword(password, user.password);
  if (!valid) throw { status: 401, message: 'Invalid email or password' };

  return user;
}

module.exports = {
  async adminLogin({ email, password }) {
    logger.info('Auth', `Admin login attempt for ${email}`);
    const user = await authenticate(email, password, null);
    if (!user.portals || !user.portals.includes(PORTALS.ADMIN)) {
      logger.warn('Auth', `Admin login denied — no AdminPortal access userId=${user.id}`);
      throw { status: 403, message: 'You do not have access to the Admin Portal' };
    }
    logger.info('Auth', `Admin login successful userId=${user.id}`);
    return verifyAndSign(user);
  },

  async userLogin({ email, password, tenantId }) {
    if (!tenantId) throw { status: 400, message: 'Tenant context required for user login' };
    logger.info('Auth', `User login attempt for ${email}`, { tenantId });
    const user = await authenticate(email, password, tenantId);
    if (!user.portals || !user.portals.includes(PORTALS.USER)) {
      logger.warn('Auth', `User login denied — no UserPortal access userId=${user.id}`, { tenantId });
      throw { status: 403, message: 'You do not have access to the User Portal' };
    }
    logger.info('Auth', `User login successful userId=${user.id}`, { tenantId });
    return verifyAndSign(user);
  },
};
