// Import the Express framework
const express = require('express');
// Create a router object from Express to handle routes
const router = express.Router();

// Simple test route
// Define a POST request route for the '/add' path
router.post('/add', (req, res) => {
  // Extract the waste data from the incoming request body
  const wasteData = req.body;
  // Print the received data to the server console for debugging
  console.log('📦 Received waste data:', wasteData);
  // Send a 200 (OK) status code with a JSON response containing a success message and the received data
  res.status(200).json({ message: 'Waste entry received', data: wasteData });
});

// Export the router so it can be used in server.js
module.exports = router;
