/**
 * server.js
 * Entry point for the SNHU Food Waste Tracker Backend Application.
 * This file configures the Express server, connects to MongoDB, sets up middleware,
 * and defines the main API routes.
 */

// ==========================================
// Module Dependencies
// ==========================================
const express = require('express'); // Express web framework for handling HTTP requests
const cors = require('cors');       // CORS middleware to allow cross-origin requests from the frontend
const dotenv = require('dotenv');   // Dotenv for loading environment variables from a .env file
const mongoose = require('mongoose'); // Mongoose for MongoDB object modeling

// ==========================================
// Configuration & Setup
// ==========================================

// Load environment variables from the .env file into process.env
dotenv.config();

// Initialize the Express application instance
const app = express();

// ==========================================
// Global Middleware Configuration
// ==========================================

// Enable CORS for all routes (allows the frontend on a different port to communicate with this API)
app.use(cors());

// Parse incoming JSON payloads in the request body (populates req.body)
app.use(express.json());

// ==========================================
// Database Connection
// ==========================================

/**
 * Connects the application to the MongoDB database using Mongoose.
 * It uses the connection string defined in the environment variables.
 * If the connection fails, the process exits to prevent the app from running in a broken state.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to the database (fall back to MONGO_URI if MONGODB_URI is not set)
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected successfully.');
  } catch (err) {
    // Log the error and terminate the process if connection fails
    console.error('❌ Database connection error:', err.message);
    process.exit(1); // Quit the app if DB connection fails
  }
};

// Execute the database connection function
connectDB();

// ==========================================
// API Routes
// ==========================================

// Mount authentication-related routes (login, registration)
app.use('/api/auth', require('./routes/authRoutes'));

// Mount feedback-related routes
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Mount sustainability tips-related routes
app.use('/api/tips', require('./routes/tipRoutes'));

// Mount food waste data tracking routes
app.use('/api/waste', require('./routes/wasteRoutes'));

// ==========================================
// Base/Health-check Route
// ==========================================

// Simple test route to verify the server is running and accessible
app.get('/', (req, res) => {
  res.send('🌎 SNHU Food Waste Tracker Backend is running!');
});

// ==========================================
// Error Handling
// ==========================================

/**
 * Global error handling middleware.
 * Catches unhandled errors thrown in routes and sends a standard 500 response.
 */
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Exception:', err.stack);
  res.status(500).json({ error: 'Internal Server Error: Something went wrong!' });
});

// ==========================================
// Server Initialization
// ==========================================

// Define the port, defaulting to 5001 if not specified in the environment
const PORT = process.env.PORT || 5001;

// Start listening for incoming HTTP requests
app.listen(PORT, () => {
  console.log(`🚀 Server running and listening on port ${PORT}`);
});
