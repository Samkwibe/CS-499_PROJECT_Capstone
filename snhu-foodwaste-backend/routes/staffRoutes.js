/**
 * staffRoutes.js
 * Routes for staff-specific management operations.
 *
 * All routes here require the user to be logged in and have an 'admin' role.
 */

// Import Express so we can use its router features.
const express = require('express');
// Create a new router instance to attach our paths to.
const router = express.Router();

// Import the specific controller functions that hold the logic for these routes.
// We keep logic in controllers so this route file stays clean and easy to read.
const { getStaffList, assignBin } = require('../controllers/staffController');

// Import our security middleware. 
// 'protect' checks if the user has a valid login token.
// 'authorize' checks if they have the specific role we demand (like 'admin').
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/staff
// When an admin wants to see a list of all staff members, this route handles it.
// Without 'protect' and 'authorize', anyone on the internet could see the staff list.
router.get('/', protect, authorize('admin'), getStaffList);

// PUT /api/staff/:id/assign
// This route is meant for an admin to assign a staff member to a specific area (like 'Dining Hall A').
// The :id part of the URL changes depending on which staff member is being updated.
router.put('/:id/assign', protect, authorize('admin'), assignBin);

// Export the router so it can be added to the main application in app.js.
module.exports = router;
