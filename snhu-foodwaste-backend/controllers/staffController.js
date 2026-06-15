/**
 * staffController.js
 * Handles staff-specific management operations.
 *
 * Current scope: Listing staff members for the admin dashboard.
 * Future work: Add endpoints for assigning staff to specific bin zones,
 * viewing staff activity logs, and managing shift schedules.
 */

// Import the User model so we can look up staff members in the database.
const User = require('../models/User');

/**
 * @desc    Get all staff members (admin view)
 * @route   GET /api/staff
 * @access  Private (admin)
 */
const getStaffList = async (req, res) => {
  try {
    // We ask MongoDB to find all users where their role is exactly 'staff'.
    // The .select() part makes sure we only get the fields we need (name, email, role, date)
    // and keeps things like passwords safe by not including them.
    const staff = await User.find({ role: 'staff' }).select('name email role createdAt');
    
    // We send back a JSON response with success=true, the total number of staff, and the actual data array.
    res.json({ success: true, count: staff.length, data: staff });
  } catch (err) {
    // If the database has an error, we log it and send a 500 error to the client.
    console.error('Error fetching staff list:', err.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve staff list' });
  }
};

/**
 * @desc    Assign a staff member to a bin zone (planned feature)
 * @route   PUT /api/staff/:id/assign
 * @access  Private (admin)
 */
const assignBin = async (req, res) => {
  // We send a 501 "Not Implemented" status because we haven't built this feature yet.
  // It gives the frontend a clean message to show the admin instead of just crashing.
  res.status(501).json({
    success: false,
    message: 'Bin zone assignment is planned for a future release. '
           + 'Staff members currently self-select locations when entering waste data.'
  });
};

// Export the functions so our staffRoutes.js file can access them.
module.exports = {
  getStaffList,
  assignBin
};
