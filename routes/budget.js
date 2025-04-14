const express = require('express');
const router = express.Router();
const db = require('../config/db');

const USER_ID = 1; // Placeholder - replace with real auth later

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

// Add new budget
router.post('/', async (req, res) => {
  const { category, amount } = req.body;

  if (!category || !amount) {
    return res.status(400).json({ message: 'Category and amount are required' });
  }

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO budgets (user_id, category, amount) VALUES (?, ?, ?)',
      [USER_ID, category, amount]
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