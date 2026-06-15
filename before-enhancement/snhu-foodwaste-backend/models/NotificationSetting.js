// Import mongoose to connect to the database
const mongoose = require('mongoose');

// Define a schema (structure) for the user's notification settings
const NotificationSettingSchema = new mongoose.Schema({
  // Reference the specific user these settings belong to
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Boolean flag to turn email notifications on or off
  emailNotifications: Boolean,
  // Boolean flag to turn SMS/text notifications on or off
  smsNotifications: Boolean,
  // Boolean flag for receiving urgent high-priority alerts
  highPriorityAlerts: Boolean
});

// Export the model so it can be used throughout the app
module.exports = mongoose.model('NotificationSetting', NotificationSettingSchema);
