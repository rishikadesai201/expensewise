
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'expensewise',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL');
    connection.release(); 
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
  }
})();

module.exports = pool;