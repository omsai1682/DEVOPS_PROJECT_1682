const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      logger.info(`${req.method} ${req.originalUrl} - Status: ${res.statusCode} [${duration}ms]`);
    }
  });
  next();
};

module.exports = requestLogger;
