/**
 * Vercel serverless entry point.
 * Connects to MongoDB (cached across warm invocations) and forwards requests to Express.
 *
 * IMPORTANT: dotenv must be loaded BEFORE requiring db.js because db.js reads
 * process.env.MONGODB_URI at module-load time when running outside of Vercel.
 * On Vercel itself, environment variables are injected via the dashboard.
 */
const path = require('path');

// Load environment variables from the backend .env file.
// This is the first thing that runs so that all downstream requires
// can read MONGODB_URI and JWT_SECRET from process.env.
require('dotenv').config({
  path: path.join(__dirname, '..', 'snhu-foodwaste-backend', '.env')
});

const connectDB = require('../snhu-foodwaste-backend/config/db');
const app = require('../snhu-foodwaste-backend/app');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB connection failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please try again in a moment.'
    });
  }
  // Vercel serverless functions in Node.js exit when the exported async function returns.
  // Express handles requests asynchronously, meaning app(req, res) returns undefined immediately.
  // We MUST wrap it in a Promise that waits for the 'finish' event so Vercel doesn't kill the
  // process before Express sends the JSON response back to the frontend.
  return new Promise((resolve, reject) => {
    res.once('finish', resolve);
    res.once('error', reject);
    app(req, res);
  });
};
