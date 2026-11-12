const mongoose = require('mongoose');
const logger = require('../utils/logger');

let isConnected = false;

const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/electronic_rental';

  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000 // Quick timeout to prevent blocking startup
    });

    isConnected = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    isConnected = false;
    logger.error('Initial MongoDB connection error:', error.message);
    logger.warn('Server will continue running. Please set a valid MONGO_URI (e.g. MongoDB Atlas) in your environment variables.');

    // Attempt periodic background reconnection if in production
    if (process.env.NODE_ENV !== 'test') {
      setTimeout(() => {
        logger.info('Retrying MongoDB connection in background...');
        connectDB();
      }, 10000);
    }
  }
};

module.exports = connectDB;
