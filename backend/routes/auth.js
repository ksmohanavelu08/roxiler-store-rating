const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { authMiddleware, SECRET_KEY } = require('../middleware/auth');
const router = express.Router();

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8 && 
         password.length <= 16 && 
         /[A-Z]/.test(password) && 
         /[!@#$%^&*]/.test(password);
};

// Signup (Normal Users only)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Validations
    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({ error: 'Name must be 20-60 characters' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be 8-16 characters with at least one uppercase letter and one special character (!@#$%^&*)' 
      });
    }
    
    if (address && address.length > 400) {
      return res.status(400).json({ error: 'Address must be less than 400 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address || '', 'user'],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error during signup' });
        }
        res.status(201).json({ 
          message: 'User created successfully', 
          userId: this.lastID 
        });
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        SECRET_KEY,
        { expiresIn: '24h' }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          address: user.address
        } 
      });
    } catch (error) {
      res.status(500).json({ error: 'Authentication error' });
    }
  });
});

// Update Password
router.patch('/update-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old and new passwords are required' });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({ 
      error: 'New password must be 8-16 characters with at least one uppercase letter and one special character' 
    });
  }

  db.get('SELECT password FROM Users WHERE id = ?', [req.user.id], async (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    try {
      const isValid = await bcrypt.compare(oldPassword, user.password);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      db.run('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, req.user.id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to update password' });
        }
        res.json({ message: 'Password updated successfully' });
      });
    } catch (error) {
      res.status(500).json({ error: 'Error updating password' });
    }
  });
});

module.exports = router;