const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [investments] = await db.promise().execute(
      'SELECT * FROM investments WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );

    res.json({ success: true, investments });
  } catch (err) {
    console.error('Error fetching investments:', err);
    res.status(500).json({ success: false, message: 'Server error', errorDetails: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, amount, type, date } = req.body;
    const userId = req.user.userId;

    if (!name || !amount || !type || !date) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    await db.promise().execute(
      'INSERT INTO investments (user_id, name, amount, type, date) VALUES (?, ?, ?, ?, ?)',
      [userId, name, amount, type, date]
    );

    res.status(201).json({ success: true, message: 'Investment added' });
  } catch (err) {
    console.error('Error adding investment:', err);
    res.status(500).json({ success: false, message: 'Server error', errorDetails: err.message });
  }
});

module.exports = router;