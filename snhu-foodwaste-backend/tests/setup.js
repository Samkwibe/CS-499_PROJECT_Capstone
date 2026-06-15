jest.setTimeout(10000);

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

beforeEach(() => {
  jest.clearAllMocks();
});