const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  const userId = req.user.userId;
  
  try {
    // Execute all queries in parallel
    const [incomeResult, expenseResult, categoryResult] = await Promise.all([
      db.promise().query(
        'SELECT SUM(amount) AS total FROM transactions WHERE user_id = ? AND type = "income"',
        [userId]
      ),
      db.promise().query(
        'SELECT SUM(amount) AS total FROM transactions WHERE user_id = ? AND type = "expense"',
        [userId]
      ),
      db.promise().query(
        `SELECT category, SUM(amount) AS total 
         FROM transactions 
         WHERE user_id = ? AND type = "expense"
         GROUP BY category`,
        [userId]
      )
    ]);

    const totalIncome = incomeResult[0][0]?.total || 0;
    const totalExpenses = expenseResult[0][0]?.total || 0;
    
    const categories = categoryResult[0].map(row => row.category);
    const categoryTotals = categoryResult[0].map(row => row.total);

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