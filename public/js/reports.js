document.addEventListener('DOMContentLoaded', async () => {
  const spendingChartCanvas = document.getElementById('spendingChart');
  const incomeVsExpenseCanvas = document.getElementById('incomeVsExpenseChart');
  const summaryContainer = document.getElementById('summaryReport');

  async function fetchReportData() {
    try {
      const res = await fetch('/api/reports');
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      summaryContainer.innerHTML = '<p>Error loading report data.</p>';
    }
  }

  function renderSpendingChart(data) {
    new Chart(spendingChartCanvas, {
      type: 'bar',
      data: {
        labels: data.categories,
        datasets: [{
          label: 'Spending by Category ($)',
          data: data.categoryTotals,
          backgroundColor: '#f87171',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Spending Breakdown' }
        }
      }
    });
  }

  function renderIncomeVsExpenseChart(data) {
    new Chart(incomeVsExpenseCanvas, {
      type: 'pie',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          data: [data.totalIncome, data.totalExpenses],
          backgroundColor: ['#34d399', '#f97316']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Income vs Expenses' }
        }
      }
    });
  }

  function renderSummary(data) {
    const balance = data.totalIncome - data.totalExpenses;
    summaryContainer.innerHTML = `
      <p><strong>Total Income:</strong> $${data.totalIncome.toFixed(2)}</p>
      <p><strong>Total Expenses:</strong> $${data.totalExpenses.toFixed(2)}</p>
      <p><strong>Net Balance:</strong> $${balance.toFixed(2)}</p>
    `;
  }

  const reportData = await fetchReportData();
  if (reportData) {
    renderSpendingChart(reportData);
    renderIncomeVsExpenseChart(reportData);
    renderSummary(reportData);
  }
});
