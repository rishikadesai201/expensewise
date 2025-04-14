document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('transactionForm');
  
  // Check authentication status
  const token = localStorage.getItem('token');
  if (!token) {
      alert('Please log in to add transactions');
      window.location.href = '/login'; // Redirect to login
      return;
  }

  form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Get form values
      const type = document.getElementById('transactionType').value;
      const amount = parseFloat(document.getElementById('transactionAmount').value);
      const category = document.getElementById('transactionCategory').value;
      const date = document.getElementById('transactionDate').value;
      const description = document.getElementById('transactionDescription').value;

      // Validation
      if (!type || isNaN(amount) || amount <= 0 || !category || !date) {
          alert('Please fill all required fields correctly.');
          return;
      }

      try {
          const response = await fetch('/transactions', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` // Include JWT token
              },
              body: JSON.stringify({
                  type,
                  amount,
                  category,
                  date,
                  description
              })
          });

          if (response.status === 401) {
              // Token expired or invalid
              localStorage.removeItem('token');
              window.location.href = '/login';
              return;
          }

          if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Failed to add transaction');
          }

          // Success
          const result = await response.json();
          alert('Transaction added successfully!');
          form.reset();
          closeTransactionModal();
          loadTransactions(); // Refresh the list
      } catch (err) {
          console.error('Transaction error:', err);
          alert(`Error: ${err.message}`);
      }
  });

  // Load initial transactions
  loadTransactions();
});

// Enhanced loadTransactions function
async function loadTransactions() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
      const response = await fetch('/transactions', {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
      }

      if (!response.ok) throw new Error('Failed to load transactions');

      const transactions = await response.json();
      renderTransactions(transactions);
  } catch (err) {
      console.error('Error loading transactions:', err);
      document.getElementById('transactionsList').innerHTML = 
          '<tr><td colspan="6">Error loading transactions. Please try again.</td></tr>';
  }
}