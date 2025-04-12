// config/db.js
const mysql = require('mysql2');

// MySQL Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // MySQL username
  password: '1234',      // MySQL password
  database: 'expensewise'  // Database name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

module.exports = db;
