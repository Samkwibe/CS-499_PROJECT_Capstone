import mongoose from 'mongoose';
import { jest } from '@jest/globals';

// Set longer timeout for all tests (10 seconds)
jest.setTimeout(10000);

// Mock console methods to keep test output clean
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Setup MongoDB memory server for testing
let mongoServer;
beforeAll(async () => {
  // If you want to use MongoDB Memory Server (recommended)
  if (process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGO_URI = uri;
  }

  // Connect to database
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect from database
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Add global test utilities
global.testUtils = {
  createTestUser: async (userData = {}) => {
    const User = mongoose.model('User');
    return await User.create({
      name: 'Test User',
      email: 'test@snhu.edu',
      password: 'testpassword123',
      role: 'student',
      ...userData,
    });
  },
  getAuthToken: async (user) => {
    // Implement your JWT token generation logic here
    return 'mock-token';
  },
};