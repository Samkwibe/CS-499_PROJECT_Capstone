/**
 * tipsController.js
 * Controller for sustainability tips CRUD operations.
 */

// Removed broken Tip model import to fix server crash

const getTips = async (req, res) => {
  try {
    // Return a hardcoded list of tips since the database model is planned for a future release
    const tips = [
      {
        _id: '1',
        title: 'Proper Composting',
        content: 'Ensure all food scraps go into the designated green bins.',
        active: true
      },
      {
        _id: '2',
        title: 'Reduce Portion Sizes',
        content: 'Take only what you can eat. You can always go back for seconds!',
        active: true
      }
    ];
    
    // Send the array of tips back as JSON.
    res.json(tips);
  } catch (err) {
    console.error('Error fetching tips:', err);
    res.status(500).json({ message: 'Failed to retrieve sustainability tips' });
  }
};

const getTipById = async (req, res) => {
  res.status(501).json({ message: 'Tip retrieval by ID is planned for a future release.' });
};

const createTip = (req, res) => {
  // This is a placeholder function for when we want to allow admins to create new tips via the UI.
  // The 501 status means "Not Implemented". It returns a friendly message instead of crashing.
  res.status(501).json({
    success: false,
    message: 'Tip creation is planned for a future release. '
           + 'A database-backed Tip model will replace the current hardcoded list.'
  });
};

// We export these functions so the tipRoutes.js file can attach them to URL endpoints.
module.exports = {
  getTips,
  getTipById,
  createTip
};
