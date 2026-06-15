/**
 * feedbackController.js
 * Handles user feedback submissions and retrieval.
 */

const Feedback = require('../models/Feedback');

/**
 * @desc    Submit new feedback from a logged-in user
 * @route   POST /api/feedback
 * @access  Private (any authenticated user)
 */
const submitFeedback = async (req, res) => {
  try {
    const { content, rating } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Feedback content is required' });
    }

    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
    }

    const feedback = await Feedback.create({
      submittedBy: req.user._id,
      content: content.trim(),
      rating: rating || undefined
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    console.error('Error submitting feedback:', err.message);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
};

/**
 * @desc    Get all feedback entries (staff/admin view)
 * @route   GET /api/feedback
 * @access  Private (staff, admin)
 */
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('submittedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: feedback.length, data: feedback });
  } catch (err) {
    console.error('Error retrieving feedback:', err.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve feedback' });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback
};
