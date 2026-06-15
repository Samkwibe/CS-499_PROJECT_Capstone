/**
 * authMiddleware.js
 * Middleware for securing routes via JWT authentication and role-based authorization.
 */

// ==========================================
// Dependencies
// ==========================================
const jwt = require('jsonwebtoken'); // Library to sign and verify JSON Web Tokens
const User = require('../models/User'); // Mongoose model for User to retrieve user details

// ==========================================
// Authentication Middleware
// ==========================================

/**
 * Protects routes by requiring a valid JWT.
 * 
 * This middleware checks the `Authorization` header for a Bearer token,
 * verifies its signature, decodes the user payload, and attaches the
 * full user object to the request (`req.user`) for use in downstream controllers.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const protect = async (req, res, next) => {
  let token;
  
  // Verify that the Authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the raw token string (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];
      
      // Verify the token signature using the secret key from environment variables
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch the user from the database using the ID embedded in the token payload.
      // We exclude the password field from the result for security.
      req.user = await User.findById(decoded.id).select('-password');
      
      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      // Catch any token verification errors (e.g., expired, invalid signature)
      console.error('Token verification error:', error);
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, invalid or expired token'
      });
    }
  }
  
  // If no token was found in the headers at all, deny access immediately
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token provided in headers' 
    });
  }
};

// ==========================================
// Role-based Authorization Middleware
// ==========================================

/**
 * Authorizes users based on their assigned roles.
 * Must be used AFTER the `protect` middleware to ensure `req.user` is populated.
 * 
 * @param {...string} roles - A list of allowed roles (e.g., 'admin', 'staff')
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user object exists and if their role is included in the allowed list
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access forbidden. Required roles: ${roles.join(', ')}`
      });
    }
    
    // User possesses the required role, proceed to the route handler
    next();
  };
};

// Export the middleware functions for use in route definitions
module.exports = { protect, authorize };