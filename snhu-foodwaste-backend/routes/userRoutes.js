/**
 * userRoutes.js
 * Routes for admin-level user management.
 *
 * These endpoints let administrators list all accounts and remove users.
 * This is different from authRoutes.js, which handles people logging themselves in.
 */

// Import Express to get access to the routing system.
const express = require('express');
// Create a router object to define our paths.
const router = express.Router();

// Import the user management functions from the controller.
const { getAllUsers, deleteUser } = require('../controllers/userController');

// Import our custom security functions.
// 'protect' verifies the JWT token (proves who the user is).
// 'authorize' makes sure their role is exactly what we require (in this case, 'admin').
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/users
// An admin uses this to get a master list of every registered account (students, staff, and other admins).
// It's heavily protected so regular users can't download the user list.
router.get('/', protect, authorize('admin'), getAllUsers);

// DELETE /api/users/:id
// An admin uses this to permanently delete a user account from the database.
// The ':id' in the URL is replaced by the actual database ID of the user they want to delete.
router.delete('/:id', protect, authorize('admin'), deleteUser);

// Export the router so app.js can use it.
module.exports = router;
