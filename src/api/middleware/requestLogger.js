const logger = require('../utils/logger');

let requestId = 0;

module.exports = (req, res, next) => {
  const id = ++requestId;
  const start = Date.now();
  req.requestId = id;

  logger.info('HTTP', `→ ${req.method} ${req.originalUrl}`, {
    reqId: id,
    ip: req.ip,
    body: req.method !== 'GET' ? req.body : undefined,
    query: Object.keys(req.query).length ? req.query : undefined,
  });

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]('HTTP', `← ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`, {
      reqId: id,
      success: body?.success,
    });
    return originalJson(body);
  };

  next();
};
