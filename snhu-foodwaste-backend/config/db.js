const mongoose = require('mongoose');

if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config();
}

function getCache() {
  if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
  }
  return global.mongoose;
}

const connectDB = async () => {
  const cached = getCache();

  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGODB_URI (or MONGO_URI) is not configured');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000
    }).then((connection) => {
      console.log('MongoDB connected successfully');
      return connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error.message);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
