const mysql = require('mysql2');

// ✅ Create connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234', // ← Replace with your MySQL password
  multipleStatements: true
});

// ✅ Database name
const dbName = 'expensewise';

// ✅ SQL to create database + all tables
const fullSQL = `
  CREATE DATABASE IF NOT EXISTS ${dbName};
  USE ${dbName};

  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Transactions table
  CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(100),
    amount DECIMAL(10,2),
    category VARCHAR(50),
    type ENUM('income', 'expense') NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Budgets table
  CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category VARCHAR(50),
    amount DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Goals table
  CREATE TABLE IF NOT EXISTS goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100),
    target_amount DECIMAL(10,2),
    current_amount DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Loans table
  CREATE TABLE IF NOT EXISTS loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    lender VARCHAR(100),
    amount DECIMAL(10,2),
    interest_rate DECIMAL(5,2),
    due_date DATE,
    monthly_payment DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Investments table
  CREATE TABLE IF NOT EXISTS investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(50),
    name VARCHAR(100),
    amount DECIMAL(10,2),
    purchase_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Shared Expenses table
  CREATE TABLE IF NOT EXISTS shared_expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    group_name VARCHAR(100),
    description VARCHAR(255),
    amount DECIMAL(10,2),
    split_with JSON,
    date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- User Preferences
  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INT PRIMARY KEY,
    currency VARCHAR(10) DEFAULT 'USD',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`;

// Run everything
connection.connect(err => {
  if (err) {
    console.error(' MySQL connection error:', err);
    return;
  }

  console.log('Connected to MySQL');

  connection.query(fullSQL, (err, results) => {
    if (err) {
      console.error('Error creating DB or tables:', err);
    } else {
      console.log('Database and all tables created successfully!');
    }
    connection.end();
  });
});
