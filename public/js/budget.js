document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('budgetForm');
  const budgetCategory = document.getElementById('budgetCategory');
  const budgetLimit = document.getElementById('budgetLimit');
  const budgetsList = document.getElementById('budgets-list');

  async function fetchBudgets() {
    budgetsList.innerHTML = '<p>Loading your budgets...</p>';
    try {
      const res = await fetch('/api/budgets');
      const data = await res.json();
      budgetsList.innerHTML = data.length ? data.map(b => `
        <div class="budget-item">
          <h4>${b.category}</h4>
          <p>Limit: $${b.limit.toFixed(2)}</p>
        </div>`).join('') : '<p>No budgets set yet.</p>';
    } catch (err) {
      console.error('Error fetching budgets:', err);
      budgetsList.innerHTML = '<p>Error loading budgets.</p>';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newBudget = {
      category: budgetCategory.value,
      limit: parseFloat(budgetLimit.value)
    };
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBudget)
      });
      if (res.ok) {
        form.reset();
        fetchBudgets();
      } else {
        alert('Failed to add budget.');
      }
    } catch (err) {
      console.error('Failed to submit budget:', err);
    }
  });

  fetchBudgets();
});