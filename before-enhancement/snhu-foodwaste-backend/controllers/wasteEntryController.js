// Note: This file seems to contain database connection logic instead of a controller!

// Import the mongoose library to interact with MongoDB
const mongoose = require('mongoose');
// Load environment variables from the .env file so we can securely access our database URL
require('dotenv').config();

// Define an asynchronous function to connect to the database
const connectDB = async () => {
  // Start a try block to catch any errors during connection
  try {
    // Wait for mongoose to connect using the URI stored in our environment variables
    await mongoose.connect(process.env.MONGODB_URI, {
      // Use the new URL string parser (recommended by MongoDB)
      useNewUrlParser: true,
      // Use the new server discovery and monitoring engine (recommended by MongoDB)
      useUnifiedTopology: true,
    });

    // If the connection is successful, print this success message to the console
    console.log('🚀 MongoDB connected successfully');
  // Catch any errors that happen in the try block
  } catch (error) {
    // Print the error message to the console so we know what went wrong
    console.error('❌ MongoDB connection error:', error);
    // Exit the Node.js process with a failure code (1) because the app cannot run without a database
    process.exit(1);
  }
};

// Export the connectDB function so it can be used in other files (like server.js)
module.exports = connectDB;
