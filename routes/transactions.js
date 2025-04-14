const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticate = require("../middleware/auth");

// GET all transactions for authenticated user
router.get("/", authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC",
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ 
      error: "Failed to fetch transactions", 
      errorDetails: err.message 
    });
  }
});

// GET single transaction by ID (user-specific)
router.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
      [id, req.user.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ 
      error: "Error fetching transaction", 
      errorDetails: err.message 
    });
  }
});

// POST new transaction (authenticated)
router.post("/", authenticate, async (req, res) => {
  const { type, amount, category, date, description } = req.body;

  // Validate inputs
  if (!type || !amount || !category || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO transactions (user_id, type, amount, category, date, description) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.userId, type, amount, category, date, description]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Error adding transaction:", err);
    res.status(500).json({ 
      error: "Error adding transaction", 
      errorDetails: err.message 
    });
  }
});

// DELETE transaction (user-specific)
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      "DELETE FROM transactions WHERE id = ? AND user_id = ?",
      [id, req.user.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ 
      error: "Error deleting transaction", 
      errorDetails: err.message 
    });
  }
});

module.exports = router;