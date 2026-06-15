/**
 * userController.js
 * Admin-level user management operations.
 *
 * Note: Authentication (login/register) is handled by authController.js.
 * This file is for admin tasks like listing accounts and deactivating users.
 */

const User = require('../models/User');

/**
 * @desc    Get all user accounts (admin dashboard)
 * @route   GET /api/users
 * @access  Private (admin)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role createdAt');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve users' });
  }
};

/**
 * @desc    Delete a user account (admin only)
 * @route   DELETE /api/users/:id
 * @access  Private (admin)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admins from accidentally deleting their own account.
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

module.exports = {
  getAllUsers,
  deleteUser
};
