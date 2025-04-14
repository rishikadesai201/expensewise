document.addEventListener("DOMContentLoaded", () => {
  // Check authentication first
  if (!localStorage.getItem('token')) {
    window.location.href = '/signin';
    return;
  }

  fetchTransactions();
  populateCategories();

  document.getElementById("filterForm").addEventListener("reset", () => {
    setTimeout(fetchTransactions, 100); // wait for reset
  });

  document.getElementById("transactionForm").addEventListener("submit", handleTransactionSubmit);
});

// Fetch transactions with filters
async function fetchTransactions() {
  try {
    // Check and refresh token if needed
    if (!await Auth.checkAuth()) return;

    const response = await fetch('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${Auth.getToken()}`
      }
    });

    if (response.status === 401) {
      // Attempt token refresh
      try {
        await Auth.refreshToken();
        return fetchTransactions(); // Retry with new token
      } catch (error) {
        Auth.clearAuth();
        window.location.href = '/signin';
        return;
      }
    }
  } catch (error) {
    console.error("Authentication error:", error);
  }
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/signin';
      return;
    }

    const type = document.getElementById("filterType").value;
    const category = document.getElementById("filterCategory").value;
    const from = document.getElementById("filterFromDate").value;
    const to = document.getElementById("filterToDate").value;

    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (category) params.append("category", category);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await fetch(`/api/transactions?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
      return;
    }

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const transactions = await res.json();
    console.log("Fetched transactions:", transactions);
    renderTransactions(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    showError(`Failed to load transactions: ${err.message}`);
  }
}

// Enhanced handleTransactionSubmit
async function handleTransactionSubmit(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/signin';
    return;
  }

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    const data = {
      type: document.getElementById("transactionType").value,
      amount: parseFloat(document.getElementById("transactionAmount").value),
      category: document.getElementById("transactionCategory").value,
      date: document.getElementById("transactionDate").value
    };

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
      return;
    }

    if (!res.ok) {
      let message = "Failed to save transaction";
      try {
        const errorData = await res.json();
        message = errorData.error || message;
      } catch {
        message = await res.text();
      }
      throw new Error(message);
    }

    closeTransactionModal();
    fetchTransactions();
    showSuccess("Transaction added successfully!");
  } catch (err) {
    console.error("Transaction submission error:", err);
    showError(err.message || "Failed to add transaction");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Helper functions for showing messages
function showError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'alert alert-error';
  errorElement.textContent = message;
  document.body.prepend(errorElement);
  setTimeout(() => errorElement.remove(), 5000);
}

function showSuccess(message) {
  const successElement = document.createElement('div');
  successElement.className = 'alert alert-success';
  successElement.textContent = message;
  document.body.prepend(successElement);
  setTimeout(() => successElement.remove(), 5000);
}

function renderTransactions(transactions) {
  const tableBody = document.getElementById("transactionsList");
  tableBody.innerHTML = "";

  if (transactions.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6">No transactions found.</td></tr>`;
    return;
  }

  transactions.forEach((tx) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date(tx.date).toLocaleDateString()}</td>
      <td>${tx.type}</td>
      <td>${tx.category}</td>
      <td>-</td>
      <td>$${Number(tx.amount).toFixed(2)}</td>
      <td>
        <button onclick="editTransaction(${tx.id})">✏️</button>
        <button onclick="deleteTransaction(${tx.id})">🗑️</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Transaction modal handlers
function openTransactionModal() {
  document.getElementById("addTransactionModal").style.display = "block";
}

function closeTransactionModal() {
  document.getElementById("addTransactionModal").style.display = "none";
  document.getElementById("transactionForm").reset();
}

async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;
  try {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchTransactions();
    } else {
      alert("Failed to delete transaction.");
    }
  } catch (err) {
    console.error("Error deleting:", err);
  }
}

// Populate categories in filter + form
async function populateCategories() {
  try {
    const res = await fetch("/api/categories");
    const categories = await res.json();

    const filterCat = document.getElementById("filterCategory");
    const formCat = document.getElementById("transactionCategory");

    // Clear existing options
    filterCat.innerHTML = `<option value="">All Categories</option>`;
    formCat.innerHTML = `<option value="">Select category</option>`;

    // Populate dropdowns with categories
    categories.forEach(cat => {
      const filterOption = new Option(cat.label, cat.value); // Use label for display, value for the value
      const formOption = new Option(cat.label, cat.value);
      filterCat.appendChild(filterOption);
      formCat.appendChild(formOption);
    });
  } catch (err) {
    console.error("Error loading categories:", err);
  }
}