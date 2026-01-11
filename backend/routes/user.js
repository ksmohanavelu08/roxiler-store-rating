const express = require('express');
const { db } = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware, roleMiddleware(['user']));

// List stores with ratings
router.get('/stores', (req, res) => {
  const { name, address } = req.query;
  const userId = req.user.id;

  let query = `
    SELECT s.*, 
           COALESCE(AVG(r.rating), 0) as avgRating,
           COUNT(r.id) as ratingCount,
           ur.rating as userRating,
           ur.id as userRatingId
    FROM Stores s
    LEFT JOIN Ratings r ON s.id = r.store_id
    LEFT JOIN Ratings ur ON s.id = ur.store_id AND ur.user_id = ?
    WHERE 1=1
  `;
  const params = [userId];

  if (name) {
    query += ' AND s.name LIKE ?';
    params.push(`%${name}%`);
  }
  if (address) {
    query += ' AND s.address LIKE ?';
    params.push(`%${address}%`);
  }

  query += ' GROUP BY s.id ORDER BY s.name';

  db.all(query, params, (err, stores) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(stores);
  });
});

// Submit rating
router.post('/ratings', (req, res) => {
  const { store_id, rating } = req.body;
  const user_id = req.user.id;

  if (!store_id || !rating) {
    return res.status(400).json({ error: 'Store ID and rating are required' });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }

  // Check if store exists
  db.get('SELECT id FROM Stores WHERE id = ?', [store_id], (err, store) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    db.run(
      'INSERT OR REPLACE INTO Ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
      [user_id, store_id, rating],
      function(err) {
        if (err) {
          console.error('Rating error:', err);
          return res.status(500).json({ error: 'Failed to submit rating' });
        }
        res.json({ 
          message: 'Rating submitted successfully',
          ratingId: this.lastID
        });
      }
    );
  });
});

// Update rating
router.patch('/ratings/:storeId', (req, res) => {
  const { rating } = req.body;
  const user_id = req.user.id;
  const store_id = parseInt(req.params.storeId);

  if (isNaN(store_id)) {
    return res.status(400).json({ error: 'Invalid store ID' });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }

  db.run(
    'UPDATE Ratings SET rating = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?',
    [rating, user_id, store_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update rating' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Rating not found for this store' });
      }
      res.json({ message: 'Rating updated successfully' });
    }
  );
});

// Delete rating
router.delete('/ratings/:storeId', (req, res) => {
  const user_id = req.user.id;
  const store_id = parseInt(req.params.storeId);

  if (isNaN(store_id)) {
    return res.status(400).json({ error: 'Invalid store ID' });
  }

  db.run(
    'DELETE FROM Ratings WHERE user_id = ? AND store_id = ?',
    [user_id, store_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete rating' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Rating not found' });
      }
      res.json({ message: 'Rating deleted successfully' });
    }
  );
});

module.exports = router;