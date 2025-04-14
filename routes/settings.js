const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/auth'); // Make sure to import your auth middleware

// GET /api/settings - fetch user settings
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT username, email, notifications, theme FROM users WHERE id = ?',
      [req.user.userId] // Use authenticated user's ID
    );
    
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      settings: user 
    });
  } catch (err) {
    console.error('GET /api/settings error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      errorDetails: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// PUT /api/settings - update user settings
router.put('/', authenticate, async (req, res) => {
  const { username, email, notifications, newPassword, theme } = req.body;

  try {
    let updateFields = 'username = ?, email = ?, notifications = ?, theme = ?';
    const updateValues = [username, email, notifications, theme];

    // Handle optional password update
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 6 characters' 
        });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      updateFields += ', password = ?';
      updateValues.push(hashed);
    }

    updateValues.push(req.user.userId); // Use authenticated user's ID

    await db.promise().query(
      `UPDATE users SET ${updateFields} WHERE id = ?`,
      updateValues
    );

    res.json({ 
      success: true, 
      message: 'Settings updated successfully' 
    });
  } catch (err) {
    console.error('PUT /api/settings error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating settings',
      errorDetails: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;