/**
 * server.js
 * Connects to MongoDB and starts the Express server.
 */

const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/db');

dotenv.config();

connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running and listening on port ${PORT}`);
});
