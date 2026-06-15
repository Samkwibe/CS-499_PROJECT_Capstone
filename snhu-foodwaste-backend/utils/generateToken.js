// This file creates a helper function that makes login tokens (JWTs).
// A JWT (JSON Web Token) is like a digital ID badge that proves a user is logged in.
// Before this file existed, the same token-making code was copied inside authController.js.
// By putting it here in one place, we follow the DRY principle (Don't Repeat Yourself)
// so if we ever need to change how tokens work, we only change it in one spot.

// Import the jsonwebtoken library so we can create signed tokens.
// Without this, we would have no way to generate secure login tokens.
const jwt = require('jsonwebtoken');

/**
 * generateToken - Creates a signed JWT for a user after they log in or sign up.
 *
 * @param {string} id   - The user's unique ID from MongoDB (their _id field).
 * @param {string} role - The user's role, like 'student', 'staff', or 'admin'.
 * @returns {string} A signed token string that the frontend stores and sends back
 *                   with every future request to prove the user is logged in.
 */
const generateToken = (id, role) => {
  // jwt.sign() takes three arguments:
  //   1. The payload - the data we want to store inside the token (user ID and role).
  //   2. The secret key - a private string from our .env file used to sign the token.
  //      Without this secret, anyone could fake a token and pretend to be logged in.
  //   3. Options - we set expiresIn to '30d' so the token expires after 30 days.
  //      After 30 days the user will need to log in again, which is a security best practice.
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Export the function so other files (like authController.js) can import and use it.
// Without this line, the function would be stuck in this file and useless.
module.exports = generateToken;
