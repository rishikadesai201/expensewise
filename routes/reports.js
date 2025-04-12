const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Assuming USER_ID comes from session or auth middleware
// const USER_ID = req.user.id; // Uncomment for actual user authentication
const USER_ID = 1; // Placeholder for user ID

router.get('/', async (req, res) => {
  try {
    // Combine income, expenses, and category query into one for efficiency
    const [incomeRows] = await db.execute(
      'SELECT SUM(amount) AS totalIncome FROM transactions WHERE user_id = ? AND type = "income"',
      [USER_ID]
    );
    const [expenseRows] = await db.execute(
      'SELECT SUM(amount) AS totalExpenses FROM transactions WHERE user_id = ? AND type = "expense"',
      [USER_ID]
    );
    const [categoryRows] = await db.execute(
      `SELECT category, SUM(amount) AS total 
       FROM transactions 
       WHERE user_id = ? AND type = "expense"
       GROUP BY category`,
      [USER_ID]
    );

    const totalIncome = incomeRows[0].totalIncome || 0;
    const totalExpenses = expenseRows[0].totalExpenses || 0;
    const categories = categoryRows.map(row => row.category);
    const categoryTotals = categoryRows.map(row => row.total);

    res.json({
      totalIncome,
      totalExpenses,
      categories,
      categoryTotals
    });
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ message: 'Error generating report', errorDetails: err.message });
  }
});

module.exports = router;
