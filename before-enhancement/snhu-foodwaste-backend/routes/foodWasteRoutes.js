// routes/foodWasteRoutes.js

// Import the Express framework to create our server routes
const express = require('express');
// Create a new router object from Express
const router = express.Router();
// Import the FoodWasteEntry model to interact with our database collection
const FoodWasteEntry = require('../models/FoodWasteEntry');

// 1. GET all published entries (students can see these)
// Define a GET route at the root path '/' with an asynchronous callback function taking request (req) and response (res)
router.get('/', async (req, res) => {
  // Start a try block to catch any errors during the database query
  try {
    // Only return where published = true
    // Await the database search for entries where the 'published' field is true
    // Sort the results by 'createdAt' in descending order (-1) so newest is first
    const entries = await FoodWasteEntry.find({ published: true }).sort({ createdAt: -1 });
    // Send the found entries back to the client as a JSON response
    res.json(entries);
  // Catch any errors that happen in the try block
  } catch (err) {
    // Send a 500 (Internal Server Error) status code and the error message in JSON format
    res.status(500).json({ message: err.message });
  }
});

// 2. POST new waste entry (staff usage)
// Define a POST route at the root path '/' to handle creating new entries
router.post('/', async (req, res) => {
  // Start a try block for the database creation operation
  try {
    // Staff calls this with body data
    // Await the creation of a new FoodWasteEntry document in the database
    const newEntry = await FoodWasteEntry.create({
      // Set the submittedBy field using data from the request body (req.body)
      submittedBy: req.body.submittedBy, // staffId
      // Set the foodType field from the request body
      foodType: req.body.foodType,
      // Set the weight field from the request body
      weight: req.body.weight,
      // Set the date field from the request body
      date: req.body.date,
      // Set the location field from the request body
      location: req.body.location,
      // Set the notes field from the request body
      notes: req.body.notes,
      // Set the temperature field from the request body
      temperature: req.body.temperature,
      // Set the humidity field from the request body
      humidity: req.body.humidity,
      // Set the pH field from the request body
      pH: req.body.pH,
      // Set the gas emissions field from the request body
      gas: req.body.gas,
      // Set the binFullness field from the request body
      binFullness: req.body.binFullness,
      // Set the compostWeight field from the request body
      compostWeight: req.body.compostWeight,
      // Set published to false by default so it doesn't show up immediately
      published: false // default as false
    });
    // Send a 201 (Created) status code and the newly created entry as JSON
    res.status(201).json(newEntry);
  // Catch any errors, such as missing required fields
  } catch (err) {
    // Send a 400 (Bad Request) status code with the error message
    res.status(400).json({ message: err.message });
  }
});

// 3. PUT to publish/unpublish an entry
// Define a PUT route with a dynamic parameter ':id' for the entry's unique ID
router.put('/:id/publish', async (req, res) => {
  // Start a try block
  try {
    // Await finding the specific entry in the database using the ID from the URL (req.params.id)
    const entry = await FoodWasteEntry.findById(req.params.id);
    // If no entry is found with that ID, return a 404 (Not Found) error
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    // Update the 'published' property of the entry with the value from the request body (true or false)
    entry.published = req.body.published; // true or false
    // Await saving the updated entry back into the database
    await entry.save();

    // Send a success message and the updated entry back as JSON
    res.json({ message: 'Entry updated', entry });
  // Catch any errors during the update process
  } catch (err) {
    // Send a 500 status code and the error message
    res.status(500).json({ message: err.message });
  }
});

// Export the router so it can be used in the main server file
module.exports = router;
