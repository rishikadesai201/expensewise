const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all budgets
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM budgets WHERE user_id = ?', [req.user?.id || 1]);
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch budgets:', err);
    res.status(500).json({ message: 'Error fetching budgets', error: err.message });
  }
});

// Add new budget
router.post('/', async (req, res) => {
  const { category, limit } = req.body;

  if (!category || !limit) {
    return res.status(400).json({ message: 'Category and limit are required' });
  }

  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ message: 'Limit must be a positive number' });
  }

  try {
    await db.promise().query(
      'INSERT INTO budgets (user_id, category, `limit`) VALUES (?, ?, ?)',
      [req.user?.id || 1, category, limit]
    );
    res.status(201).json({ message: 'Budget added' });
  } catch (err) {
    console.error('Failed to insert budget:', err);
    res.status(500).json({ message: 'Error saving budget', error: err.message });
  }
});

module.exports = router;