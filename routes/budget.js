const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Assuming a static user_id (For now, this can be dynamic with proper auth)
const USER_ID = 1; // Placeholder for the authenticated user

// Get all budgets
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM budgets WHERE user_id = ?', [USER_ID]);
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch budgets:', err);
    res.status(500).json({ message: 'Error fetching budgets', error: err.message });
  }
});

// Add a new budget
router.post('/', async (req, res) => {
  const { category, limit } = req.body; // Expect 'category' and 'limit' fields

  if (!category || !limit) {
    return res.status(400).json({ message: 'Category and limit are required' });
  }

  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ message: 'Limit must be a positive number' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO budgets (user_id, category, amount) VALUES (?, ?, ?)', // 'amount' field remains in DB schema
      [USER_ID, category, limit] // Use 'limit' instead of 'amount'
    );
    res.status(201).json({
      message: 'Budget added successfully',
      budgetId: result.insertId
    });
  } catch (err) {
    console.error('Failed to insert budget:', err);
    res.status(500).json({ message: 'Error saving budget', error: err.message });
  }
});

module.exports = router;
