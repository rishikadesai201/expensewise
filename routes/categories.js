const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");

// GET categories
router.get("/", (req, res) => {
  console.log("Categories route hit");
  const categories = [
    { "value": "food", "label": "Food" },
    { "value": "bills", "label": "Utility Bills" },
    { "value": "travel", "label": "Travel" },
    { "value": "entertainment", "label": "Entertainment" },
    { "value": "health", "label": "Health" },
    { "value": "other", "label": "Other" }
  ];
  res.json(categories);
});

module.exports = router;