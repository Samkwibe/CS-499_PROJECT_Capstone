const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages. Please wait a few minutes before continuing.' }
});

// POST /api/chat — authenticated users only, rate-limited
router.post('/', protect, chatLimiter, chat);

module.exports = router;
