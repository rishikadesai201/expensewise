document.addEventListener('DOMContentLoaded', () => {
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
  
    // Define categories (static for now, can be fetched from API later)
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
        { value: 'bills', label: 'Bills' },
        { value: 'transportation', label: 'Transportation' },
        { value: 'housing', label: 'Housing' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'health', label: 'Health' },
        { value: 'shopping', label: 'Shopping' },
        { value: 'other', label: 'Other Expense' }
      ]
    };
  
    // Update categories when type changes
    typeSelect.addEventListener('change', () => {
      updateCategories(typeSelect.value);
    });
  
    // Initialize categories if type is already selected
    if (typeSelect.value) {
      updateCategories(typeSelect.value);
    }
  
    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Show loading state
      submitBtn.disabled = true;
      submitText.textContent = 'Processing...';
      if (spinner) spinner.style.display = 'inline-block';
  
      try {
        // Get form data
        const type = typeSelect.value;
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const category = categorySelect.value;
        const date = document.getElementById('transactionDate').value;
        const description = document.getElementById('transactionDescription').value;
        const receiptFile = document.getElementById('transactionReceipt').files[0];
  
        // Validate
        if (!type || !amount || !category || !date) {
          throw new Error('Please fill all required fields!');
        }
  
        // Submit to backend
        const formData = new FormData();
        formData.append('type', type);
        formData.append('amount', amount);
        formData.append('category', category);
        formData.append('date', date);
        if (description) formData.append('description', description);
        if (receiptFile) formData.append('receipt', receiptFile);
  
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to add transaction');
        }
  
        // Success
        alert('Transaction added successfully!');
        form.reset();
        window.location.href = '/transactions'; // Redirect to transactions page
  
      } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.textContent = 'Add Transaction';
        if (spinner) spinner.style.display = 'none';
      }
    });
  
    // Helper: Update categories dropdown
    function updateCategories(type) {
      categorySelect.innerHTML = '<option value="">Select category</option>';
      
      if (type && categories[type]) {
        categories[type].forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.value;
          option.textContent = cat.label;
          categorySelect.appendChild(option);
        });
      }
    }
  });