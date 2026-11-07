/**
 * authController.js
 * Contains the controller logic for user authentication, registration, and profile management.
 * This file acts as the middleman between the authRoutes and the database.
 */

// ==========================================
// Dependencies
// ==========================================
// Import the User model so we can read and write user data in the database.
const User = require('../models/User'); 
// Import bcryptjs, which is a library we use to scramble (hash) passwords for security.
// Without this, passwords would be saved as plain text, which is very dangerous.
const bcrypt = require('bcryptjs'); 
// Import the centralised token generator so all auth flows share one signing config.
// We use this to generate the digital ID badge (JWT) when someone logs in.
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

// Staff accounts can create, edit and delete records, so self-registration as staff
// requires a sign-up code that only the site owner knows (set STAFF_SIGNUP_CODE in the
// environment). If the variable is not set, staff self-registration is disabled.
const isValidStaffCode = (provided) => {
  const expected = process.env.STAFF_SIGNUP_CODE;
  if (!expected || typeof provided !== 'string' || provided.length === 0) return false;
  const a = crypto.createHash('sha256').update(provided).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
};

// Fields a user is allowed to change on their own profile. Everything else
// (role, password, email, isActive, ...) is ignored to prevent privilege escalation.
const PROFILE_FIELDS = ['name', 'themePreference', 'notificationPreferences'];

// A helper function to easily send back a standardized error message.
// This keeps our code clean so we don't have to rewrite this block every time an error happens.
const sendError = (res, statusCode, message) => res.status(statusCode).json({
  success: false,
  message
});

// ==========================================
// Controller Actions
// ==========================================

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 * 
 * Creates a new user in the database, hashes their password, and returns a JWT token.
 */
const registerUser = async (req, res) => {
  // Extract user details from the request body sent by the frontend form.
  const { name, email, password, role, staffCode } = req.body;
  // If no role is provided, we assume they are a regular student.
  const requestedRole = role || 'student';
  
  try {
    // Only allow 'student' or 'staff' to register this way. Admins have to be created manually.
    if (!['student', 'staff'].includes(requestedRole)) {
      return sendError(res, 400, 'Invalid registration role');
    }

    // Basic input validation with clear messages (the stored password is a hash, so
    // the schema cannot enforce the plain-text length itself).
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return sendError(res, 400, 'Name, email, and password are required');
    }
    if (password.length < 8) {
      return sendError(res, 400, 'Password must be at least 8 characters');
    }

    // Staff sign-up needs the owner's staff sign-up code.
    if (requestedRole === 'staff' && !isValidStaffCode(staffCode)) {
      return sendError(res, 403, 'A valid staff sign-up code is required to register as staff');
    }

    // 1. Check if a user with the given email already exists in the database.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If the email is found, we stop and send an error.
      return sendError(res, 400, 'Email already registered');
    }

    // 2. Hash the user's password for secure storage.
    // The "salt" adds random data to the hash to make it even harder to crack.
    const salt = await bcrypt.genSalt(10); 
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create and save the new user to the database using the scrambled password.
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: requestedRole
    });

    // 4. Generate an authentication token for the newly registered user.
    // This allows them to stay logged in right after signing up.
    const token = generateToken(user._id, user.role);

    // 5. Respond with the user data and token (excluding the password for security).
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    // Schema validation problems (bad email format, name too short, ...) are the user's input.
    if (err && err.name === 'ValidationError') {
      const first = Object.values(err.errors || {})[0];
      return sendError(res, 400, (first && first.message) || 'Invalid registration details');
    }
    if (err && err.code === 11000) {
      return sendError(res, 400, 'Email already registered');
    }
    // If anything goes wrong, log the error to the console and tell the frontend there was a problem.
    console.error('Error during user registration:', err);
    sendError(res, 500, 'Server error');
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 * 
 * Verifies user credentials and returns a JWT token upon successful login.
 */
const loginUser = async (req, res) => {
  // Extract the email and password the user typed into the login form.
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return sendError(res, 400, 'Email and password are required');
  }

  try {
    // 1. Find the user by email, and explicitly select the password field.
    // (We hide the password by default, so we have to explicitly ask for it here to check it).
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password +isActive');
    
    // If no user is found with that email, return an error.
    // Deactivated accounts are treated the same as unknown accounts.
    if (!user || user.isActive === false) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // 2. Compare the provided password with the hashed password in the database.
    // bcrypt handles the math to check if the plain text matches the scrambled hash.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // If the passwords don't match, return an error.
      return sendError(res, 401, 'Invalid credentials');
    }

    // 3. Generate an authentication token for the verified user.
    const token = generateToken(user._id, user.role);

    // 4. Respond with the user data and token so the frontend can save it.
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    console.error('Error during user login:', err);
    sendError(res, 500, 'Server error');
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 * 
 * Returns the profile of the currently authenticated user based on their JWT token.
 */
const getCurrentUser = async (req, res) => {
  try {
    // The req.user is populated by the `protect` middleware before it gets here.
    // We look up the user by their ID, but we make sure NOT to return their password.
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Error fetching current user:', err);
    sendError(res, 500, 'Server error');
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 * 
 * Updates the details of the currently authenticated user.
 */
const updateUserProfile = async (req, res) => {
  try {
    // Find the user by ID and apply the updates provided in req.body.
    // Only copy allowed fields. Sending role/password/email/isActive here does nothing.
    const updates = {};
    for (const field of PROFILE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, `Nothing to update. Allowed fields: ${PROFILE_FIELDS.join(', ')}`);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true } // Return the updated document and validate it.
    ).select('-password'); // Exclude the password from the response.
    
    res.json(user);
  } catch (err) {
    if (err && err.name === 'ValidationError') {
      return sendError(res, 400, 'Invalid profile details');
    }
    console.error('Error updating user profile:', err);
    sendError(res, 500, 'Server error');
  }
};

// ==========================================
// Module Exports
// ==========================================
// We have to export these functions so the authRoutes.js file can connect them to the URLs.
module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile
};