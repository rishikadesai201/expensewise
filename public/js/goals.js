document.addEventListener("DOMContentLoaded", () => {
  const goalList = document.getElementById("goal-list");
  const goalForm = document.getElementById("goalForm");

  async function fetchGoals() {
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      displayGoals(data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  }

  function displayGoals(goals) {
    goalList.innerHTML = goals.length ? '' : "<p>No goals set yet.</p>";
    goals.forEach(goal => {
      const goalCard = document.createElement("div");
      goalCard.className = "goal-card";
      const progress = Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
      goalCard.innerHTML = `
        <h3>${goal.title}</h3>
        <p>${goal.description}</p>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <small>${goal.saved_amount} / ${goal.target_amount}</small>
        </div>
        <div class="goal-actions">
          <button onclick="deleteGoal(${goal.id})" class="btn btn-danger">Delete</button>
          <button onclick="updateGoal(${goal.id}, '${goal.title}')" class="btn btn-primary">Update</button>
        </div>
      `;
      goalList.appendChild(goalCard);
    });
  }

  goalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = goalForm.title.value;
    const description = goalForm.description.value;
    const target_amount = parseFloat(goalForm.target_amount.value);
    if (!title || !target_amount) return alert("Please fill in all required fields");
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, target_amount })
      });
      if (res.ok) {
        goalForm.reset();
        fetchGoals();
      }
    } catch (err) {
      console.error("Error adding goal:", err);
    }
  });

  window.deleteGoal = async (id) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (res.ok) fetchGoals();
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  window.updateGoal = async (id, oldTitle) => {
    const newAmount = prompt(`Update saved amount for \"${oldTitle}\" (in numbers):`);
    if (newAmount && !isNaN(newAmount)) {
      try {
        const res = await fetch(`/api/goals/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ saved_amount: parseFloat(newAmount) })
        });
        if (res.ok) fetchGoals();
      } catch (err) {
        console.error("Error updating goal:", err);
      }
    }
  };

  fetchGoals();
});