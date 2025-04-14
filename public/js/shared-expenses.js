document.getElementById('sharedExpenseForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const title = document.getElementById('expenseTitle').value;
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const paidBy = document.getElementById('paidBy').value;
  const participants = document.getElementById('participants').value;

  const expenseData = {
    title: title,
    amount: amount,
    paid_by: paidBy,
    participants: participants
  };

  // Send a POST request to the backend API
  fetch('/api/shared-expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(expenseData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert('Expense added successfully!');
      loadSharedExpenses(); // Reload expenses after adding a new one
    } else {
      alert('Failed to add expense: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error submitting the expense.');
  });
});

// Function to load shared expenses and display them in the history section
function loadSharedExpenses() {
  fetch('/api/shared-expenses')
    .then(response => response.json())
    .then(data => {
      const listElement = document.getElementById('sharedExpenseList');
      listElement.innerHTML = ''; // Clear the current list
      data.forEach(expense => {
        const expenseItem = document.createElement('div');
        expenseItem.classList.add('expense-item');
        expenseItem.innerHTML = `<h5>${expense.title}</h5><p>Amount: $${expense.amount}</p><p>Paid By: ${expense.paid_by}</p>`;
        listElement.appendChild(expenseItem);
      });
    })
    .catch(error => console.error('Error loading shared expenses:', error));
}

// Load expenses when the page loads
loadSharedExpenses();
