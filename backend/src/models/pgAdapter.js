const bcrypt = require('bcryptjs');
const { getPool } = require('../config/postgres');

// Map snake_case database row to camelCase JS object
const mapUser = (row) => {
  if (!row) return null;
  const user = {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    phone: row.phone || '',
    address: row.address || '',
    role: row.role || 'customer',
    isActive: row.is_active !== undefined ? row.is_active : true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    comparePassword: async function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    },
    toJSON: function () {
      const copy = { ...this };
      delete copy.password;
      return copy;
    }
  };
  return user;
};

const mapProduct = (row) => {
  if (!row) return null;
  const p = {
    _id: row.id,
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    model: row.model || '',
    description: row.description || '',
    condition: row.condition || 'Excellent',
    pricePerDay: parseFloat(row.price_per_day),
    securityDeposit: parseFloat(row.security_deposit || 0),
    stock: parseInt(row.stock, 10),
    availableStock: parseInt(row.available_stock, 10),
    get rentedStock() {
      return Math.max(0, this.stock - this.availableStock);
    },
    image: row.image,
    status: row.status || 'Available',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    save: async function () {
      const pool = getPool();
      await pool.query(
        `UPDATE products SET 
          name = $1, category = $2, brand = $3, model = $4, description = $5,
          condition = $6, price_per_day = $7, security_deposit = $8, stock = $9,
          available_stock = $10, image = $11, status = $12, updated_at = NOW()
         WHERE id = $13`,
        [
          this.name,
          this.category,
          this.brand,
          this.model,
          this.description,
          this.condition,
          this.pricePerDay,
          this.securityDeposit,
          this.stock,
          this.availableStock,
          this.image,
          this.status,
          this.id || this._id
        ]
      );
      return this;
    }
  };
  return p;
};

const mapRental = (row, user = null, product = null, inspectedBy = null) => {
  if (!row) return null;
  const rental = {
    _id: row.id,
    id: row.id,
    user: user || row.user_id,
    product: product || row.product_id,
    startDate: row.start_date,
    endDate: row.end_date,
    dueDate: row.due_date,
    totalDays: parseInt(row.total_days, 10),
    pricePerDay: parseFloat(row.price_per_day),
    rentalCharge: parseFloat(row.rental_charge),
    securityDeposit: parseFloat(row.security_deposit || 0),
    lateDays: parseInt(row.late_days || 0, 10),
    lateFee: parseFloat(row.late_fee || 0),
    totalAmount: parseFloat(row.total_amount),
    bookingStatus: row.booking_status,
    paymentStatus: row.payment_status,
    dispatchDate: row.dispatch_date,
    returnDate: row.return_date,
    returnStatus: row.return_status,
    productConditionBefore: row.product_condition_before,
    productConditionAfter: row.product_condition_after,
    notes: row.notes || '',
    inspectionNotes: row.inspection_notes || '',
    inspectedBy: inspectedBy || row.inspected_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    save: async function () {
      const pool = getPool();
      const uId = typeof this.user === 'object' ? this.user._id || this.user.id : this.user;
      const pId = typeof this.product === 'object' ? this.product._id || this.product.id : this.product;
      const inspId = typeof this.inspectedBy === 'object' ? this.inspectedBy?._id || this.inspectedBy?.id : this.inspectedBy;

      await pool.query(
        `UPDATE rentals SET
          user_id = $1, product_id = $2, start_date = $3, end_date = $4, due_date = $5,
          total_days = $6, price_per_day = $7, rental_charge = $8, security_deposit = $9,
          late_days = $10, late_fee = $11, total_amount = $12, booking_status = $13,
          payment_status = $14, dispatch_date = $15, return_date = $16, return_status = $17,
          product_condition_before = $18, product_condition_after = $19, notes = $20,
          inspection_notes = $21, inspected_by = $22, updated_at = NOW()
         WHERE id = $23`,
        [
          uId,
          pId,
          this.startDate,
          this.endDate,
          this.dueDate,
          this.totalDays,
          this.pricePerDay,
          this.rentalCharge,
          this.securityDeposit,
          this.lateDays,
          this.lateFee,
          this.totalAmount,
          this.bookingStatus,
          this.paymentStatus,
          this.dispatchDate,
          this.returnDate,
          this.returnStatus,
          this.productConditionBefore,
          this.productConditionAfter,
          this.notes,
          this.inspectionNotes,
          inspId || null,
          this.id || this._id
        ]
      );
      return this;
    }
  };
  return rental;
};

