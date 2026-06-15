/**
 * tipRoutes.js
 * Routes for sustainability tips.
 */

// Import the Express framework so we can make our web routes
const express = require('express');
// Create a new router object from Express
const router = express.Router();
// Import the tips controller functions
const { getTips, createTip } = require('../controllers/tipsController');
// Import middleware for JWT protection and role checking
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/tips — Anyone can read tips (public route).
router.get('/', getTips);

// POST /api/tips — Only staff and admin can create new tips.
router.post('/', protect, authorize('staff', 'admin'), createTip);

// Export the router so we can import it into the main app file
module.exports = router;
