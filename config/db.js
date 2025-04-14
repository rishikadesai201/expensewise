// config/db.js
const mysql = require('mysql2/promise');

// Create a connection pool (recommended for production)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'expensewise',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL');
    connection.release(); // Release the connection back to the pool
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
  }
})();

module.exports = pool;