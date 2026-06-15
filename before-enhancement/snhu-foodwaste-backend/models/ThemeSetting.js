// Import mongoose to work with the database
const mongoose = require('mongoose');

// Define a schema to save the user's visual theme preference
const ThemeSettingSchema = new mongoose.Schema({
  // Reference the specific user by their ID
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Save the theme as either 'light' or 'dark', defaulting to 'light'
  theme: { type: String, enum: ['light', 'dark'], default: 'light' }
// Automatically add createdAt and updatedAt timestamps
}, { timestamps: true });

// Export the ThemeSetting model so other files can use it
module.exports = mongoose.model('ThemeSetting', ThemeSettingSchema);
