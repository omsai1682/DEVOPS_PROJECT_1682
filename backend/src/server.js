require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { checkAndUpdateOverdueRentals } = require('./services/rentalService');

const PORT = process.env.PORT || 5000;

// Connect to Database and start listening
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`Rental Management API Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
    logger.info(`Health check available at http://localhost:${PORT}/api/health`);

    // Initial check for overdue rentals upon startup
    checkAndUpdateOverdueRentals().catch((err) => {
      logger.error('Initial overdue rental check failed:', err);
    });

    // Run overdue scanner periodically (e.g. every hour or configurable)
    const intervalMs = Number(process.env.OVERDUE_CHECK_INTERVAL_MS) || 3600000;
    setInterval(() => {
      checkAndUpdateOverdueRentals().catch((err) => {
        logger.error('Periodic overdue rental check error:', err);
      });
    }, intervalMs);
  });

  // Graceful shutdown handling for container and process termination
  const handleShutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  process.on('unhandledRejection', (reason, _promise) => {
    logger.error('Unhandled Promise Rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception thrown:', err);
    process.exit(1);
  });
};

startServer();
