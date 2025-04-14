const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Assuming user ID comes from session or authentication middleware
// const USER_ID = req.user.id; // Uncomment if using session-based auth
const USER_ID = 1; // Placeholder for user ID

// Get all budgets
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM budgets WHERE user_id = ?', [USER_ID]);
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

  // Optional: Validate data (e.g., limit should be a number)
  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ message: 'Limit must be a positive number' });
  }

  try {
    await db.execute(
      'INSERT INTO budgets (user_id, category, limit) VALUES (?, ?, ?)',
      [USER_ID, category, limit]
    );
    res.status(201).json({ message: 'Budget added' });
  } catch (err) {
    console.error('Failed to insert budget:', err);
    res.status(500).json({ message: 'Error saving budget', error: err.message });
  }
});

module.exports = router;
