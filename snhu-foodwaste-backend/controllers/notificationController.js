/**
 * notificationController.js
 * Handles notification preference management for users.
 *
 * Future work: Integrate with an email or SMS service to send real alerts
 * when bin fullness exceeds thresholds or priority entries are created.
 */

const User = require('../models/User');

/**
 * @desc    Get the current user's notification preferences
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user.notificationPreferences });
  } catch (err) {
    console.error('Error fetching notification preferences:', err.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve preferences' });
  }
};

/**
 * @desc    Update the current user's notification preferences
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
const updatePreferences = async (req, res) => {
  try {
    const { email, sms, highPriority } = req.body;
    const updates = {};

    if (typeof email === 'boolean') updates['notificationPreferences.email'] = email;
    if (typeof sms === 'boolean') updates['notificationPreferences.sms'] = sms;
    if (typeof highPriority === 'boolean') updates['notificationPreferences.highPriority'] = highPriority;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid preference fields provided' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('notificationPreferences');

    res.json({ success: true, data: user.notificationPreferences });
  } catch (err) {
    console.error('Error updating notification preferences:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
};

module.exports = {
  getPreferences,
  updatePreferences
};
