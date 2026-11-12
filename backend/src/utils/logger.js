/**
 * Simple structured console logger for DevOps monitoring
 */
const info = (message, meta = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [INFO] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
};

const warn = (message, meta = {}) => {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] [WARN] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
};

const error = (message, err = null) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [ERROR] ${message}`, err ? (err.stack || err) : '');
};

module.exports = {
  info,
  warn,
  error
};
