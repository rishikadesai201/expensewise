const mysql = require('mysql2');

// Create connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  multipleStatements: true
});

// Database name
const dbName = 'expensewise';

// SQL to create database + all tables
const fullSQL = `
  CREATE DATABASE IF NOT EXISTS ${dbName};
  USE ${dbName};

  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

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

  CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category VARCHAR(50),
    amount DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(100),                          
  description TEXT,                            
  target_amount DECIMAL(10,2),
  saved_amount DECIMAL(10,2) DEFAULT 0,        
  deadline DATE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);


  
CREATE TABLE IF NOT EXISTS loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  lender VARCHAR(255) NOT NULL,
  interest_rate FLOAT NOT NULL,
  due_date DATE NOT NULL
);



  CREATE TABLE IF NOT EXISTS investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(50),
    name VARCHAR(100),
    amount DECIMAL(10,2),
    purchase_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );



CREATE TABLE shared_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paid_by VARCHAR(255) NOT NULL,
  participants TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INT PRIMARY KEY,
    currency VARCHAR(10) DEFAULT 'USD',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`;

connection.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
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
