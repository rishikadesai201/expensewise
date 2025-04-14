const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticate = require("../middleware/auth");

// GET all transactions for the authenticated user
router.get("/", authenticate, async (req, res) => {
  try {
    const [transactions] = await db.query(
      "SELECT * FROM transactions WHERE user_id = ?",
      [req.user.userId]
    );
    res.json(transactions); // Return all transactions
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ 
      error: "Error fetching transactions", 
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

// POST new transaction (with enhanced error handling)
router.post("/", authenticate, async (req, res) => {
  const { type, amount, category, date } = req.body; // Removed description

  // Validate inputs
  if (!type || !amount || !category || !date) {
    return res.status(400).json({ 
      error: "Missing required fields",
      details: {
        type: !type ? "Type is required" : undefined,
        amount: !amount ? "Amount is required" : undefined,
        category: !category ? "Category is required" : undefined,
        date: !date ? "Date is required" : undefined
      }
    });
  }

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ 
      error: "Invalid amount",
      details: "Amount must be a positive number"
    });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO transactions (user_id, type, amount, category, date) VALUES (?, ?, ?, ?, ?)",
      [req.user.userId, type, amount, category, date]
    );
    
    res.status(201).json({ 
      success: true,
      id: result.insertId,
      message: "Transaction added successfully"
    });
  } catch (err) {
    console.error("Database error:", err);
    
    let errorMessage = "Error adding transaction";
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      errorMessage = "Invalid category selected";
    } else if (err.code === 'ER_TRUNCATED_WRONG_VALUE') {
      errorMessage = "Invalid data format";
    }

    res.status(500).json({ 
      error: errorMessage,
      details: err.message,
      code: err.code
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