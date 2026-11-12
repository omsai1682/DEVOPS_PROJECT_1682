const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const jwt = require('jsonwebtoken');
require('./setup');

describe('Product Management APIs & Role Authorization', () => {
  let adminToken, customerToken, inventoryToken;
  let adminUser, customerUser, inventoryUser;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Admin Tester',
      email: 'admin.test@example.com',
      password: 'Password@123',
      role: 'admin'
    });
    customerUser = await User.create({
      name: 'Customer Tester',
      email: 'cust.test@example.com',
      password: 'Password@123',
      role: 'customer'
    });
    inventoryUser = await User.create({
      name: 'Inventory Tester',
      email: 'inv.test@example.com',
      password: 'Password@123',
      role: 'inventory_manager'
    });

    const secret = process.env.JWT_SECRET || 'test_jwt_secret_devops_demo';
    adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, secret, { expiresIn: '1h' });
    customerToken = jwt.sign({ id: customerUser._id, role: 'customer' }, secret, { expiresIn: '1h' });
    inventoryToken = jwt.sign({ id: inventoryUser._id, role: 'inventory_manager' }, secret, { expiresIn: '1h' });
  });

  test('GET /api/products - Should retrieve list of products publicly', async () => {
    await Product.create({
      name: 'Sony Test Camera',
      category: 'Cameras',
      brand: 'Sony',
      pricePerDay: 50,
      stock: 2,
      availableStock: 2
    });

    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBe(1);
  });

  test('POST /api/products - Admin should be able to create product', async () => {
    const newProduct = {
      name: 'Apple MacBook Pro M3',
      category: 'Laptops',
      brand: 'Apple',
      pricePerDay: 55,
      securityDeposit: 350,
      stock: 3
    };

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newProduct);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.availableStock).toBe(3);
  });

  test('POST /api/products - Customer should be forbidden from creating product', async () => {
    const newProduct = {
      name: 'Unauthorized Laptop',
      category: 'Laptops',
      brand: 'Unknown',
      pricePerDay: 50,
      stock: 1
    };

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(newProduct);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('DELETE /api/products/:id - Only Admin can delete product', async () => {
    const product = await Product.create({
      name: 'Product to Delete',
      category: 'Speakers',
      brand: 'Bose',
      pricePerDay: 20,
      stock: 1,
      availableStock: 1
    });

    // Attempt delete with inventory manager token -> forbidden
    const invRes = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${inventoryToken}`);
    expect(invRes.statusCode).toBe(403);

    // Attempt delete with admin token -> success
    const adminRes = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.statusCode).toBe(200);
    expect(adminRes.body.success).toBe(true);
  });
});
