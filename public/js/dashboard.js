document.addEventListener('DOMContentLoaded', () => {
  fetchDashboardData();

  async function fetchDashboardData() {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();

      document.getElementById('username').textContent = data.user.name || 'User';
      document.getElementById('total-balance').textContent = `$${data.totalBalance.toFixed(2)}`;
      document.getElementById('monthly-limit').textContent = `$${data.monthlyLimit.toFixed(2)} monthly limit`;
      document.getElementById('balance-change').textContent = `${data.balanceChange > 0 ? '+' : ''}${data.balanceChange}% vs last month`;

      document.getElementById('budget-left').textContent = `$${data.budgetLeft.toFixed(2)}`;
      document.getElementById('budget-progress').style.width = `${data.budgetUsedPercent}%`;

      document.getElementById('total-income').textContent = `$${data.totalIncome.toFixed(2)}`;
      document.getElementById('active-goals').textContent = data.activeGoals;

      renderTransactions(data.recentTransactions);
      renderBudgetOverview(data.budgetBreakdown);
      renderGoals(data.goals);
      document.getElementById('tip-text').textContent = data.tipOfTheDay || "Plan before you spend!";

      // Show initial balance modal if needed
      if ((data.totalBalance === 0 || data.initialBalance === 0) && data.totalIncome === 0) {
        const modal = document.getElementById('initial-balance-modal');
        const submitBtn = document.getElementById('submit-initial-balance');

        if (modal && submitBtn) {
          modal.classList.remove('hidden');

          submitBtn.addEventListener('click', async () => {
            const input = document.getElementById('initial-balance-input');
            const balance = parseFloat(input.value);
            if (isNaN(balance) || balance < 0) {
              alert("Please enter a valid number.");
              return;
            }

            try {
              const res = await fetch('/api/users/set-initial-balance', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ initial_balance: balance })
              });

              if (!res.ok) throw new Error('Failed to update initial balance');

              modal.classList.add('hidden');
              fetchDashboardData(); // Reload dashboard data
            } catch (err) {
              console.error(err);
              alert("Something went wrong.");
            }
          });
        }
      }
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
