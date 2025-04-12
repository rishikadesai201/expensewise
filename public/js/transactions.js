// public/js/transactions.js

document.addEventListener("DOMContentLoaded", () => {
  fetchTransactions();
  populateCategories();

  document.getElementById("filterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    fetchTransactions();
  });

  document.getElementById("filterForm").addEventListener("reset", () => {
    setTimeout(fetchTransactions, 100); // wait for reset
  });

  document.getElementById("transactionForm").addEventListener("submit", handleTransactionSubmit);
});

// Fetch transactions with filters
async function fetchTransactions() {
  try {
    const type = document.getElementById("filterType").value;
    const category = document.getElementById("filterCategory").value;
    const from = document.getElementById("filterFromDate").value;
    const to = document.getElementById("filterToDate").value;

    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (category) params.append("category", category);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await fetch(`/api/transactions?${params.toString()}`);
    const transactions = await res.json();
    renderTransactions(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
  }
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
      <td>${tx.description || ""}</td>
      <td>$${tx.amount.toFixed(2)}</td>
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

// Save transaction
async function handleTransactionSubmit(e) {
  e.preventDefault();
  const data = {
    type: document.getElementById("transactionType").value,
    amount: parseFloat(document.getElementById("transactionAmount").value),
    category: document.getElementById("transactionCategory").value,
    date: document.getElementById("transactionDate").value,
    description: document.getElementById("transactionDescription").value
  };

  try {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      closeTransactionModal();
      fetchTransactions();
    } else {
      alert("Failed to add transaction.");
    }
  } catch (err) {
    console.error("Transaction submission error:", err);
  }
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

    filterCat.innerHTML = `<option value="">All Categories</option>`;
    formCat.innerHTML = `<option value="">Select category</option>`;

    categories.forEach(cat => {
      const opt1 = new Option(cat.name, cat.name);
      const opt2 = new Option(cat.name, cat.name);
      filterCat.appendChild(opt1);
      formCat.appendChild(opt2);
    });
  } catch (err) {
    console.error("Error loading categories:", err);
  }
}
