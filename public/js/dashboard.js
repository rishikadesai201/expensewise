document.addEventListener('DOMContentLoaded', () => {
  fetchDashboardData();

  async function fetchDashboardData() {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();

      document.getElementById('username').textContent = data.user.name || 'User';
      document.getElementById('total-balance').textContent = `$${data.totalBalance.toFixed(2)}`;
      document.getElementById('monthly-limit').textContent = `$${data.monthlyLimit.toFixed(2)} monthlylimit`;
      document.getElementById('balance-change').textContent = `${data.balanceChange > 0 ? '+' : ''}${data.balanceChange}% vs lastmonth`;

      document.getElementById('budget-left').textContent = `$${data.budgetLeft.toFixed(2)}`;
      document.getElementById('budget-progress').style.width = `${data.budgetUsedPercent}%`;

      document.getElementById('total-income').textContent = `$${data.totalIncome.toFixed(2)}`;
      document.getElementById('active-goals').textContent = data.activeGoals;

      renderTransactions(data.recentTransactions);
      renderBudgetOverview(data.budgetBreakdown);
      renderGoals(data.goals);
      document.getElementById('tip-text').textContent = data.tipOfTheDay || "Plan before you spend!";
    } catch (err) {
      console.error('Dashboard data error:', err);
    }
  }

  function renderTransactions(transactions) {
    const container = document.getElementById('recent-transactions');
    if (!transactions.length) {
      container.innerHTML = '<p>No recent transactions.</p>';
      return;
    }
    container.innerHTML = transactions.map(tx => `
      <div class="transaction-item">
        <strong>${tx.category}</strong>
        <span class="${tx.type === 'income' ? 'positive' : 'negative'}">
          ${tx.type === 'income' ? '+' : '-'}$${tx.amount.toFixed(2)}
        </span>
        <small>${new Date(tx.date).toLocaleDateString()}</small>
      </div>
    `).join('');
  }

  function renderBudgetOverview(budgets) {
    const container = document.getElementById('budget-overview');
    if (!budgets.length) {
      container.innerHTML = '<p>No budgets found.</p>';
      return;
    }
    container.innerHTML = budgets.map(b => `
      <div class="budget-summary">
        <strong>${b.category}</strong>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${b.usedPercent}%;"></div>
        </div>
        <small>${b.spent} / ${b.limit}</small>
      </div>
    `).join('');
  }

  function renderGoals(goals) {
    const container = document.getElementById('goals-progress');
    if (!goals.length) {
      container.innerHTML = '<p>No active goals.</p>';
      return;
    }
    container.innerHTML = goals.map(goal => `
      <div class="goal-summary">
        <strong>${goal.name}</strong>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${goal.progressPercent}%;"></div>
        </div>
        <small>$${goal.saved} / $${goal.target}</small>
      </div>
    `).join('');
  }
});