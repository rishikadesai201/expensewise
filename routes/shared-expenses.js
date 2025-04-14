const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all shared expenses
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM shared_expenses ORDER BY created_at DESC');

    // Convert comma-separated participants back into array
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

// POST a new shared expense
router.post('/', async (req, res) => {
  const { title, amount, participants } = req.body;

  if (!title || !amount || !participants || !Array.isArray(participants) || participants.length === 0) {
    return res.status(400).json({ message: 'Invalid input. All fields must be provided.' });
  }

  try {
    const participantsStr = participants.join(', '); // Store as comma-separated string
    await db.execute(
      'INSERT INTO shared_expenses (title, amount, participants) VALUES (?, ?, ?)',
      [title, amount, participantsStr]
    );

    res.status(201).json({ message: 'Shared expense added' });
  } catch (err) {
    console.error('Failed to save expense:', err);
    res.status(500).json({ message: 'Failed to save expense', errorDetails: err.message });
  }
});

module.exports = router;
