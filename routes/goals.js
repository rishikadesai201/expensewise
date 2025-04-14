const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all goals
router.get('/', async (req, res) => {
  try {
    const [goals] = await db.query('SELECT * FROM goals ORDER BY id DESC');
    res.json(goals);
  } catch (err) {
    console.error('Failed to fetch goals:', err);
    res.status(500).json({ error: 'Failed to fetch goals', errorDetails: err.message });
  }
});

// Create a new goal
router.post('/', async (req, res) => {
  const { title, description, target_amount } = req.body;

  if (!title || !description || !target_amount) {
    return res.status(400).json({ error: 'Title, description, and target amount are required.' });
  }

  if (isNaN(target_amount) || target_amount <= 0) {
    return res.status(400).json({ error: 'Target amount must be a positive number.' });
  }

  try {
    await db.query(
      'INSERT INTO goals (title, description, target_amount, saved_amount) VALUES (?, ?, ?, 0)',
      [title, description, target_amount]
    );
    res.status(201).json({ message: 'Goal created successfully.' });
  } catch (err) {
    console.error('Failed to create goal:', err);
    res.status(500).json({ error: 'Failed to create goal', errorDetails: err.message });
  }
});

// Update saved amount
router.put('/:id', async (req, res) => {
  const { saved_amount } = req.body;
  const { id } = req.params;

  if (isNaN(saved_amount) || saved_amount < 0) {
    return res.status(400).json({ error: 'Saved amount must be a valid positive number.' });
  }

  try {
    await db.query('UPDATE goals SET saved_amount = ? WHERE id = ?', [saved_amount, id]);
    res.json({ message: 'Goal updated successfully.' });
  } catch (err) {
    console.error('Failed to update goal:', err);
    res.status(500).json({ error: 'Failed to update goal', errorDetails: err.message });
  }
});

// Delete a goal
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM goals WHERE id = ?', [id]);
    res.json({ message: 'Goal deleted successfully.' });
  } catch (err) {
    console.error('Failed to delete goal:', err);
    res.status(500).json({ error: 'Failed to delete goal', errorDetails: err.message });
  }
});

module.exports = router;

