document.addEventListener('DOMContentLoaded', () => {
  fetchLoans();

  const form = document.getElementById('loanForm');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const loan = {
      name: document.getElementById('loanName').value.trim(),
      amount: parseFloat(document.getElementById('loanAmount').value),
      lender: document.getElementById('lenderName').value.trim(),
      interest_rate: parseFloat(document.getElementById('interestRate').value),
      due_date: document.getElementById('loanDueDate').value
    };

    if (!loan.name || isNaN(loan.amount) || !loan.lender || isNaN(loan.interest_rate) || !loan.due_date) {
      alert('Please fill in all loan details correctly.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
      return;
    }

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loan)
      });

      if (!res.ok) throw new Error('Failed to add loan');

      form.reset();
      fetchLoans();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  });
});

async function fetchLoans() {
  const container = document.getElementById('loan-list');
  container.innerHTML = '<p>Loading loans...</p>';

  try {
    const res = await fetch('/api/loans');
    const loans = await res.json();

    if (!loans.length) {
      container.innerHTML = '<p>No loans found.</p>';
      return;
    }

    container.innerHTML = `
      <ul class="loan-list">
        ${loans.map(loan => `
          <li class="loan-item">
            <strong>${loan.name}</strong> - $${loan.amount.toFixed(2)} from ${loan.lender}<br>
            Interest: ${loan.interest_rate}% | Due: ${new Date(loan.due_date).toLocaleDateString()}
          </li>
        `).join('')}
      </ul>`;
  } catch (err) {
    container.innerHTML = '<p>Error loading loans. Please try again later.</p>';
  }
}
