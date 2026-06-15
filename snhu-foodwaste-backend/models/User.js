// Import mongoose to define our database models
const mongoose = require('mongoose');

// Define the blueprint (schema) for a User in the database
const UserSchema = new mongoose.Schema({
  // Define the 'name' field
  name: {
    // The name must be text (String)
    type: String,
    // It is required, and shows this error message if missing
    required: [true, 'Name is required'],
    // Trim removes extra whitespace from the beginning and end
    trim: true,
    // The maximum length is 100 characters
    maxlength: [100, 'Name cannot exceed 100 characters'],
    // The minimum length is 2 characters
    minlength: [2, 'Name must be at least 2 characters']
  },
  
  // Define the 'email' field
  email: {
    // It must be a String
    type: String,
    // It is required
    required: [true, 'Email is required'],
    // Every email in the database must be unique
    unique: true,
    // Automatically convert the email to lowercase
    lowercase: true,
    // Use a regular expression to validate that it is formatted like a real email address
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  
  // Define the 'password' field
  password: {
    // Passwords are stored as Strings (they will be hashed later)
    type: String,
    // A password is required
    required: [true, 'Password is required'],
    // It must be at least 8 characters long
    minlength: [8, 'Password must be at least 8 characters'],
    // select: false means the password won't be sent back by default when we query a user
    select: false
  },
  
  // Define the 'role' field to determine permissions
  role: {
    // It is a String
    type: String,
    // It can only be one of these three specific values
    enum: ['student', 'staff', 'admin'],
    // If no role is provided, it defaults to 'student'
    default: 'student'
  },
  
  // Define an 'isActive' flag to disable accounts without deleting them
  isActive: {
    // It is a Boolean (true or false)
    type: Boolean,
    // Accounts are active by default
    default: true,
    // Do not return this field by default in queries
    select: false
  },
  
  // Nested object for storing notification preferences
  notificationPreferences: {
    // Whether to send emails (default true)
    email: { type: Boolean, default: true },
    // Whether to send text messages (default false)
    sms: { type: Boolean, default: false },
    // Whether to send high priority alerts (default true)
    highPriority: { type: Boolean, default: true }
  },
  
  // Define the user's theme preference for the frontend UI
  themePreference: {
    // It is a String
    type: String,
    // It can only be 'light' or 'dark'
    enum: ['light', 'dark'],
    // Default to 'light'
    default: 'light'
  }
// Configuration options for the Schema
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true,
  // Define how the document behaves when converted to JSON
  toJSON: {
    // Include virtual fields
    virtuals: true,
    // A transform function to modify the returned object before sending it to the client
    transform: function(doc, ret) {
      // Always delete the password from the final JSON object for security
      delete ret.password;
      // Return the cleaned up object
      return ret;
    }
  },
  // Define how the document behaves when converted to a plain JavaScript Object
  toObject: {
    // Include virtual fields
    virtuals: true
  }
});

// Export the User model based on the schema
module.exports = mongoose.model('User', UserSchema);