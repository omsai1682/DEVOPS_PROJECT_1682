const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { getPostgresUrl, initPostgres, isPostgresUrl } = require('./postgres');

const connectDB = async () => {
  const pgUrl = getPostgresUrl();

  // 1. If Neon PostgreSQL connection string is provided, use Postgres
  if (pgUrl && isPostgresUrl(pgUrl)) {
    logger.info('Detected PostgreSQL connection string. Initializing Neon database...');
    const pool = await initPostgres();
    if (pool) {
      return pool;
    }
  }

  // 2. Otherwise use MongoDB
  const mongoUri =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/electronic_rental';

  // Disable command buffering so queries fail immediately to in-memory fallback if DB is offline
  mongoose.set('bufferCommands', false);

  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 3000
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error('Initial database connection error:', error.message);
    logger.warn('Server will continue running. Set DATABASE_URL (for Neon) or MONGO_URI in your environment variables.');

    if (process.env.NODE_ENV !== 'test') {
      setTimeout(() => {
        logger.info('Retrying database connection in background...');
        connectDB();
      }, 10000);
    }
  }
};

module.exports = connectDB;
