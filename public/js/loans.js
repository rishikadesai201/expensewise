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

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Failed to add loan');

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
            <strong>${loan.name}</strong> - $${parseFloat(loan.amount).toFixed(2)} from ${loan.lender}<br>
            Interest: ${loan.interest_rate}% | Due: ${new Date(loan.due_date).toLocaleDateString()}
            <button class="btn btn-primary btn-delete" data-id="${loan.id}" style="margin-left:10px; margin-top:5px;">Delete</button>
          </li>
        `).join('')}
      </ul>
    `;

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this loan?')) {
          deleteLoan(id);
        }
      });
    });

  } catch (err) {
    container.innerHTML = '<p>Error loading loans. Please try again later.</p>';
  }
}

async function deleteLoan(id) {
  try {
    const res = await fetch(`/api/loans/${id}`, { method: 'DELETE' });
    const result = await res.json(); // <- Make sure backend returns valid JSON

    if (!res.ok) throw new Error(result.message || 'Failed to delete loan');
    
    fetchLoans();
  } catch (err) {
    alert('Error deleting loan: ' + err.message);
  }
}
