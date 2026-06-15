// Import the Express framework so we can make our web routes
const express = require('express');
// Create a new router object from Express
const router = express.Router();

// Temporary Tip Route
// Define a GET request route for the root path '/'
// It takes a callback function with request (req) and response (res) objects
router.get('/', (req, res) => {
  // Send a simple text response back to the user
  res.send('💡 Tips route working!');
});

// Export the router so we can import it into the main server file
module.exports = router;
