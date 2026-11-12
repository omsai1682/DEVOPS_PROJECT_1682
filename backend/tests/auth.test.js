const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Authentication & Authorization APIs', () => {
  const testCustomer = {
    name: 'Test Customer',
    email: 'customer.test@example.com',
    password: 'Password@123',
    phone: '1234567890'
  };

  test('POST /api/auth/register - Should register a new customer', async () => {
    const res = await request(app).post('/api/auth/register').send(testCustomer);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testCustomer.email);
    expect(res.body.data.user.role).toBe('customer');
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  test('POST /api/auth/register - Should fail on duplicate email', async () => {
    await request(app).post('/api/auth/register').send(testCustomer);
    const res = await request(app).post('/api/auth/register').send(testCustomer);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - Should log in with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(testCustomer);

    const res = await request(app).post('/api/auth/login').send({
      email: testCustomer.email,
      password: testCustomer.password
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testCustomer.email);
  });

  test('POST /api/auth/login - Should reject incorrect password', async () => {
    await request(app).post('/api/auth/register').send(testCustomer);

    const res = await request(app).post('/api/auth/login').send({
      email: testCustomer.email,
      password: 'WrongPassword'
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Should get profile with valid token', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testCustomer);
    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testCustomer.email);
  });

  test('GET /api/auth/me - Should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
