/**
 * sensorDataController.js
 * Placeholder controller for smart-bin sensor data.
 *
 * Current status: Sensor readings (temperature, humidity, pH, gas, bin fullness)
 * are entered manually through the food waste entry form and stored directly
 * on each FoodWasteEntry document.  When IoT bins are deployed in a future
 * phase, this controller will receive automated readings and persist them
 * in a dedicated SensorData collection for real-time trend analysis.
 *
 * All endpoints return HTTP 501 (Not Implemented) with a descriptive message
 * so the frontend can display a clear explanation to staff users.
 */

/**
 * @desc    Record a new sensor reading from a smart bin
 * @route   POST /api/sensors
 * @access  Private (staff, admin, or IoT device token)
 */
const recordReading = async (req, res) => {
  // We send back a 501 status code which means "Not Implemented Yet".
  // This tells the frontend that the route exists, but the backend isn't ready
  // to process automatic sensor data. We include a friendly message to explain why.
  res.status(501).json({
    success: false,
    message: 'Automated sensor recording is planned for a future release. '
           + 'Sensor data is currently entered manually via the food waste form.'
  });
};

/**
 * @desc    Get historical sensor readings for charting
 * @route   GET /api/sensors/history
 * @access  Private (staff, admin)
 */
const getHistory = async (req, res) => {
  // Similar to recordReading, this is a placeholder. 
  // It returns a 501 so the frontend knows this feature is coming soon.
  res.status(501).json({
    success: false,
    message: 'Sensor history retrieval is planned for a future release. '
           + 'Historical readings are available through the waste reports summary endpoint.'
  });
};

// We export these functions so the router can use them. 
// Even though they are placeholders, the router needs something to call.
module.exports = {
  recordReading,
  getHistory
};
