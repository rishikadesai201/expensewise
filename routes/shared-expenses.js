const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM shared_expenses WHERE user_id = ? ORDER BY date DESC',
      [req.user.userId]
    );

    const formatted = rows.map(item => ({
      ...item,
      participants: item.participants ? item.participants.split(',').map(p => p.trim()) : []
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Failed to fetch shared expenses:', err);
    res.status(500).json({ message: 'Failed to fetch shared expenses', errorDetails: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { title, amount, participants } = req.body;

  if (!title || !amount || !participants || !Array.isArray(participants) || participants.length === 0) {
    return res.status(400).json({ message: 'Invalid input. All fields must be provided.' });
  }

  try {
    await db.promise().execute(
      'INSERT INTO shared_expenses (user_id, title, amount, participants) VALUES (?, ?, ?, ?)',
      [req.user.userId, title, amount, participants.join(', ')]
    );
    res.status(201).json({ message: 'Shared expense added' });
  } catch (err) {
    console.error('Failed to save expense:', err);
    res.status(500).json({ message: 'Failed to save expense', errorDetails: err.message });
  }
});

module.exports = router;