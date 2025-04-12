const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const bcrypt = require('bcryptjs');

// Middleware to simulate user auth (replace with real auth middleware)
const mockUserId = 1; // Replace with actual user ID from session/token

// GET /api/settings - fetch user settings
router.get('/', async (req, res) => {
  try {
    const [user] = await db.query('SELECT username, email, monthly_budget AS monthlyBudget, notifications, theme FROM users WHERE id = ?', [mockUserId]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, settings: user });
  } catch (err) {
    console.error('GET /api/settings error:', err);
    res.status(500).json({ success: false, message: 'Server error', errorDetails: err.message });
  }
});

// PUT /api/settings - update user settings
router.put('/', async (req, res) => {
  const { username, email, monthlyBudget, notifications, newPassword, theme } = req.body;

  try {
    let updateFields = 'username = ?, email = ?, monthly_budget = ?, notifications = ?, theme = ?';
    const updateValues = [username, email, monthlyBudget, notifications, theme];

    // Handle optional password update
    if (newPassword && newPassword.length >= 6) {
      const hashed = await bcrypt.hash(newPassword, 10);
      updateFields += ', password = ?';
      updateValues.push(hashed);
    } else if (newPassword) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    updateValues.push(mockUserId); // For WHERE clause

    await db.query(`UPDATE users SET ${updateFields} WHERE id = ?`, updateValues);

    res.json({ success: true, message: 'Settings updated' });
  } catch (err) {
    console.error('PUT /api/settings error:', err);
    res.status(500).json({ success: false, message: 'Server error', errorDetails: err.message });
  }
});

module.exports = router;
