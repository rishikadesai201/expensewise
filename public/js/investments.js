document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('investmentForm');
  const listContainer = document.getElementById('investment-list');

  // Load investments function
  const loadInvestments = async () => {
    try {
      const token = Auth.getToken();
      console.log('Loaded token:', token);  // Debugging line to check if token is retrieved

      const res = await fetch('/api/investments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.status === 401) {
        console.log('Unauthorized - redirecting to login');
        Auth.redirectToLogin();
        return;
      }

      const data = await res.json();
      if (data.success && data.investments.length > 0) {
        listContainer.innerHTML = '';
        data.investments.forEach(investment => {
          const item = document.createElement('div');
          item.className = 'investment-item';
          item.innerHTML = `
            <h4>${investment.name} <span class="badge">${investment.type}</span></h4>
            <p>Invested: $${investment.amount}</p>
            <p>Date: ${new Date(investment.purchase_date).toLocaleDateString()}</p>
          `;
          listContainer.appendChild(item);
        });
      } else {
        listContainer.innerHTML = '<p>No investments found.</p>';
      }
    } catch (err) {
      console.error('Error loading investments:', err);
      listContainer.innerHTML = '<p>Error loading investments.</p>';
    }
  };

  // Form submission handler for adding new investments
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newInvestment = {
      name: document.getElementById('investmentName').value,
      amount: parseFloat(document.getElementById('investmentAmount').value),
      type: document.getElementById('investmentType').value,
      purchase_date: document.getElementById('investmentDate').value
    };

    try {
      const token = Auth.getToken();
      console.log('Posting investment with token:', token);  // Debugging line for token

      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newInvestment)
      });

      if (res.status === 401) {
        console.log('Unauthorized - redirecting to login');
        Auth.redirectToLogin();
        return;
      }

      const result = await res.json();
      if (result.success) {
        form.reset();
        loadInvestments();
      } else {
        alert('Failed to add investment: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error adding investment:', err);
      alert('Error adding investment. Please try again.');
    }
  });

  // Check auth before loading investments
  Auth.checkAuth().then(isAuthenticated => {
    if (isAuthenticated) {
      loadInvestments();
    }
  });
});
