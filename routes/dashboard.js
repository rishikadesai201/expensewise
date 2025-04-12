const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Assuming user ID comes from session or authentication middleware
// const USER_ID = req.user.id; // Uncomment if you're using session-based auth

const USER_ID = 1; // Placeholder for user ID

router.get('/', async (req, res) => {
  try {
    // Fetch user-related data from the database
    const [[{ totalIncome }]] = await db.execute('SELECT SUM(amount) as totalIncome FROM transactions WHERE user_id = ? AND type = "income"', [USER_ID]);
    const [[{ totalExpense }]] = await db.execute('SELECT SUM(amount) as totalExpense FROM transactions WHERE user_id = ? AND type = "expense"', [USER_ID]);
    const [[{ lastMonthBalance }]] = await db.execute(`
      SELECT SUM(CASE WHEN type='income' THEN amount ELSE -amount END) as lastMonthBalance
      FROM transactions
      WHERE user_id = ? AND MONTH(date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
    `, [USER_ID]);

    const [budgets] = await db.execute('SELECT * FROM budgets WHERE user_id = ?', [USER_ID]);
    const [goals] = await db.execute('SELECT * FROM goals WHERE user_id = ?');
    const [transactions] = await db.execute('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 5', [USER_ID]);

    // Ensure total income/expense values are numbers (fallback to 0)
    const totalBalance = (totalIncome || 0) - (totalExpense || 0);
    const monthlyLimit = budgets.reduce((acc, b) => acc + parseFloat(b.limit), 0);
    const [spentResults, budgetSpent] = await Promise.all([
      Promise.all(budgets.map(async (b) => {
        const [spentResult] = await db.execute(
          'SELECT SUM(amount) as spent FROM transactions WHERE user_id = ? AND category = ? AND type = "expense"',
          [USER_ID, b.category]
        );
        const spent = spentResult[0].spent || 0;
        return {
          category: b.category,
          limit: `$${b.limit.toFixed(2)}`,
          spent: `$${spent.toFixed(2)}`,
          usedPercent: b.limit ? (spent / b.limit) * 100 : 0
        };
      })),
      getBudgetSpent(USER_ID)
    ]);

    const budgetUsedPercent = monthlyLimit ? (budgetSpent / monthlyLimit) * 100 : 0;

    const goalSummaries = goals.map(g => ({
      name: g.name,
      target: g.target,
      saved: g.saved,
      progressPercent: g.target ? (g.saved / g.target) * 100 : 0
    }));

    const user = { name: "Alex" }; // Replace with real user data

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
