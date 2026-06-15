/**
 * wasteEntryController.js
 * Controller for food waste entry CRUD operations.
 *
 * This file contains the business logic for creating, reading, updating,
 * and deleting food waste entries. The route file (foodWasteRoutes.js)
 * delegates to these functions, keeping the MVC layers separate.
 */

// Import the database model for food waste entries so we can read and write data.
const FoodWasteEntry = require('../models/FoodWasteEntry');
// Import our custom utility functions that clean the data and format database errors.
const { sanitizeWasteBody, formatMongooseError } = require('../utils/sanitizeWasteBody');

// A helper function to easily send back a standardized error message.
// This saves us from rewriting this response block over and over.
const sendError = (res, statusCode, message) => res.status(statusCode).json({
  success: false,
  message
});

/**
 * @desc    Get all published waste entries (student-facing)
 * @route   GET /api/waste
 * @access  Public
 */
const getPublishedEntries = async (req, res) => {
  try {
    // Look up all entries where 'published' is true. 
    // This makes sure regular students don't see raw or unapproved data.
    // The sort() part orders them from newest to oldest based on creation time.
    const entries = await FoodWasteEntry.find({ published: true }).sort({ createdAt: -1 });
    // Send the list of entries back to the frontend.
    res.json(entries);
  } catch (err) {
    console.error('Error fetching published entries:', err.message);
    sendError(res, 500, 'Failed to retrieve published entries');
  }
};

/**
 * @desc    Get all waste entries for staff management
 * @route   GET /api/waste/all
 * @access  Private (staff, admin)
 */
const getAllEntries = async (req, res) => {
  try {
    // Staff need to see everything, so we find all entries regardless of published status.
    // Again, we sort them newest to oldest.
    const entries = await FoodWasteEntry.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Error fetching all entries:', err.message);
    sendError(res, 500, 'Failed to retrieve entries');
  }
};

/**
 * @desc    Create a new waste entry
 * @route   POST /api/waste
 * @access  Private (staff, admin)
 */
const createEntry = async (req, res) => {
  try {
    // Validate and sanitize the incoming request body from the frontend form.
    // This stops users from sending garbage data or malicious inputs.
    const entryFields = sanitizeWasteBody(req.body);
    
    // Create the new entry in the database.
    const newEntry = await FoodWasteEntry.create({
      // We automatically attach the ID of the person making the request
      // so we always know who submitted the data.
      submittedBy: req.user._id,
      // We unpack the cleaned fields into the new document.
      ...entryFields,
      // We default to false so a supervisor can review it before it goes public.
      published: false
    });
    
    // Send a 201 Created status along with the new entry data.
    res.status(201).json(newEntry);
  } catch (err) {
    // If the database complains (like a required field is missing), format the error and send it.
    sendError(res, err.statusCode || 400, formatMongooseError(err));
  }
};

/**
 * @desc    Update an existing waste entry
 * @route   PUT /api/waste/:id
 * @access  Private (staff, admin)
 */
const updateEntry = async (req, res) => {
  try {
    // Validate and sanitize only the editable fields from the request body.
    const entryFields = sanitizeWasteBody(req.body);
    
    // Find the entry by the ID in the URL and update it with the new fields.
    const entry = await FoodWasteEntry.findByIdAndUpdate(
      req.params.id, // This is the ID from the URL.
      entryFields, // This is the new data to apply.
      { 
        new: true, // Tell MongoDB to return the updated record instead of the old one.
        runValidators: true // Make sure the new data still follows our schema rules.
      }
    );

    // If the entry ID doesn't exist in the database, return a 404 error.
    if (!entry) return sendError(res, 404, 'Entry not found');
    
    // Otherwise, send back the updated entry.
    return res.json(entry);
  } catch (err) {
    return sendError(res, err.statusCode || 400, formatMongooseError(err));
  }
};

/**
 * @desc    Delete a waste entry
 * @route   DELETE /api/waste/:id
 * @access  Private (staff, admin)
 */
const deleteEntry = async (req, res) => {
  try {
    // Find the entry by its ID and delete it from the database completely.
    const entry = await FoodWasteEntry.findByIdAndDelete(req.params.id);
    
    // If we couldn't find it to delete, tell the frontend.
    if (!entry) return sendError(res, 404, 'Entry not found');
    
    // Send a success message.
    return res.json({ message: 'Entry deleted' });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// Export all the functions so the route file can use them to handle web requests.
module.exports = {
  getPublishedEntries,
  getAllEntries,
  createEntry,
  updateEntry,
  deleteEntry
};
