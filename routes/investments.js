const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticate = require('../middleware/auth');

// Get all investments for the current user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [investments] = await db.execute(
      'SELECT * FROM investments WHERE user_id = ? ORDER BY purchase_date DESC',
      [userId]
    );

    res.json({ success: true, investments });
  } catch (err) {
    console.error('Error fetching investments:', err);
    res.status(500).json({ success: false, message: 'Server error', errorDetails: err.message });
  }
});

// Post a new investment
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, amount, type, purchase_date } = req.body;
    const userId = req.user.userId;

    if (!name || !amount || !type || !purchase_date) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    await db.execute(
      'INSERT INTO investments (user_id, name, amount, type, purchase_date) VALUES (?, ?, ?, ?, ?)',
      [userId, name, amount, type, purchase_date]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error adding investment:', err);
    res.status(500).json({ success: false, message: 'Server error', errorDetails: err.message });
  }
});


module.exports = router;