// ==========================================
// POSTGRES USER MODEL
// ==========================================
class PgUser {
  static async findOne(query) {
    const pool = getPool();
    if (!pool) return null;

    let res;
    if (query.email) {
      res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [query.email]);
    }
    const user = res?.rows[0] ? mapUser(res.rows[0]) : null;

    // Support chaining .select('+password')
    return {
      select: () => user,
      then: (resolve) => resolve(user),
      catch: (_reject) => {}
    };
  }

  static async findById(id) {
    const pool = getPool();
    if (!pool) return null;
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] ? mapUser(res.rows[0]) : null;
  }

  static async create(data) {
    const pool = getPool();
    let hashedPassword = data.password;
    if (data.password && !data.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(data.password, salt);
    }

    const id = 'usr_' + Math.random().toString(36).substring(2, 11);
    const res = await pool.query(
      `INSERT INTO users (id, name, email, password, phone, address, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        id,
        data.name,
        data.email.toLowerCase(),
        hashedPassword,
        data.phone || '',
        data.address || '',
        data.role || 'customer',
        data.isActive !== undefined ? data.isActive : true
      ]
    );
    return mapUser(res.rows[0]);
  }

  static find(query = {}) {
    return {
      sort: async () => {
        const pool = getPool();
        if (!pool) return [];
        let sql = 'SELECT * FROM users WHERE 1=1';
        const params = [];

        if (query.role && query.role !== 'All') {
          params.push(query.role);
          sql += ` AND role = $${params.length}`;
        }
        if (query.isActive !== undefined) {
          params.push(query.isActive);
          sql += ` AND is_active = $${params.length}`;
        }

        sql += ' ORDER BY created_at DESC';
        const res = await pool.query(sql, params);
        return res.rows.map(mapUser);
      }
    };
  }

  static async findByIdAndUpdate(id, updates, _options) {
    const pool = getPool();
    const current = await this.findById(id);
    if (!current) return null;

    const name = updates.name !== undefined ? updates.name : current.name;
    const phone = updates.phone !== undefined ? updates.phone : current.phone;
    const address = updates.address !== undefined ? updates.address : current.address;
    const role = updates.role !== undefined ? updates.role : current.role;
    const isActive = updates.isActive !== undefined ? updates.isActive : current.isActive;

    const res = await pool.query(
      `UPDATE users SET name=$1, phone=$2, address=$3, role=$4, is_active=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [name, phone, address, role, isActive, id]
    );
    return mapUser(res.rows[0]);
  }

  static async findByIdAndDelete(id) {
    const pool = getPool();
    const res = await pool.query('DELETE FROM users WHERE id=$1 RETURNING *', [id]);
    return res.rows[0] ? mapUser(res.rows[0]) : null;
  }

  static async countDocuments(query = {}) {
    const pool = getPool();
    if (!pool) return 0;
    let sql = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const params = [];
    if (query.role) {
      params.push(query.role);
      sql += ` AND role = $${params.length}`;
    }
    const res = await pool.query(sql, params);
    return parseInt(res.rows[0].count, 10);
  }
}

// ==========================================
// POSTGRES PRODUCT MODEL
// ==========================================
class PgProduct {
  static async findById(id) {
    const pool = getPool();
    if (!pool) return null;
    const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return res.rows[0] ? mapProduct(res.rows[0]) : null;
  }

  static find(query = {}) {
    return {
      sort: async (sortOption = {}) => {
        const pool = getPool();
        if (!pool) return [];
        let sql = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (query.category && query.category !== 'All') {
          params.push(query.category);
          sql += ` AND category = $${params.length}`;
        }
        if (query.condition && query.condition !== 'All') {
          params.push(query.condition);
          sql += ` AND condition = $${params.length}`;
        }
        if (query.status && query.status !== 'All') {
          params.push(query.status);
          sql += ` AND status = $${params.length}`;
        }

        let order = ' ORDER BY created_at DESC';
        if (sortOption.pricePerDay === 1) order = ' ORDER BY price_per_day ASC';
        if (sortOption.pricePerDay === -1) order = ' ORDER BY price_per_day DESC';
        if (sortOption.name === 1) order = ' ORDER BY name ASC';

        sql += order;
        const res = await pool.query(sql, params);
        return res.rows.map(mapProduct);
      }
    };
  }

