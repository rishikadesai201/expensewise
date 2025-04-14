const express = require('express');
const router = express.Router();
const db = require('../config/db');

const USER_ID = 1; // Replace with real user ID from auth later

// GET all budgets
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM budgets WHERE user_id = ?', [USER_ID]);
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch budgets:', err);
    res.status(500).json({ message: 'Error fetching budgets', error: err.message });
  }
});

// POST new budget
router.post('/', async (req, res) => {
  console.log('📥 Received POST /api/budgets');
  console.log('Request body:', req.body);

  const { category, amount } = req.body;
  const numericAmount = parseFloat(amount);

  if (!category || isNaN(numericAmount) || numericAmount <= 0) {
    console.warn('❌ Invalid input:', { category, amount });
    return res.status(400).json({ message: 'Category and valid amount are required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO budgets (user_id, category, amount) VALUES (?, ?, ?)',
      [USER_ID, category, numericAmount]
    );
    res.status(201).json({
      message: 'Budget added successfully',
      budgetId: result.insertId
    });
  } catch (err) {
    console.error('🔥 Failed to save budget:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

module.exports = router;
