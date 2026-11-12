const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { defaultUsers, defaultProducts } = require('../utils/seedData');

let pool = null;
let isConnected = false;

const isPostgresUrl = (url) => {
  return url && (url.startsWith('postgres://') || url.startsWith('postgresql://'));
};

const getPostgresUrl = () => {
  return (
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    (isPostgresUrl(process.env.MONGO_URI) ? process.env.MONGO_URI : null)
  );
};

const initPostgres = async () => {
  const connectionString = getPostgresUrl();
  if (!connectionString) return null;

  try {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000
    });

    // Test connection
    const client = await pool.connect();
    logger.info('Connected to Neon PostgreSQL Database!');
    client.release();
    isConnected = true;

    // Create schema tables if not exist
    await createTables();

    // Auto seed if empty
    await autoSeedIfEmpty();

    return pool;
  } catch (error) {
    logger.error('Failed to connect to Neon PostgreSQL:', error.message);
    return null;
  }
};

const createTables = async () => {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(100) DEFAULT '',
      address TEXT DEFAULT '',
      role VARCHAR(50) DEFAULT 'customer',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      brand VARCHAR(100) NOT NULL,
      model VARCHAR(255) DEFAULT '',
      description TEXT DEFAULT '',
      condition VARCHAR(50) DEFAULT 'Excellent',
      price_per_day NUMERIC(10,2) NOT NULL,
      security_deposit NUMERIC(10,2) DEFAULT 0,
      stock INT DEFAULT 1,
      available_stock INT DEFAULT 1,
      image TEXT DEFAULT '',
      status VARCHAR(50) DEFAULT 'Available',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rentals (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      product_id VARCHAR(50) NOT NULL,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      due_date TIMESTAMP NOT NULL,
      total_days INT NOT NULL,
      price_per_day NUMERIC(10,2) NOT NULL,
      rental_charge NUMERIC(10,2) NOT NULL,
      security_deposit NUMERIC(10,2) DEFAULT 0,
      late_days INT DEFAULT 0,
      late_fee NUMERIC(10,2) DEFAULT 0,
      total_amount NUMERIC(10,2) NOT NULL,
      booking_status VARCHAR(50) DEFAULT 'Confirmed',
      payment_status VARCHAR(50) DEFAULT 'Paid',
      dispatch_date TIMESTAMP,
      return_date TIMESTAMP,
      return_status VARCHAR(50) DEFAULT 'Not Returned',
      product_condition_before VARCHAR(50) DEFAULT 'Excellent',
      product_condition_after VARCHAR(50) DEFAULT 'Pending',
      notes TEXT DEFAULT '',
      inspection_notes TEXT DEFAULT '',
      inspected_by VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(schemaSql);
  logger.info('Neon PostgreSQL schema verified / created.');
};

const autoSeedIfEmpty = async () => {
  const { rows } = await pool.query('SELECT COUNT(*) FROM products');
  if (parseInt(rows[0].count, 10) === 0) {
    logger.info('Neon PostgreSQL is empty. Seeding initial users and products...');

    // Seed users
    for (const u of defaultUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      const id = 'usr_' + Math.random().toString(36).substring(2, 11);
      await pool.query(
        `INSERT INTO users (id, name, email, password, phone, address, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (email) DO NOTHING`,
        [id, u.name, u.email.toLowerCase(), hashedPassword, u.phone, u.address, u.role, u.isActive]
      );
    }

    // Seed products
    for (const p of defaultProducts) {
      const id = 'prd_' + Math.random().toString(36).substring(2, 11);
      await pool.query(
        `INSERT INTO products (id, name, category, brand, model, description, condition, price_per_day, security_deposit, stock, available_stock, image, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          id,
          p.name,
          p.category,
          p.brand,
          p.model,
          p.description,
          p.condition,
          p.pricePerDay,
          p.securityDeposit,
          p.stock,
          p.availableStock,
          p.image,
          p.status
        ]
      );
    }

    logger.info('Neon PostgreSQL seeded with default users and products!');
  }
};

const getPool = () => pool;

module.exports = {
  isPostgresUrl,
  getPostgresUrl,
  initPostgres,
  getPool,
  isConnected: () => isConnected
};
