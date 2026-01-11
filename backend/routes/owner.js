const express = require('express');
const { db } = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware, roleMiddleware(['owner']));

// Owner dashboard
router.get('/dashboard', (req, res) => {
  const ownerId = req.user.id;

  // Get store owned by this owner
  db.get('SELECT * FROM Stores WHERE owner_id = ?', [ownerId], (err, store) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!store) {
      return res.status(404).json({ 
        error: 'No store found for this owner',
        message: 'Please contact admin to assign a store to your account'
      });
    }

    // Get average rating and total ratings
    db.get(
      'SELECT AVG(rating) as avgRating, COUNT(*) as totalRatings FROM Ratings WHERE store_id = ?',
      [store.id],
      (err, stats) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Get list of raters
        db.all(
          `SELECT u.id, u.name, u.email, r.rating, r.created_at 
           FROM Ratings r 
           JOIN Users u ON r.user_id = u.id 
           WHERE r.store_id = ?
           ORDER BY r.created_at DESC`,
          [store.id],
          (err, raters) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            res.json({
              store: {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address
              },
              avgRating: parseFloat(stats.avgRating || 0).toFixed(2),
              totalRatings: stats.totalRatings || 0,
              raters: raters || []
            });
          }
        );
      }
    );
  });
});

module.exports = router;