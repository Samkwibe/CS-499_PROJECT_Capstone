/**
 * authController.js
 * Contains the controller logic for user authentication, registration, and profile management.
 */

// ==========================================
// Dependencies
// ==========================================
const User = require('../models/User'); // User model for database operations
const bcrypt = require('bcryptjs'); // Library for hashing and comparing passwords
const jwt = require('jsonwebtoken'); // Library for generating JSON Web Tokens

// ==========================================
// Helper Functions
// ==========================================

/**
 * Generates a signed JSON Web Token (JWT) for a user.
 * 
 * @param {string} id - The user's unique database ID.
 * @param {string} role - The user's role (e.g., 'student', 'staff').
 * @returns {string} The signed JWT token string.
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, // Payload to encode in the token
    process.env.JWT_SECRET, // Secret key used to sign the token
    { expiresIn: '30d' } // Token expiration time (30 days)
  );
};

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
  // Extract user details from the request body
  const { name, email, password, role } = req.body;
  
  try {
    // 1. Check if a user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 2. Hash the user's password for secure storage
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create and save the new user to the database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student' // Default to 'student' if no role is provided
    });

    // 4. Generate an authentication token for the newly registered user
    const token = generateToken(user._id, user.role);

    // 5. Respond with the user data and token (excluding the password)
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    console.error('Error during user registration:', err);
    res.status(500).json({ message: 'Server error' });
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
  const { email, password } = req.body;

  try {
    // 1. Find the user by email, and explicitly select the password field
    // (assuming password has 'select: false' in the model definition)
    const user = await User.findOne({ email }).select('+password');
    
    // If no user is found, return an unauthorized error
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate an authentication token for the verified user
    const token = generateToken(user._id, user.role);

    // 4. Respond with the user data and token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    console.error('Error during user login:', err);
    res.status(500).json({ message: 'Server error' });
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
    // The req.user is populated by the `protect` middleware
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({ message: 'Server error' });
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
    // Find the user by ID and apply the updates provided in req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body }, // Only update the provided fields
      { new: true } // Return the updated document rather than the original
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==========================================
// Module Exports
// ==========================================
module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile
};