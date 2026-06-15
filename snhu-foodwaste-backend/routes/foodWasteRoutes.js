/**
 * foodWasteRoutes.js
 * Routes for food waste data entry and reporting.
 */

// Import the Express framework to create our server routes
const express = require('express');
// Create a new router object from Express that handles the different path endpoints
const router = express.Router();

// Import the FoodWasteEntry model (still needed for routes that have custom database queries here).
const FoodWasteEntry = require('../models/FoodWasteEntry');

// Import middleware that checks the JWT (protect) and verifies staff/admin roles (authorize).
// This is like a security guard checking ID badges before letting someone use a route.
const { protect, authorize } = require('../middleware/authMiddleware');

// Import the helper that calculates and sorts pickup priority scores for bins.
const { rankWasteEntries } = require('../utils/wastePriority');

// Import controller functions that handle the core CRUD business logic.
// This keeps this route file clean, following the MVC (Model-View-Controller) design pattern.
const {
  getPublishedEntries,
  getAllEntries,
  createEntry,
  updateEntry,
  deleteEntry
} = require('../controllers/wasteEntryController');

// A helper function to consistently send error messages as JSON.
const sendError = (res, statusCode, message) => res.status(statusCode).json({
  success: false,
  message
});

// 1. GET all published entries (students can see these)
// When someone goes to GET /api/waste, it runs the getPublishedEntries function.
// We don't use 'protect' here because this data is public for the student dashboard.
router.get('/', getPublishedEntries);

// 2. GET all entries for staff/admin management
// 'protect' makes sure they are logged in.
// 'authorize' makes sure their role is either 'staff' or 'admin'.
router.get('/all', protect, authorize('staff', 'admin'), getAllEntries);

// 3. GET ranked pickup priorities for staff/admin users
router.get('/priority', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    // Pull the latest 50 entries from the database so the priority screen focuses on recent operational data.
    const entries = await FoodWasteEntry.find().sort({ createdAt: -1 }).limit(50);
    
    // rankWasteEntries is a math function that adds a priorityScore (1-100) to each entry.
    // It returns the list sorted by who needs pickup the most.
    res.json(rankWasteEntries(entries));
  } catch (err) {
    // Return a 500 server error response if priority data cannot be loaded.
    sendError(res, 500, err.message);
  }
});

