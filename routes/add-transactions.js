document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('transactionForm');
    const typeSelect = document.getElementById('transactionType');
    const categorySelect = document.getElementById('transactionCategory');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const spinner = document.getElementById('spinner');
  
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add transactions');
      window.location.href = '/login';
      return;
    }
  
    // Set default date to today
    document.getElementById('transactionDate').valueAsDate = new Date();
  
    // Category options
    const categories = {
      income: [
        { value: 'salary', label: 'Salary' },
        { value: 'freelance', label: 'Freelance' },
        { value: 'investment', label: 'Investment' },
        { value: 'gift', label: 'Gift' },
        { value: 'other', label: 'Other Income' }
      ],
      expense: [
        { value: 'food', label: 'Food' },
        { value: 'bills', label: 'Utility Bills' },
        { value: 'transportation', label: 'Transportation' },
        { value: 'housing', label: 'Housing' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'health', label: 'Health' },
        { value: 'shopping', label: 'Shopping' },
        { value: 'other', label: 'Other Expense' }
      ]
    };
  
    // Update categories based on selected type
    typeSelect.addEventListener('change', function() {
      const type = this.value;
      categorySelect.innerHTML = '<option value="">Select category</option>';
      
      if (type && categories[type]) {
        categories[type].forEach(category => {
          const option = document.createElement('option');
          option.value = category.value;
          option.textContent = category.label;
          categorySelect.appendChild(option);
        });
      }
    });
  
    // Form submission
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Show loading state
      submitBtn.disabled = true;
      submitText.textContent = 'Processing...';
      spinner.classList.remove('d-none');
  
      // Get form values
      const type = typeSelect.value;
      const amount = parseFloat(document.getElementById('transactionAmount').value);
      const category = categorySelect.value;
      const date = document.getElementById('transactionDate').value;
      const description = document.getElementById('transactionDescription').value;
      const receiptFile = document.getElementById('transactionReceipt').files[0];
  
      // Validation
      if (!type || isNaN(amount) || amount <= 0 || !category || !date) {
        showError('Please fill all required fields correctly.');
        return;
      }
  
      try {
        // Create FormData if there's a receipt, else use JSON
        let body;
        let headers = {
          'Authorization': `Bearer ${token}`
        };
  
        if (receiptFile) {
          body = new FormData();
          body.append('type', type);
          body.append('amount', amount);
          body.append('category', category);
          body.append('date', date);
          body.append('description', description);
          body.append('receipt', receiptFile);
        } else {
          body = JSON.stringify({
            type,
            amount,
            category,
            date,
            description
          });
          headers['Content-Type'] = 'application/json';
        }
  
        const response = await fetch('/transactions', {
          method: 'POST',
          headers: headers,
          body: body
        });
  
        // Handle 401 Unauthorized
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
  
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || 'Failed to add transaction');
        }
  
        // Success
        showSuccess('Transaction added successfully!');
        form.reset();
        setTimeout(() => window.location.href = '/transactions', 1500);
      } catch (err) {
        console.error('Transaction error:', err);
        showError(err.message || 'An error occurred while adding the transaction');
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.textContent = 'Add Transaction';
        spinner.classList.add('d-none');
      }
    });
  
    // Helper functions
    function showError(message) {
      alert(message); // Replace with a better UI notification if available
    }
  
    function showSuccess(message) {
      alert(message); // Replace with a better UI notification if available
    }
  });