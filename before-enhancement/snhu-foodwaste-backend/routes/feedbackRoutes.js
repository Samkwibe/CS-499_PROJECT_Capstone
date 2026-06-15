// Import the Express framework so we can make routes
const express = require('express');
// Create a new router object from Express to handle our endpoints
const router = express.Router();

// Temporary feedback route (placeholder)
// Define a GET request route for the root path '/'
// It takes a callback function with request (req) and response (res) objects
router.get('/', (req, res) => {
  // Send a simple text response back to the client
  res.send('📝 Feedback route working!');
});

// Export the router so we can import it into server.js
module.exports = router;
