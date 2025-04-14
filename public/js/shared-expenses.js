document.addEventListener('DOMContentLoaded', () => {
  fetchSharedExpenses();

  const form = document.getElementById('sharedExpenseForm');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('expenseTitle').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const paidBy = document.getElementById('paidBy').value.trim();
    const participants = document.getElementById('participants').value
      .split(',')
      .map(p => p.trim())
      .filter(p => p);

    if (!title || isNaN(amount) || amount <= 0 || !paidBy || participants.length === 0) {
      return alert("Please fill in all fields correctly.");
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';

    try {
      const res = await fetch('/api/shared-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, amount, paid_by: paidBy, participants })
      });

      if (!res.ok) throw new Error('Failed to save expense');

      form.reset();
      fetchSharedExpenses();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Shared Expense';
    }
  });
});

async function fetchSharedExpenses() {
  const list = document.getElementById('sharedExpenseList');
  list.innerHTML = '<p>Loading shared expenses...</p>';

  try {
    const res = await fetch('/api/shared-expenses');
    const data = await res.json();

    if (!data.length) {
      list.innerHTML = '<p>No shared expenses found.</p>';
      return;
    }

    list.innerHTML = `
      <ul class="shared-expense-list">
        ${data.map(exp => `
          <li class="shared-expense-item">
            <strong>${exp.title}</strong> - $${exp.amount.toFixed(2)}<br/>
            <em>Paid by: ${exp.paid_by}</em><br/>
            Participants: ${exp.participants.join(', ')}
          </li>
        `).join('')}
      </ul>`;
  } catch (err) {
    list.innerHTML = '<p>Error loading shared expenses.</p>';
  }
}
