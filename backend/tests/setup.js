const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
jest.setTimeout(180000);

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_devops_demo';
  process.env.LATE_FEE_MULTIPLIER = '1.5';

  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  } catch (err) {
    // If MongoMemoryServer has binary download issues on Windows, fallback to local test database
    console.warn('MongoMemoryServer fallback to local test DB:', err.message);
    const fallbackUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/electronic_rental_test';
    await mongoose.connect(fallbackUri);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
