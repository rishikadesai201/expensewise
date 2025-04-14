const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticate = require('../middleware/auth');

// GET all loans for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM loans WHERE user_id = ? ORDER BY due_date ASC',
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching loans:', err);
    res.status(500).json({ 
      message: 'Server error while fetching loans', 
      errorDetails: err.message 
    });
  }
});

// POST new loan
router.post('/', authenticate, async (req, res) => {
  const { name, amount, lender, interest_rate, due_date } = req.body;

  // Validation
  if (!name || !amount || !lender || !interest_rate || !due_date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (isNaN(amount) || amount <= 0 || isNaN(interest_rate) || interest_rate <= 0) {
    return res.status(400).json({ message: 'Amount and interest rate must be positive numbers' });
  }

  if (isNaN(new Date(due_date).getTime())) {
    return res.status(400).json({ message: 'Invalid due date' });
  }

  try {
    await db.promise().query(
      'INSERT INTO loans (user_id, name, amount, lender, interest_rate, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.userId, name, amount, lender, interest_rate, due_date]
    );
    res.status(201).json({ message: 'Loan added successfully' });
  } catch (err) {
    console.error('Error adding loan:', err);
    res.status(500).json({ 
      message: 'Server error while adding loan', 
      errorDetails: err.message 
    });
  }
});

module.exports = router;