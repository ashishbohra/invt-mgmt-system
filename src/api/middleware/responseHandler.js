const logger = require('../utils/logger');

const handle = (fn) => async (req, res) => {
  try {
    const result = await fn(req);
    res.json({ success: true, ...result });
  } catch (e) {
    const status = e.status || 500;
    const message = e.message || 'Internal server error';

    if (status >= 500) {
      logger.error('API', `Unhandled error: ${message}`, {
        reqId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        stack: e.stack,
      });
    } else {
      logger.warn('API', `Client error: ${message}`, {
        reqId: req.requestId,
        status,
        method: req.method,
        url: req.originalUrl,
      });
    }

    res.status(status).json({ success: false, error: message });
  }
};

module.exports = handle;
