const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const path = require('path');

dotenv.config();

const app = express();

// Middlewares

app.use(cors({
  origin: 'http://localhost:5002', // frontend URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.get('/js/auth.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'js', 'auth.js'));
});

// Serve static files (Frontend assets like CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// --------- API ROUTES (Backend) ---------
const dashboardRoutes = require('./routes/dashboard');
const budgetRoutes = require('./routes/budget');
const transactionRoutes = require('./routes/transactions');
const goalRoutes = require('./routes/goals');
const investmentRoutes = require('./routes/investments');
const loanRoutes = require('./routes/loans');
const sharedRoutes = require('./routes/shared-expenses');
const reportsRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');
const userRoutes = require('./routes/users');
const categoriesRouter = require('./routes/categories');

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/shared-expenses', sharedRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use("/api/categories", categoriesRouter); 



// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'home.html'));
});

// Sign In page
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'signin.html'));
});

// Create Account page
app.get('/createaccount', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'createaccount.html'));
});

// Dashboard page
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'dashboard.html'));
});

// Other pages 
app.get('/budgets', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'budgets.html'));
});

app.get('/transactions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'transactions.html'));
});

app.get('/goals', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'goals.html'));
});

app.get('/investments', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'investments.html'));
});

app.get('/loans', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'loans.html'));
});

app.get('/shared-expenses', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'shared-expenses.html'));
});

app.get('/reports', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'reports.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'settings.html'));
});


app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Global Error Handler (for unexpected errors)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack to the console
  res.status(500).send('Something went wrong!'); // Send a generic error message
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
});
