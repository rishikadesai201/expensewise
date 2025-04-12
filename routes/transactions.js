const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET all transactions
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM transactions ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions", errorDetails: err.message });
  }
});

// GET single transaction by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM transactions WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Transaction not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error fetching transaction", errorDetails: err.message });
  }
});

// POST new transaction
router.post("/", async (req, res) => {
  const { type, amount, category, date, description } = req.body;

  // Validate inputs
  if (!type || !amount || !category || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO transactions (type, amount, category, date, description) VALUES (?, ?, ?, ?, ?)",
      [type, amount, category, date, description]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Error adding transaction:", err);
    res.status(500).json({ error: "Error adding transaction", errorDetails: err.message });
  }
});

// DELETE transaction
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM transactions WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Transaction not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error deleting transaction", errorDetails: err.message });
  }
});

module.exports = router;