// 4. GET reporting summary using MongoDB aggregation
// Aggregation is a powerful MongoDB feature that lets us calculate totals and averages directly in the database.
router.get('/reports/summary', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    // This aggregation produces one overall summary document for the dashboard KPI (Key Performance Indicator) cards.
    const [totals] = await FoodWasteEntry.aggregate([
      {
        // $group with _id: null means it combines every single record in the database into one giant group.
        $group: {
          _id: null,
          // Add up all recorded waste weight across the whole campus.
          totalWaste: { $sum: '$weight' },
          // Add up all recorded compost weight.
          totalCompost: { $sum: '$compostWeight' },
          // Average the latest sensor readings (like bin fullness, humidity, pH).
          averageBinFullness: { $avg: '$binFullness' },
          averageHumidity: { $avg: '$humidity' },
          averagePH: { $avg: '$pH' },
          // Count the total number of entries included in the report.
          entryCount: { $sum: 1 }
        }
      }
    ]);

    // This aggregation groups records by location so staff can see which dining halls generate the most waste.
    const byLocation = await FoodWasteEntry.aggregate([
      {
        $group: {
          // Setting _id to '$location' means it creates a separate group for each location name.
          _id: '$location',
          totalWaste: { $sum: '$weight' },
          totalCompost: { $sum: '$compostWeight' },
          averageBinFullness: { $avg: '$binFullness' },
          entryCount: { $sum: 1 }
        }
      },
      // Sort highest waste locations first so the table is more useful. (-1 means descending)
      { $sort: { totalWaste: -1 } }
    ]);

    // This aggregation groups records by date for charting daily trends on the dashboard.
    const dailyTrend = await FoodWasteEntry.aggregate([
      {
        $group: {
          _id: {
            // Convert the Date value into a YYYY-MM-DD string so entries from the same day group together.
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          totalWaste: { $sum: '$weight' },
          totalCompost: { $sum: '$compostWeight' },
          averageBinFullness: { $avg: '$binFullness' },
          entryCount: { $sum: 1 }
        }
      },
      // Sort dates from oldest to newest for the chart. (1 means ascending)
      { $sort: { _id: 1 } },
      // Limit the result to the last 14 days so the frontend chart doesn't get overcrowded.
      { $limit: 14 }
    ]);

    // Total waste submitted per user
    const byUser = await FoodWasteEntry.aggregate([
      {
        $group: {
          _id: '$submittedBy',
          totalWaste: { $sum: '$weight' },
          entryCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          totalWaste: 1,
          entryCount: 1
        }
      },
      { $sort: { totalWaste: -1 } }
    ]);

    // Total waste per food type
    const byFoodType = await FoodWasteEntry.aggregate([
      {
        $group: {
          _id: '$foodType',
          totalWaste: { $sum: '$weight' },
          entryCount: { $sum: 1 }
        }
      },
      { $sort: { totalWaste: -1 } }
    ]);

    // Monthly waste trend over time
    const monthlyTrend = await FoodWasteEntry.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$date' }
          },
          totalWaste: { $sum: '$weight' },
          totalCompost: { $sum: '$compostWeight' },
          entryCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // If the database is totally empty, `totals` will be undefined.
    // We use fallback values of 0 here so the frontend doesn't crash when trying to display undefined numbers.
    const totalWaste = totals?.totalWaste || 0;
    const totalCompost = totals?.totalCompost || 0;

    // Send one combined report object back as JSON to the dashboard.
    res.json({
      totalWaste,
      totalCompost,
      // Compost diversion rate calculates what percentage of total waste was successfully composted.
      compostDiversionRate: totalWaste > 0
        ? Math.min(100, Math.round((totalCompost / totalWaste) * 100))
        : 0,
      // Round averages so the KPI cards show clean, whole numbers.
      averageBinFullness: Math.round(totals?.averageBinFullness || 0),
      averageHumidity: Math.round(totals?.averageHumidity || 0),
      // We keep one decimal point for pH because small changes matter there.
      averagePH: Number((totals?.averagePH || 0).toFixed(1)),
      entryCount: totals?.entryCount || 0,
      byLocation,
      dailyTrend,
      byUser,
      byFoodType,
      monthlyTrend
    });
  } catch (err) {
    // If any of the aggregations fail, return a server error.
    sendError(res, 500, err.message);
  }
});

// 5. POST new waste entry (staff/admin usage)
// Delegates the actual work to createEntry in the controller file.
router.post('/', protect, authorize('staff', 'admin'), createEntry);

// 6. PUT to update an existing waste entry
// The :id in the path is a variable. So /api/waste/12345 means id=12345.
router.put('/:id', protect, authorize('staff', 'admin'), updateEntry);

// 7. PUT to publish/unpublish an entry
// This is a custom route that just toggles the boolean 'published' field.
router.put('/:id/publish', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    // Find the specific entry in the database using the ID from the URL.
    const entry = await FoodWasteEntry.findById(req.params.id);
    
    // If no entry is found with that ID, return a 404 (Not Found) error.
    if (!entry) return sendError(res, 404, 'Entry not found');

    // Update the 'published' property of the entry with the true/false value sent from the frontend.
    entry.published = req.body.published; 
    
    // Save the changes back to the database.
    await entry.save();

    // Send a success message back as JSON.
    res.json({ message: 'Entry updated', entry });
  } catch (err) {
    sendError(res, 500, err.message);
  }
});

// 8. DELETE an existing waste entry
// Deletes an entry. Only staff or admins are allowed to do this.
router.delete('/:id', protect, authorize('staff', 'admin'), deleteEntry);

// Export the router so it can be attached to the main app in app.js
module.exports = router;
