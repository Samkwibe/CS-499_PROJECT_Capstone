// Import the mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Create a new schema (blueprint) for a Bin Setting
const BinSettingSchema = new mongoose.Schema({
  // Store the ID of the bin as a string
  binId: String,
  // Store the fullness threshold as a number (e.g., 80 for 80% full)
  threshold: Number,
  // Store any extra notes about the bin as a string
  notes: String,
  // Reference the User who manages this bin
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// Automatically add createdAt and updatedAt timestamps to the document
}, { timestamps: true });

// Export the model so we can use it in our controllers
module.exports = mongoose.model('BinSetting', BinSettingSchema);
