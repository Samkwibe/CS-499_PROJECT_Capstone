/**
 * feedbackRoutes.js
 * Routes for user feedback submission and retrieval.
 */

// Import the Express framework so we can make routes
const express = require('express');
// Create a new router object from Express to handle our endpoints
const router = express.Router();
// Import the feedback controller functions
const { submitFeedback, getAllFeedback } = require('../controllers/feedbackController');
// Import middleware to protect routes and check roles
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/feedback — Staff and admins can view all submitted feedback.
router.get('/', protect, authorize('staff', 'admin'), getAllFeedback);

// POST /api/feedback — Any authenticated user can submit feedback.
router.post('/', protect, submitFeedback);

// Export the router so we can import it into app.js
module.exports = router;
