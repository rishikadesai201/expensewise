const express = require('express');
const router = express.Router();
const db = require('../db'); // assuming db is a MySQL connection setup

// POST: Create a shared expense
router.post('/', (req, res) => {
  const { title, amount, paid_by, participants } = req.body;
  
  // Check if all fields are provided
  if (!title || !amount || !paid_by || !participants) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Prepare participants list (array of emails)
  const participantsList = participants.split(',').map(email => email.trim());

  const query = 'INSERT INTO shared_expenses (title, amount, paid_by, participants) VALUES (?, ?, ?, ?)';
  db.execute(query, [title, amount, paid_by, JSON.stringify(participantsList)], (err, result) => {
    if (err) {
      console.error('Failed to save expense:', err);
      return res.status(500).json({ error: 'Failed to save expense' });
    }

    return res.status(201).json({ message: 'Expense added successfully', expenseId: result.insertId });
  });
});

// GET: Get all shared expenses (for listing)
router.get('/', (req, res) => {
  const query = 'SELECT * FROM shared_expenses ORDER BY created_at DESC';
  db.execute(query, (err, result) => {
    if (err) {
      console.error('Failed to retrieve expenses:', err);
      return res.status(500).json({ error: 'Failed to retrieve expenses' });
    }

    return res.status(200).json(result);
  });
});

module.exports = router;
