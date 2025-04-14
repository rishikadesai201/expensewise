const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticate = require("../middleware/auth");

// GET all transactions for the authenticated user
router.get("/", authenticate, async (req, res) => {
  try {
    // Query to get transactions by user ID (assumed that 'user_id' is available in the JWT payload)
    const [transactions] = await db.query(
      "SELECT * FROM transactions WHERE user_id = ?",
      [req.user.userId]
    );
    res.json(transactions); // Return all transactions
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST request to create a new transaction
router.post("/", authenticate, async (req, res) => {
  const { type, amount, category, date } = req.body;
  
  if (!type || !amount || !category || !date) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO transactions (user_id, type, amount, category, date) VALUES (?, ?, ?, ?, ?)",
      [req.user.userId, type, amount, category, date]
    );
    res.status(201).json({ id: result.insertId, type, amount, category, date });
  } catch (err) {
    console.error("Error inserting transaction:", err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

// DELETE request to delete a transaction
router.delete("/:id", authenticate, async (req, res) => {
  const transactionId = req.params.id;

  try {
    // Check if the transaction exists and belongs to the authenticated user
    const [result] = await db.query(
      "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
      [transactionId, req.user.userId]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Transaction not found or you are not authorized to delete it." });
    }

    // Delete the transaction
    await db.query("DELETE FROM transactions WHERE id = ?", [transactionId]);

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

module.exports = router;
