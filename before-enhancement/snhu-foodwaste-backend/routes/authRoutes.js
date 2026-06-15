// Import the Express framework to create web server routes
const express = require('express');
// Create a new router object from Express to define our routes
const router = express.Router();

// Import the specific controller functions we need from authController.js
const { 
  // Import the registerUser function to handle new signups
  registerUser, 
  // Import the loginUser function to handle logging in
  loginUser,
  // Import the getCurrentUser function to get the logged-in user's data
  getCurrentUser,
  // Import the updateUserProfile function to allow users to change their data
  updateUserProfile
// Specify the path to the authController file
} = require('../controllers/authController');

// Import our custom middleware functions to protect routes
const { 
  // Import protect to make sure a user is logged in
  protect, 
  // Import authorize to make sure a user has the right role (like admin)
  authorize 
// Specify the path to the authMiddleware file
} = require('../middleware/authMiddleware');

// =====================================
// Public Routes (No authentication needed)
// =====================================

// Define a POST route for '/register' that calls the registerUser controller
router.post('/register', registerUser);
// Define a POST route for '/login' that calls the loginUser controller
router.post('/login', loginUser);

// =====================================
// Protected Routes (Require valid JWT)
// =====================================

// Define a GET route for '/me' that runs the 'protect' middleware first, then getCurrentUser
router.get('/me', protect, getCurrentUser);
// Define a PUT route for '/profile' that runs 'protect' first, then updateUserProfile
router.put('/profile', protect, updateUserProfile);

// =====================================
// Admin-only Route Example
// =====================================

// Define a GET route for '/admin'
// First it runs 'protect' to make sure the user is logged in
// Then it runs 'authorize('admin')' to make sure they are an admin
// Finally, it runs an inline function taking request (req) and response (res)
router.get('/admin', protect, authorize('admin'), (req, res) => {
  // Send back a JSON response with a success message
  res.json({ message: 'Admin dashboard' });
});

// Export the router so it can be used in server.js
module.exports = router;