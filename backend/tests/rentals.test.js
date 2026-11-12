const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Rental = require('../src/models/Rental');
const jwt = require('jsonwebtoken');
const { checkAndUpdateOverdueRentals } = require('../src/services/rentalService');
require('./setup');

describe('Rental Business Logic & Overdue Detection', () => {
  let customerUser, adminUser, inventoryUser;
  let customerToken, adminToken, inventoryToken;
  let testProduct;

  beforeEach(async () => {
    customerUser = await User.create({
      name: 'Rental Customer',
      email: 'customer.rental@example.com',
      password: 'Password@123',
      role: 'customer'
    });

    adminUser = await User.create({
      name: 'Rental Admin',
      email: 'admin.rental@example.com',
      password: 'Password@123',
      role: 'admin'
    });

    inventoryUser = await User.create({
      name: 'Rental Inventory',
      email: 'inv.rental@example.com',
      password: 'Password@123',
      role: 'inventory_manager'
    });

    const secret = process.env.JWT_SECRET || 'test_jwt_secret_devops_demo';
    customerToken = jwt.sign({ id: customerUser._id, role: 'customer' }, secret, { expiresIn: '1h' });
    adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, secret, { expiresIn: '1h' });
    inventoryToken = jwt.sign({ id: inventoryUser._id, role: 'inventory_manager' }, secret, { expiresIn: '1h' });

    testProduct = await Product.create({
      name: 'Sony WH-1000XM5',
      category: 'Headphones',
      brand: 'Sony',
      pricePerDay: 25,
      securityDeposit: 100,
      stock: 2,
      availableStock: 2,
      condition: 'Excellent',
      status: 'Available'
    });
  });

  test('POST /api/rentals/estimate - Should calculate rental cost correctly', async () => {
    const today = new Date();
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    const res = await request(app)
      .post('/api/rentals/estimate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProduct._id,
        startDate: today.toISOString(),
        endDate: threeDaysLater.toISOString()
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalDays).toBe(3);
    expect(res.body.data.pricePerDay).toBe(25);
    expect(res.body.data.rentalCharge).toBe(75);
    expect(res.body.data.securityDeposit).toBe(100);
    expect(res.body.data.totalAmount).toBe(175);
  });

  test('POST /api/rentals - Booking should decrease available stock by 1', async () => {
    const today = new Date();
    const twoDaysLater = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProduct._id,
        startDate: today.toISOString(),
        endDate: twoDaysLater.toISOString(),
        notes: 'Testing rental creation'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rental.bookingStatus).toBe('Confirmed');

    const updatedProduct = await Product.findById(testProduct._id);
    expect(updatedProduct.availableStock).toBe(1);
  });

  test('POST /api/rentals - Should prevent booking when availableStock is 0', async () => {
    testProduct.availableStock = 0;
    testProduct.status = 'Unavailable';
    await testProduct.save();

    const today = new Date();
    const twoDaysLater = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProduct._id,
        startDate: today.toISOString(),
        endDate: twoDaysLater.toISOString()
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Dispatch, Return Request, and Inventory Inspection Workflow', async () => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);

    // 1. Create booking
    const bookingRes = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProduct._id,
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString()
      });
    const rentalId = bookingRes.body.data.rental._id;

    // Check stock decreased
    let prod = await Product.findById(testProduct._id);
    expect(prod.availableStock).toBe(1);

    // 2. Dispatch rental (Admin or Inventory Manager)
    const dispatchRes = await request(app)
      .put(`/api/rentals/${rentalId}/dispatch`)
      .set('Authorization', `Bearer ${inventoryToken}`);
    expect(dispatchRes.statusCode).toBe(200);
    expect(dispatchRes.body.data.rental.bookingStatus).toBe('Dispatched');

    // 3. Customer requests return
    const returnReqRes = await request(app)
      .put(`/api/rentals/${rentalId}/return`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(returnReqRes.statusCode).toBe(200);
    expect(returnReqRes.body.data.rental.bookingStatus).toBe('Return Requested');

    // 4. Inventory Manager inspects returned product, checks condition, accepts return
    const inspectRes = await request(app)
      .put(`/api/rentals/${rentalId}/inspect`)
      .set('Authorization', `Bearer ${inventoryToken}`)
      .send({
        conditionAfter: 'Good',
        inspectionNotes: 'All checks passed. Light cosmetic scratch.',
        returnStatus: 'Accepted'
      });

    expect(inspectRes.statusCode).toBe(200);
    expect(inspectRes.body.data.rental.bookingStatus).toBe('Returned');
    expect(inspectRes.body.data.rental.returnStatus).toBe('Accepted');

    // 5. Stock should have increased back by 1 and condition updated
    prod = await Product.findById(testProduct._id);
    expect(prod.availableStock).toBe(2);
    expect(prod.condition).toBe('Good');
  });

  test('Overdue logic automatically identifies past-due rentals and applies late fees', async () => {
    const pastStart = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const pastDue = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days overdue

    const rental = await Rental.create({
      user: customerUser._id,
      product: testProduct._id,
      startDate: pastStart,
      endDate: pastDue,
      dueDate: pastDue,
      totalDays: 3,
      pricePerDay: 25,
      rentalCharge: 75,
      securityDeposit: 100,
      totalAmount: 175,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid'
    });

    const flagged = await checkAndUpdateOverdueRentals();
    expect(flagged).toBeGreaterThanOrEqual(1);

    const updatedRental = await Rental.findById(rental._id);
    expect(updatedRental.bookingStatus).toBe('Overdue');
    expect(updatedRental.lateDays).toBeGreaterThanOrEqual(2);
    expect(updatedRental.lateFee).toBeGreaterThan(0);
    expect(updatedRental.totalAmount).toBe(
      updatedRental.rentalCharge + updatedRental.securityDeposit + updatedRental.lateFee
    );
  });
});
