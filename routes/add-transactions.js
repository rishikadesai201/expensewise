document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transactionForm');
  
    form.addEventListener('submit', function (e) {
      e.preventDefault();
  
      const type = document.getElementById('transactionType').value;
      const amount = parseFloat(document.getElementById('transactionAmount').value);
      const category = document.getElementById('transactionCategory').value;
      const date = document.getElementById('transactionDate').value;
      const description = document.getElementById('transactionDescription').value;
      const receipt = document.getElementById('transactionReceipt').files[0];
  
      if (!type || isNaN(amount) || amount <= 0 || !category || !date) {
        alert('Please fill all required fields correctly.');
        return;
      }
  
      const transaction = {
        id: Date.now(),
        type,
        amount,
        category,
        date,
        description,
        receiptName: receipt ? receipt.name : null
      };
  
      // Save to localStorage (for demo purposes)
      const existing = JSON.parse(localStorage.getItem('transactions')) || [];
      existing.push(transaction);
      localStorage.setItem('transactions', JSON.stringify(existing));
  
      alert('Transaction added successfully!');
      form.reset();
    });
  });
  