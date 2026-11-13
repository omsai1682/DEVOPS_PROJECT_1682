const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { isConnected: isPostgresConnected } = require('../config/postgres');

router.get('/', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  const isPgConnected = isPostgresConnected();
  const isDbConnected = isMongoConnected || isPgConnected;

  res.status(200).json({
    success: true,
    status: isDbConnected ? 'healthy' : 'operational',
    service: 'Online Electronic Product Rental Management System API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: isPgConnected ? 'neon-postgresql' : isMongoConnected ? 'mongodb' : 'fallback-in-memory',
    environment: process.env.NODE_ENV || 'production'
  });
});

module.exports = router;
