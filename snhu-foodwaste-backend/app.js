/**
 * app.js
 * Configures and exports the Express application without starting the server.
 * Keeping this separate from server.js makes the API easier to test.
 */

// Import Express, which is the web framework that creates the API application.
const express = require('express');
// Import CORS so the frontend can communicate with the backend from another origin during development.
const cors = require('cors');
// Import Helmet to add safer HTTP headers automatically.
// This helps protect the app from common web vulnerabilities.
const helmet = require('helmet');
// Import rate limiting to slow down repeated requests from the same client.
// This stops attackers from spamming the server or guessing passwords.
const rateLimit = require('express-rate-limit');
// Import Mongo sanitization to remove dangerous MongoDB operators from user input.
// It protects the database from malicious input attacks (NoSQL injection).
const mongoSanitize = require('express-mongo-sanitize');
// Import XSS cleaning to reduce cross-site scripting risk in submitted data.
// It strips out malicious scripts that attackers might try to hide in text fields.
const xss = require('xss-clean');
// Import compression so API responses can be sent more efficiently.
// This shrinks the size of data sent over the network, making the app faster.
const compression = require('compression');
// Import Morgan so requests are logged while developing.
// It prints out information about every request to the terminal so we can debug.
const morgan = require('morgan');
// Import path so Express can safely serve the frontend folder.
const path = require('path');

// Create one Express application instance that routes and tests can use.
// This is the core object we use to configure the whole backend.
const app = express();

// Enable cross-origin requests so the frontend pages can call this API.
// Without this, the browser would block requests coming from different ports or domains.
app.use(cors());

// Add common security headers to every response while allowing the existing frontend assets to load.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Allow scripts from our own server and specific trusted CDNs (like for Bootstrap).
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
      scriptSrcAttr: ["'unsafe-inline'"],
      // Allow styles from our own server and Google Fonts.
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
      // Allow fonts from Google.
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com', 'data:'],
      // Allow images from our own server.
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"]
    }
  }
}));

// Limit repeated requests to reduce brute-force and spam behavior.
// If someone tries to hit the API too fast, this will block them temporarily.
app.use(rateLimit({
  // This creates a 15-minute window for counting requests.
  windowMs: 15 * 60 * 1000,
  // Each IP can make 100 requests per 15-minute window.
  max: 100,
  // Use modern rate-limit response headers so the client knows their limit.
  standardHeaders: true,
  // Do not send older legacy rate-limit headers.
  legacyHeaders: false
}));

// Parse incoming JSON request bodies so controllers can read req.body.
// Without this, we couldn't read the data sent from frontend forms.
app.use(express.json());

// This cleans up incoming data by removing special characters like $ and .
// It protects the database from malicious input attacks.
app.use(mongoSanitize());

// Clean submitted text to reduce the chance of XSS payloads reaching the database.
// This stops hackers from saving JavaScript code into our database.
app.use(xss());

// Compress responses to make the API more efficient.
// Makes the website load faster by sending smaller amounts of data.
app.use(compression());

// Morgan logs every request in development, but it is skipped during tests to keep test output clean.
if (process.env.NODE_ENV !== 'test') {
  // Logs things like "GET /api/waste 200 OK" to the console.
  app.use(morgan('dev'));
}

// ==========================================
// API Routes
// ==========================================

// Mount authentication routes under /api/auth.
// All login and signup requests will go here.
app.use('/api/auth', require('./routes/authRoutes'));

// Mount feedback routes under /api/feedback.
// Handles user feedback submissions.
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Mount sustainability tip routes under /api/tips.
app.use('/api/tips', require('./routes/tipRoutes'));

// Mount AI chat assistant route under /api/chat.
app.use('/api/chat', require('./routes/chatRoutes'));

// Mount food waste, reporting, and priority routes under /api/waste.
// This is where the core functionality of our app lives.
app.use('/api/waste', require('./routes/foodWasteRoutes'));

// Mount staff management routes under /api/staff (admin only).
// Allows admins to see the list of staff members.
app.use('/api/staff', require('./routes/staffRoutes'));

// Mount user administration routes under /api/users (admin only).
// Allows admins to manage all user accounts.
app.use('/api/users', require('./routes/userRoutes'));

// Mount notification preference routes under /api/notifications (any authenticated user).
// Allows users to manage how they receive alerts.
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Serve the static frontend from the public folder so the app can be tested from one local URL.
// This means going to localhost:5001 will load the HTML files in the public folder.
app.use(express.static(path.join(__dirname, '..', 'public')));

// This health-check route confirms that the backend is running.
// If you visit / in the API directly, you will see this message.
app.get('/', (req, res) => {
  res.send('SNHU Food Waste Tracker Backend is running!');
});

// This is the final fallback error handler for unexpected Express errors.
// If something breaks in our code, this stops the server from crashing completely.
app.use((err, req, res, _next) => {
  // Log the full stack trace for debugging on the server side.
  console.error('Unhandled Exception:', err.stack);
  // Send a safe generic message back to the client.
  res.status(500).json({ error: 'Internal Server Error: Something went wrong!' });
});

// Export the app so server.js can start it and tests can import it without opening a port.
module.exports = app;
