const mongoose = require('mongoose');
const connectDB = require('../config/db');

jest.mock('mongoose', () => ({
  connect: jest.fn()
}));

describe('connectDB', () => {
  beforeEach(() => {
    global.mongoose = { conn: null, promise: null };
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.mongoose = { conn: null, promise: null };
  });

  it('connects to MongoDB when MONGODB_URI is provided', async () => {
    const connectSpy = jest.spyOn(mongoose, 'connect').mockResolvedValueOnce({});
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    process.env.MONGODB_URI = 'mongodb://validuri';
    await connectDB();

    expect(connectSpy).toHaveBeenCalledWith('mongodb://validuri', { bufferCommands: false });
    expect(consoleSpy).toHaveBeenCalledWith('MongoDB connected successfully');
  });

  it('throws when MongoDB URI is missing', async () => {
    delete process.env.MONGODB_URI;
    delete process.env.MONGO_URI;

    await expect(connectDB()).rejects.toThrow('MONGODB_URI (or MONGO_URI) is not configured');
  });

  it('throws when MongoDB connection fails', async () => {
    jest.spyOn(mongoose, 'connect').mockRejectedValueOnce(new Error('Invalid URI'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    process.env.MONGODB_URI = 'mongodb://bad-uri';
    await expect(connectDB()).rejects.toThrow('Invalid URI');

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
