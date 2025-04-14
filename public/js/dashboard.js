document.addEventListener('DOMContentLoaded', () => {
  fetchDashboardData();

  async function fetchDashboardData() {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();

      // Update user information
      document.getElementById('username').textContent = data.user.username || 'User';
      document.getElementById('user-email').textContent = data.user.email || '';

      // Update financial data
      document.querySelector('.total-balance p').textContent = `$${data.totalBalance.toFixed(2)}`;
      document.querySelector('.income p').textContent = `$${data.totalIncome.toFixed(2)}`;
      document.querySelector('.expenses p').textContent = `$${data.totalExpense.toFixed(2)}`;
      document.querySelector('.budget-left p').textContent = `$${data.budgetLeft.toFixed(2)}`;
      
      // Update progress bar
      document.querySelector('.budget-left .progress-bar').style.width = `${data.budgetUsedPercent}%`;
      document.querySelector('.budget-left .budget-text').textContent = 
        `${parseFloat(data.budgetUsedPercent).toFixed(0)}% of $${data.monthlyLimit.toFixed(2)} remaining`;

      // Add trend indicators
      const balanceChangeElement = document.createElement('span');
      balanceChangeElement.className = `card-trend ${data.balanceChange > 0 ? 'positive' : 'negative'}`;
      balanceChangeElement.innerHTML = `<i class="fas fa-arrow-${data.balanceChange > 0 ? 'up' : 'down'}"></i> ${Math.abs(data.balanceChange)}% from last month`;
      document.querySelector('.total-balance .card-content').appendChild(balanceChangeElement);

      // Render other components
      renderTransactions(data.recentTransactions);
      renderBudgetOverview(data.budgetBreakdown);
      renderGoals(data.goals);
      
    } catch (err) {
      console.error('Dashboard data error:', err);
      // Show error to user
      document.getElementById('username').textContent = 'Error loading data';
    }
  }

  function renderTransactions(transactions) {
    const container = document.querySelector('.transactions-list');
    if (!transactions || !transactions.length) {
      container.innerHTML = '<div class="transaction-item">No recent transactions</div>';
      return;
    }
    
    container.innerHTML = transactions.map(tx => `
      <div class="transaction-item">
        <div class="transaction-icon">
          <i class="fas ${getTransactionIcon(tx.category)}"></i>
        </div>
        <div class="transaction-details">
          <span class="transaction-title">${tx.description || tx.category}</span>
          <span class="transaction-category">${tx.category}</span>
        </div>
        <div class="transaction-amount ${tx.type === 'income' ? 'positive' : 'negative'}">
          ${tx.type === 'income' ? '+' : '-'}$${tx.amount.toFixed(2)}
        </div>
      </div>
    `).join('');
  }

  function getTransactionIcon(category) {
    const icons = {
      'groceries': 'fa-shopping-basket',
      'rent': 'fa-home',
      'utilities': 'fa-bolt',
      'dining': 'fa-utensils',
      'entertainment': 'fa-film',
      'transportation': 'fa-car',
      'shopping': 'fa-shopping-bag',
      'health': 'fa-heartbeat',
      'education': 'fa-book',
      'subscriptions': 'fa-music'
    };
    return icons[category.toLowerCase()] || 'fa-receipt';
  }

  function renderBudgetOverview(budgets) {
    const pieChart = document.querySelector('.pie-chart-inner');
    if (!budgets || !budgets.length) {
      pieChart.innerHTML = '<div class="no-data">No budget data</div>';
      return;
    }

    // Create pie chart segments
    pieChart.innerHTML = budgets.map((b, i) => {
      const start = i === 0 ? 0 : budgets.slice(0, i).reduce((acc, curr) => acc + curr.usedPercent, 0);
      const end = start + b.usedPercent;
      return `
        <div class="pie-segment" 
             style="--start: ${start}; --end: ${end}; --color: ${getCategoryColor(b.category)}">
        </div>
      `;
    }).join('');

    // Update legend
    const legend = document.querySelector('.pie-legend');
    legend.innerHTML = budgets.map(b => `
      <div class="legend-item">
        <span class="legend-color" style="background-color: ${getCategoryColor(b.category)}"></span>
        <span class="legend-label">${b.category} (${parseFloat(b.usedPercent).toFixed(0)}%)</span>
        <span class="legend-value">$${parseFloat(b.spent).toFixed(2)} / $${parseFloat(b.limit).toFixed(2)}</span>
      </div>
    `).join('');
  }

  function getCategoryColor(category) {
    const colors = {
      'groceries': '#1abc9c',
      'rent': '#e74c3c',
      'utilities': '#3498db',
      'dining': '#f39c12',
      'entertainment': '#9b59b6',
      'transportation': '#34495e',
      'shopping': '#e67e22',
      'health': '#e91e63',
      'education': '#2ecc71',
      'subscriptions': '#3498db'
    };
    return colors[category.toLowerCase()] || '#7f8c8d';
  }

  function renderGoals(goals) {
    const container = document.querySelector('.goals-list');
    if (!goals || !goals.length) {
      container.innerHTML = '<div class="goal-item">No active goals</div>';
      return;
    }
    
    container.innerHTML = goals.map(goal => `
      <div class="goal-item">
        <div class="goal-info">
          <span class="goal-title">${goal.name}</span>
          <div class="goal-progress">
            <div class="progress-bar" style="width: ${goal.progressPercent}%"></div>
          </div>
          <span class="goal-amount">$${parseFloat(goal.saved).toFixed(2)} of $${parseFloat(goal.target).toFixed(2)}</span>
        </div>
        <div class="goal-percentage">${parseFloat(goal.progressPercent).toFixed(0)}%</div>
      </div>
    `).join('');
  }
});