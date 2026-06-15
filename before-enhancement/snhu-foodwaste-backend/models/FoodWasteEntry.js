// Import mongoose to work with our MongoDB database
const mongoose = require('mongoose');

// Define a schema to represent a single food waste entry in the database
const FoodWasteEntrySchema = new mongoose.Schema({
  // Store the ID of the user (staff) who submitted this entry. It is required.
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Store the type of food being wasted (e.g., "Vegetables", "Meat")
  foodType: String,
  // Store the weight of the food waste in pounds or kg
  weight: Number,
  // Store the exact date and time the entry was recorded
  date: Date,
  // Store the location where the waste was collected (e.g., "Dining Hall A")
  location: String,
  // Store any extra notes the staff member wants to add
  notes: String,
  // Store the temperature of the compost/waste bin
  temperature: Number,
  // Store the humidity level of the bin
  humidity: Number,
  // Store the pH level to monitor acidity
  pH: Number,
  // Store the gas emissions data (e.g., methane levels)
  gas: Number,
  // Store how full the bin is as a percentage
  binFullness: Number,
  // Store how much of the waste weight was sent to compost
  compostWeight: Number,
  // Boolean to check if students are allowed to see this data (defaults to false)
  published: { type: Boolean, default: false }
// Automatically add createdAt and updatedAt dates
}, { timestamps: true });

// Export this schema as a Mongoose Model called 'FoodWasteEntry'
module.exports = mongoose.model('FoodWasteEntry', FoodWasteEntrySchema);
