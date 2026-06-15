// Import the mongoose library to connect and talk to MongoDB
const mongoose = require('mongoose');

// Create a new schema (blueprint) to define what a Feedback document looks like
const FeedbackSchema = new mongoose.Schema({
  // Store the user who submitted the feedback (must be provided)
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Store the actual feedback text
  content: String,
  // Store a number rating (like 1 to 5 stars)
  rating: Number
// Automatically track when the feedback was created or updated
}, { timestamps: true });

// Export the mongoose model to use it in other files
module.exports = mongoose.model('Feedback', FeedbackSchema);
