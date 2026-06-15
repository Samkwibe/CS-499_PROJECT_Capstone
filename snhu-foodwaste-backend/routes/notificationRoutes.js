/**
 * notificationRoutes.js
 * Routes for user notification preference management.
 *
 * This allows a user to toggle settings like receiving emails or SMS alerts.
 */

// Import Express so we can build our API paths.
const express = require('express');
// Create the router instance that connects URLs to controller functions.
const router = express.Router();

// Import the controller functions that do the actual work of reading and saving preferences.
const { getPreferences, updatePreferences } = require('../controllers/notificationController');

// Import the 'protect' middleware.
// We use this because a user must be logged in to see or change their preferences.
// We do NOT use 'authorize' here, because ALL users (students, staff, admin) have preferences.
const { protect } = require('../middleware/authMiddleware');

// GET /api/notifications/preferences
// Returns the currently logged-in user's notification settings.
router.get('/preferences', protect, getPreferences);

// PUT /api/notifications/preferences
// Saves new changes to the currently logged-in user's notification settings.
router.put('/preferences', protect, updatePreferences);

// Export the router so it can be mounted into the main application.
module.exports = router;
