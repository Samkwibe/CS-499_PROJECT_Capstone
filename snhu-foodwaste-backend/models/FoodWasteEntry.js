// Import mongoose to work with our MongoDB database
const mongoose = require('mongoose');

// Define a schema to represent a single food waste entry in the database
const FoodWasteEntrySchema = new mongoose.Schema({
  // Store the ID of the user (staff) who submitted this entry. It is required.
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Store the type of food being wasted (e.g., "Vegetables", "Meat")
  foodType: {
    type: String,
    required: [true, 'Food type is required'],
    trim: true,
    maxlength: [100, 'Food type cannot exceed 100 characters']
  },
  // Store the weight of the food waste in pounds or kg
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0, 'Weight cannot be negative']
  },
  // Store the exact date and time the entry was recorded
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  // Store the location where the waste was collected (e.g., "Dining Hall A")
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  // Store any extra notes the staff member wants to add
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Store the temperature of the compost/waste bin
  temperature: Number,
  // Store the humidity level of the bin
  humidity: {
    type: Number,
    min: [0, 'Humidity cannot be below 0%'],
    max: [100, 'Humidity cannot exceed 100%']
  },
  // Store the pH level to monitor acidity
  pH: {
    type: Number,
    min: [0, 'pH cannot be below 0'],
    max: [14, 'pH cannot exceed 14']
  },
  // Store the gas emissions data (e.g., methane levels)
  gas: {
    type: Number,
    min: [0, 'Gas reading cannot be negative']
  },
  // Store how full the bin is as a percentage
  binFullness: {
    type: Number,
    min: [0, 'Bin fullness cannot be below 0%'],
    max: [100, 'Bin fullness cannot exceed 100%']
  },
  // Store how much of the waste weight was sent to compost
  compostWeight: {
    type: Number,
    min: [0, 'Compost weight cannot be negative']
  },
  // Boolean to check if students are allowed to see this data (defaults to false)
  published: { type: Boolean, default: false }
// Automatically add createdAt and updatedAt dates
}, { timestamps: true });

FoodWasteEntrySchema.index({ published: 1, createdAt: -1 });
FoodWasteEntrySchema.index({ location: 1 });
FoodWasteEntrySchema.index({ published: 1 });
FoodWasteEntrySchema.index({ createdAt: -1 });

// Export this schema as a Mongoose Model called 'FoodWasteEntry'
module.exports = mongoose.model('FoodWasteEntry', FoodWasteEntrySchema);
