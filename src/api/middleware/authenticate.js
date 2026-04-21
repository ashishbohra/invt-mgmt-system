const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    logger.warn('Auth', 'Missing or invalid Authorization header', { url: req.originalUrl });
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    req.tenantId = decoded.tenantId || req.tenantId;
    logger.debug('Auth', 'Token verified', { userId: decoded.userId, tenantId: decoded.tenantId });
    next();
  } catch (e) {
    logger.warn('Auth', `Token verification failed: ${e.message}`);
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

authenticate.optional = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  try {
    req.user = verifyToken(header.split(' ')[1]);
    req.tenantId = req.user.tenantId || req.tenantId;
  } catch (_) {}
  next();
};

module.exports = authenticate;
