const express = require('express');
const bcrypt = require('bcrypt');
const { db } = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

// All routes require admin role
router.use(authMiddleware, roleMiddleware(['admin']));

// Dashboard stats
router.get('/dashboard', (req, res) => {
  const stats = {};
  
  db.get('SELECT COUNT(*) as count FROM Users', (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.usersCount = result.count;
    
    db.get('SELECT COUNT(*) as count FROM Stores', (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.storesCount = result.count;
      
      db.get('SELECT COUNT(*) as count FROM Ratings', (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        stats.ratingsCount = result.count;
        res.json(stats);
      });
    });
  });
});

// List stores with filters and sorting
router.get('/stores', (req, res) => {
  const { name, email, sort = 'name:asc' } = req.query;
  const [sortField, sortOrder] = sort.split(':');
  
  const validSortFields = ['name', 'email', 'avgRating'];
  const validSortOrders = ['asc', 'desc'];
  
  if (!validSortFields.includes(sortField) || !validSortOrders.includes(sortOrder)) {
    return res.status(400).json({ error: 'Invalid sort parameters' });
  }
  
  let query = `
    SELECT s.*, 
           COALESCE(AVG(r.rating), 0) as avgRating,
           COUNT(r.id) as ratingCount
    FROM Stores s
    LEFT JOIN Ratings r ON s.id = r.store_id
    WHERE 1=1
  `;
  const params = [];

  if (name) {
    query += ' AND s.name LIKE ?';
    params.push(`%${name}%`);
  }
  if (email) {
    query += ' AND s.email = ?';
    params.push(email);
  }

  query += ` GROUP BY s.id ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;

  db.all(query, params, (err, stores) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(stores);
  });
});

// Add new store
router.post('/stores', (req, res) => {
  const { name, email, address, owner_id } = req.body;

  if (!name || name.length < 20 || name.length > 60) {
    return res.status(400).json({ error: 'Store name must be 20-60 characters' });
  }

  if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  if (address && address.length > 400) {
    return res.status(400).json({ error: 'Address must be less than 400 characters' });
  }

  db.run(
    'INSERT INTO Stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [name, email, address || '', owner_id || null],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Store email already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ 
        message: 'Store created successfully', 
        storeId: this.lastID 
      });
    }
  );
});

// List users with filters
router.get('/users', (req, res) => {
  const { name, email, role, sort = 'name:asc' } = req.query;
  const [sortField, sortOrder] = sort.split(':');
  
  const validSortFields = ['name', 'email', 'role'];
  const validSortOrders = ['asc', 'desc'];
  
  if (!validSortFields.includes(sortField) || !validSortOrders.includes(sortOrder)) {
    return res.status(400).json({ error: 'Invalid sort parameters' });
  }
  
  let query = 'SELECT id, name, email, address, role FROM Users WHERE 1=1';
  const params = [];

  if (name) {
    query += ' AND name LIKE ?';
    params.push(`%${name}%`);
  }
  if (email) {
    query += ' AND email = ?';
    params.push(email);
  }
  if (role) {
    if (!['admin', 'user', 'owner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role filter' });
    }
    query += ' AND role = ?';
    params.push(role);
  }

  query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;

  db.all(query, params, (err, users) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(users);
  });
});

// Add new user (any role)
router.post('/users', async (req, res) => {
  const { name, email, password, address, role } = req.body;

  if (!name || name.length < 20 || name.length > 60) {
    return res.status(400).json({ error: 'Name must be 20-60 characters' });
  }

  if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  if (!password || password.length < 8 || password.length > 16 || 
      !/[A-Z]/.test(password) || !/[!@#$%^&*]/.test(password)) {
    return res.status(400).json({ 
      error: 'Password must be 8-16 chars with uppercase and special character' 
    });
  }

  if (!['admin', 'user', 'owner'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be admin, user, or owner' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address || '', role],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ 
          message: 'User created successfully', 
          userId: this.lastID 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// View user details
router.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  db.get(
    'SELECT id, name, email, address, role FROM Users WHERE id = ?', 
    [userId], 
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role === 'owner') {
        db.get(
          `SELECT s.*, COALESCE(AVG(r.rating), 0) as avgRating 
           FROM Stores s 
           LEFT JOIN Ratings r ON s.id = r.store_id 
           WHERE s.owner_id = ?
           GROUP BY s.id`,
          [user.id],
          (err, store) => {
            user.store = store || null;
            res.json(user);
          }
        );
      } else {
        res.json(user);
      }
    }
  );
});

module.exports = router;