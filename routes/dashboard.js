const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch user-related data from the database
    const [[{ totalIncome }]] = await db.execute(
      'SELECT SUM(amount) as totalIncome FROM transactions WHERE user_id = ? AND type = "income"',
      [userId]
    );
    
    const [[{ totalExpense }]] = await db.execute(
      'SELECT SUM(amount) as totalExpense FROM transactions WHERE user_id = ? AND type = "expense"',
      [userId]
    );
    
    const [[{ lastMonthBalance }]] = await db.execute(
      `SELECT SUM(CASE WHEN type='income' THEN amount ELSE -amount END) as lastMonthBalance
       FROM transactions
       WHERE user_id = ? AND MONTH(date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)`,
      [userId]
    );

    const [budgets] = await db.execute(
      'SELECT * FROM budgets WHERE user_id = ?',
      [userId]
    );
    
    const [goals] = await db.execute(
      'SELECT * FROM goals WHERE user_id = ?',
      [userId]
    );
    
    const [transactions] = await db.execute(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 5',
      [userId]
    );

    // Get user details
    const [[user]] = await db.execute(
      'SELECT username, email FROM users WHERE id = ?',
      [userId]
    );

    // Process data
    const totalBalance = (totalIncome || 0) - (totalExpense || 0);
    const monthlyLimit = budgets.reduce((acc, b) => acc + parseFloat(b.amount), 0);
    
    const [spentResults, budgetSpent] = await Promise.all([
      Promise.all(budgets.map(async (b) => {
        const [[{ spent }]] = await db.execute(
          'SELECT SUM(amount) as spent FROM transactions WHERE user_id = ? AND category = ? AND type = "expense"',
          [userId, b.category]
        );
        return {
          category: b.category,
          limit: b.amount,
          spent: spent || 0,
          usedPercent: b.amount ? ((spent || 0) / b.amount) * 100 : 0
        };
      })),
      getBudgetSpent(userId)
    ]);

    const budgetUsedPercent = monthlyLimit ? (budgetSpent / monthlyLimit) * 100 : 0;

    const goalSummaries = goals.map(g => ({
      name: g.name,
      target: g.target_amount,
      saved: g.current_amount,
      progressPercent: g.target_amount ? (g.current_amount / g.target_amount) * 100 : 0
    }));

    res.json({
      user,
      totalBalance,
      monthlyLimit,
      balanceChange: lastMonthBalance ? (((totalBalance - lastMonthBalance) / lastMonthBalance) * 100).toFixed(2) : 0,
      budgetLeft: monthlyLimit - budgetSpent,
      budgetUsedPercent: budgetUsedPercent.toFixed(1),
      totalIncome: totalIncome || 0,
      activeGoals: goals.length,
      recentTransactions: transactions,
      budgetBreakdown: spentResults,
      goals: goalSummaries,
      tipOfTheDay: getTipOfTheDay()
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Dashboard failed to load' });
  }
});

async function getBudgetSpent(userId) {
  const [[{ spent }]] = await db.execute(
    'SELECT SUM(amount) as spent FROM transactions WHERE user_id = ? AND type = "expense"',
    [userId]
  );
  return spent || 0;
}

function getTipOfTheDay() {
  const tips = [
    "Track your spending daily to avoid surprises.",
    "Review your subscriptions monthly.",
    "Set a budget for fun — it's still important!",
    "Automate savings to reach goals faster.",
    "Cook more at home to save hundreds monthly."
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

module.exports = router;