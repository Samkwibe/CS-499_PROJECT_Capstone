/**
 * Vercel serverless entry point.
 *
 * - Validates required configuration first and answers with a clear 503 (instead of
 *   crashing) when something is missing.
 * - Connects to MongoDB (cached across warm invocations) and forwards requests to Express.
 * - Uses plain Node response methods (statusCode/setHeader/end) so it does not depend on
 *   Vercel's optional res.status()/res.json() helpers.
 * - GET /api/health reports only whether the service and database are available; the
 *   specific configuration problems are written to the server logs, never to the response.
 *
 * dotenv is loaded BEFORE requiring db.js so local runs can read snhu-foodwaste-backend/.env.
 * On Vercel, environment variables come from the project settings.
 */
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '..', 'snhu-foodwaste-backend', '.env')
});

const { getConfigProblems } = require('../snhu-foodwaste-backend/config/env');
const connectDB = require('../snhu-foodwaste-backend/config/db');
const app = require('../snhu-foodwaste-backend/app');

function sendJson(res, statusCode, body) {
  if (res.headersSent) return;
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function healthCheck(res, problems) {
  let database = 'not_checked';
  if (problems.length === 0) {
    try {
      await connectDB();
      database = 'connected';
    } catch (err) {
      console.error('Health check: database unreachable:', err.message);
      database = 'unreachable';
    }
  }
  const ok = problems.length === 0 && database === 'connected';
  if (!ok) {
    // Details stay in the server logs; the public response only says what is down.
    console.error('Health check failed:', JSON.stringify({ database, configProblems: problems }));
  }
  return sendJson(res, ok ? 200 : 503, {
    status: ok ? 'ok' : 'unavailable',
    database: database === 'connected' ? 'connected' : 'unavailable'
  });
}

module.exports = async (req, res) => {
  const pathname = (req.url || '/').split('?')[0];
  const problems = getConfigProblems();

  if (pathname === '/api/health') {
    return healthCheck(res, problems);
  }

  if (problems.length > 0) {
    console.error('Server configuration problems:', problems.join('; '));
    return sendJson(res, 503, {
      success: false,
      message: 'The server is not fully configured yet. Please try again later.'
    });
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB connection failed:', err.message);
    return sendJson(res, 503, {
      success: false,
      message: 'Database connection failed. Please try again in a moment.'
    });
  }

  // Express handles the request asynchronously; wait until the response is finished so
  // Vercel does not freeze the function before the reply is sent.
  return new Promise((resolve) => {
    res.once('finish', resolve);
    res.once('close', resolve);
    res.once('error', (err) => {
      console.error('Response stream error:', err.message);
      resolve();
    });
    try {
      app(req, res);
    } catch (err) {
      console.error('Unhandled request error:', err);
      sendJson(res, 500, { success: false, message: 'Internal server error' });
      resolve();
    }
  });
};
