const express = require('express');
const router = express.Router();
const db = require('../config/db');

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
       WHERE user_id = ? AND type = "expense" /* Fixed typo from "expense" to "expense" */
       GROUP BY category`,
      [USER_ID]
    );

    const totalIncome = incomeRows[0]?.totalIncome || 0;
    const totalExpenses = expenseRows[0]?.totalExpenses || 0;
    const categories = Array.isArray(categoryRows) ? categoryRows.map(row => row.category) : [];
    const categoryTotals = Array.isArray(categoryRows) ? categoryRows.map(row => row.total) : [];

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        categories,
        categoryTotals
      }
    });
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error generating report', 
      errorDetails: {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        sqlError: err.sqlMessage
      }
    });
  }
});

module.exports = router;