  static async create(data) {
    const pool = getPool();
    const id = 'prd_' + Math.random().toString(36).substring(2, 11);
    const stock = Number(data.stock) || 1;
    const availableStock = data.availableStock !== undefined ? Number(data.availableStock) : stock;

    const res = await pool.query(
      `INSERT INTO products (id, name, category, brand, model, description, condition, price_per_day, security_deposit, stock, available_stock, image, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        id,
        data.name,
        data.category,
        data.brand,
        data.model || '',
        data.description || '',
        data.condition || 'Excellent',
        data.pricePerDay,
        data.securityDeposit || 0,
        stock,
        availableStock,
        data.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        data.status || 'Available'
      ]
    );
    return mapProduct(res.rows[0]);
  }

  static async findByIdAndUpdate(id, updates, _options) {
    const current = await this.findById(id);
    if (!current) return null;

    const updated = { ...current, ...updates };
    await updated.save();
    return this.findById(id);
  }

  static async findByIdAndDelete(id) {
    const pool = getPool();
    const res = await pool.query('DELETE FROM products WHERE id=$1 RETURNING *', [id]);
    return res.rows[0] ? mapProduct(res.rows[0]) : null;
  }

  static async countDocuments(query = {}) {
    const pool = getPool();
    if (!pool) return 0;
    let sql = 'SELECT COUNT(*) FROM products WHERE 1=1';
    const params = [];
    if (query.status) {
      params.push(query.status);
      sql += ` AND status = $${params.length}`;
    }
    if (query.condition) {
      params.push(query.condition);
      sql += ` AND condition = $${params.length}`;
    }
    const res = await pool.query(sql, params);
    return parseInt(res.rows[0].count, 10);
  }
}

// ==========================================
// POSTGRES RENTAL MODEL
// ==========================================
class PgRental {
  constructor(data) {
    this._id = 'rnt_' + Math.random().toString(36).substring(2, 11);
    this.id = this._id;
    this.user = data.user;
    this.product = data.product;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.dueDate = data.dueDate;
    this.totalDays = data.totalDays;
    this.pricePerDay = data.pricePerDay;
    this.rentalCharge = data.rentalCharge;
    this.securityDeposit = data.securityDeposit || 0;
    this.lateDays = data.lateDays || 0;
    this.lateFee = data.lateFee || 0;
    this.totalAmount = data.totalAmount;
    this.bookingStatus = data.bookingStatus || 'Confirmed';
    this.paymentStatus = data.paymentStatus || 'Paid';
    this.dispatchDate = data.dispatchDate || null;
    this.returnDate = data.returnDate || null;
    this.returnStatus = data.returnStatus || 'Not Returned';
    this.productConditionBefore = data.productConditionBefore || 'Excellent';
    this.productConditionAfter = data.productConditionAfter || 'Pending';
    this.notes = data.notes || '';
    this.inspectionNotes = data.inspectionNotes || '';
    this.inspectedBy = data.inspectedBy || null;
  }

  async save() {
    const pool = getPool();
    const uId = typeof this.user === 'object' ? this.user._id || this.user.id : this.user;
    const pId = typeof this.product === 'object' ? this.product._id || this.product.id : this.product;

    const existing = await pool.query('SELECT id FROM rentals WHERE id = $1', [this.id]);
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO rentals (
          id, user_id, product_id, start_date, end_date, due_date, total_days,
          price_per_day, rental_charge, security_deposit, late_days, late_fee,
          total_amount, booking_status, payment_status, dispatch_date, return_date,
          return_status, product_condition_before, product_condition_after, notes,
          inspection_notes, inspected_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        )`,
        [
          this.id,
          uId,
          pId,
          this.startDate,
          this.endDate,
          this.dueDate,
          this.totalDays,
          this.pricePerDay,
          this.rentalCharge,
          this.securityDeposit,
          this.lateDays,
          this.lateFee,
          this.totalAmount,
          this.bookingStatus,
          this.paymentStatus,
          this.dispatchDate,
          this.returnDate,
          this.returnStatus,
          this.productConditionBefore,
          this.productConditionAfter,
          this.notes,
          this.inspectionNotes,
          this.inspectedBy
        ]
      );
    } else {
      await mapRental(this).save();
    }
    return this;
  }

  static async findById(id) {
    const pool = getPool();
    if (!pool) return null;

    const res = await pool.query(
      `SELECT r.*, 
              u.name as u_name, u.email as u_email, u.phone as u_phone, u.address as u_address,
              p.name as p_name, p.category as p_category, p.brand as p_brand, p.image as p_image, p.price_per_day as p_price,
              i.name as i_name, i.email as i_email
       FROM rentals r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN products p ON r.product_id = p.id
       LEFT JOIN users i ON r.inspected_by = i.id
       WHERE r.id = $1`,
      [id]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    const user = { _id: row.user_id, id: row.user_id, name: row.u_name, email: row.u_email, phone: row.u_phone, address: row.u_address };
    const product = { _id: row.product_id, id: row.product_id, name: row.p_name, category: row.p_category, brand: row.p_brand, image: row.p_image, pricePerDay: parseFloat(row.p_price) };
    const inspectedBy = row.inspected_by ? { _id: row.inspected_by, id: row.inspected_by, name: row.i_name, email: row.i_email } : null;

    const rental = mapRental(row, user, product, inspectedBy);

    // Support chaining .populate(...)
    return {
      ...rental,
      populate: function () {
        return this;
      },
      then: (resolve) => resolve(rental),
      catch: (_reject) => {}
    };
  }

  static find(query = {}) {
    const chain = {
      populates: [],
      populate: function (fields) {
        chain.populates.push(fields);
        return chain;
      },
      sort: async function () {
        const pool = getPool();
        if (!pool) return [];

        let sql = `
          SELECT r.*, 
                 u.name as u_name, u.email as u_email, u.phone as u_phone, u.address as u_address,
                 p.name as p_name, p.category as p_category, p.brand as p_brand, p.image as p_image, p.price_per_day as p_price,
                 i.name as i_name, i.email as i_email
          FROM rentals r
          LEFT JOIN users u ON r.user_id = u.id
          LEFT JOIN products p ON r.product_id = p.id
          LEFT JOIN users i ON r.inspected_by = i.id
          WHERE 1=1
        `;
        const params = [];

        if (query.user) {
          params.push(query.user);
          sql += ` AND r.user_id = $${params.length}`;
        }
        if (query.bookingStatus) {
          if (typeof query.bookingStatus === 'object' && query.bookingStatus.$in) {
            const inPlaceholders = query.bookingStatus.$in.map((_, i) => `$${params.length + i + 1}`).join(',');
            params.push(...query.bookingStatus.$in);
            sql += ` AND r.booking_status IN (${inPlaceholders})`;
          } else {
            params.push(query.bookingStatus);
            sql += ` AND r.booking_status = $${params.length}`;
          }
        }
        if (query.dueDate && query.dueDate.$lt) {
          params.push(query.dueDate.$lt);
          sql += ` AND r.due_date < $${params.length}`;
        }

        sql += ' ORDER BY r.created_at DESC';
        const res = await pool.query(sql, params);

        return res.rows.map((row) => {
          const user = { _id: row.user_id, id: row.user_id, name: row.u_name, email: row.u_email, phone: row.u_phone, address: row.u_address };
          const product = { _id: row.product_id, id: row.product_id, name: row.p_name, category: row.p_category, brand: row.p_brand, image: row.p_image, pricePerDay: parseFloat(row.p_price) };
          const inspectedBy = row.inspected_by ? { _id: row.inspected_by, id: row.inspected_by, name: row.i_name, email: row.i_email } : null;
          return mapRental(row, user, product, inspectedBy);
        });
      },
      then: async function (resolve) {
        const results = await chain.sort();
        resolve(results);
      }
    };
    return chain;
  }

  static async countDocuments(query = {}) {
    const pool = getPool();
    if (!pool) return 0;
    let sql = 'SELECT COUNT(*) FROM rentals WHERE 1=1';
    const params = [];

    if (query.bookingStatus) {
      if (typeof query.bookingStatus === 'object' && query.bookingStatus.$in) {
        const placeholders = query.bookingStatus.$in.map((_, i) => `$${params.length + i + 1}`).join(',');
        params.push(...query.bookingStatus.$in);
        sql += ` AND booking_status IN (${placeholders})`;
      } else {
        params.push(query.bookingStatus);
        sql += ` AND booking_status = $${params.length}`;
      }
    }
    const res = await pool.query(sql, params);
    return parseInt(res.rows[0].count, 10);
  }

  static async aggregate(_pipeline) {
    const pool = getPool();
    if (!pool) return [];

    const res = await pool.query(`
      SELECT 
        SUM(total_amount) as total_revenue,
        SUM(rental_charge) as rental_revenue,
        SUM(security_deposit) as deposit_revenue,
        SUM(late_fee) as late_fee_revenue
      FROM rentals
      WHERE payment_status = 'Paid'
    `);

    const row = res.rows[0];
    return [
      {
        totalRevenue: parseFloat(row.total_revenue || 0),
        rentalRevenue: parseFloat(row.rental_revenue || 0),
        depositRevenue: parseFloat(row.deposit_revenue || 0),
        lateFeeRevenue: parseFloat(row.late_fee_revenue || 0)
      }
    ];
  }
}

module.exports = {
  PgUser,
  PgProduct,
  PgRental
};
