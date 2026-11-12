const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Rental = require('../src/models/Rental');
const jwt = require('jsonwebtoken');
require('./setup');

describe('Reports & Analytics APIs', () => {
  let adminToken, customerToken;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin Reports',
      email: 'admin.rep@example.com',
      password: 'Password@123',
      role: 'admin'
    });

    const customer = await User.create({
      name: 'Customer Reports',
      email: 'cust.rep@example.com',
      password: 'Password@123',
      role: 'customer'
    });

    const secret = process.env.JWT_SECRET || 'test_jwt_secret_devops_demo';
    adminToken = jwt.sign({ id: admin._id, role: 'admin' }, secret, { expiresIn: '1h' });
    customerToken = jwt.sign({ id: customer._id, role: 'customer' }, secret, { expiresIn: '1h' });

    const prod = await Product.create({
      name: 'Test Projector',
      category: 'Projectors',
      brand: 'Epson',
      pricePerDay: 40,
      stock: 5,
      availableStock: 4
    });

    await Rental.create({
      user: customer._id,
      product: prod._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      totalDays: 3,
      pricePerDay: 40,
      rentalCharge: 120,
      securityDeposit: 150,
      totalAmount: 270,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid'
    });
  });

  test('GET /api/reports/rentals - Admin can retrieve Rental Booking Report', async () => {
    const res = await request(app)
      .get('/api/reports/rentals')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.report.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.report[0]).toHaveProperty('rentalId');
    expect(res.body.data.report[0]).toHaveProperty('customer');
  });

  test('GET /api/reports/availability - Admin can retrieve Product Availability Report', async () => {
    const res = await request(app)
      .get('/api/reports/availability')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.report.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.report[0]).toHaveProperty('availableStock');
    expect(res.body.data.report[0]).toHaveProperty('rentedStock');
  });

  test('GET /api/reports/revenue - Admin can retrieve Revenue Report', async () => {
    const res = await request(app)
      .get('/api/reports/revenue?range=30d')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.report.rentalRevenue).toBeGreaterThanOrEqual(120);
    expect(res.body.data.report).toHaveProperty('categoryBreakdown');
  });

  test('GET /api/reports/overdue - Admin can retrieve Overdue Rental Report', async () => {
    const res = await request(app)
      .get('/api/reports/overdue')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.report)).toBe(true);
  });

  test('Customer should be forbidden from accessing Reports (403)', async () => {
    const res = await request(app)
      .get('/api/reports/revenue')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
