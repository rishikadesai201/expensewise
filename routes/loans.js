const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all loans
router.get('/', async (req, res) => {
  try {
    const [loans] = await db.execute('SELECT * FROM loans ORDER BY due_date ASC');
    res.json(loans);
  } catch (err) {
    console.error('Error fetching loans:', err);
    res.status(500).json({ message: 'Server error while fetching loans', errorDetails: err.message });
  }
});

// POST new loan
router.post('/', async (req, res) => {
  const { name, amount, lender, interest_rate, due_date } = req.body;

  if (!name || !amount || !lender || !interest_rate || !due_date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate numeric fields
  if (isNaN(amount) || amount <= 0 || isNaN(interest_rate) || interest_rate <= 0) {
    return res.status(400).json({ message: 'Amount and interest rate must be positive numbers' });
  }

  // Validate date
  const date = new Date(due_date);
  if (isNaN(date.getTime())) {
    return res.status(400).json({ message: 'Invalid due date' });
  }

  try {
    await db.execute(
      'INSERT INTO loans (name, amount, lender, interest_rate, due_date) VALUES (?, ?, ?, ?, ?)',
      [name, amount, lender, interest_rate, due_date]
    );
    res.status(201).json({ message: 'Loan added successfully' });
  } catch (err) {
    console.error('Error adding loan:', err);
    res.status(500).json({ message: 'Server error while adding loan', errorDetails: err.message });
  }
});

module.exports = router;
