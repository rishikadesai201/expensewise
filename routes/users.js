const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authenticate = require('../middleware/auth');

// Enhanced signup with input validation and initial balance
router.post('/createaccount', async (req, res) => {
  try {
    const { username, email, password, initial_balance } = req.body;

    const errors = {};
    if (!username) errors.username = 'Username is required';
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false,
        error: 'Email already exists',
        code: 'EMAIL_EXISTS'
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, initial_balance) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, initial_balance || 0]
    );

    const token = jwt.sign(
      { 
        userId: result.insertId, 
        email,
        initialLogin: true 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'strict',
      path: '/'
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: result.insertId,
        username,
        email
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// Enhanced signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        lastLogin: new Date().toISOString()
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'strict',
      path: '/'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      tokenInfo: {
        expiresAt: Date.now() + 3600000
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// Token refresh
router.post('/refresh', authenticate, (req, res) => {
  try {
    const newToken = jwt.sign(
      { 
        userId: req.user.userId, 
        email: req.user.email,
        refreshed: true 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'strict',
      path: '/'
    });

    res.json({
      success: true,
      token: newToken,
      tokenInfo: {
        expiresAt: Date.now() + 3600000
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token',
      code: 'REFRESH_FAILED'
    });
  }
});

// Signout
router.post('/signout', authenticate, (req, res) => {
  try {
    res.clearCookie('token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    res.json({ 
      success: true,
      message: 'Signed out successfully' 
    });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sign out',
      code: 'SIGNOUT_FAILED'
    });
  }
});

// Current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, created_at, initial_balance FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      user: users[0],
      tokenInfo: res.locals.tokenInfo
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// 👇 Set initial balance route (appended)
router.post('/set-initial-balance', authenticate, async (req, res) => {
  const { initial_balance } = req.body;
  if (initial_balance == null || isNaN(initial_balance)) {
    return res.status(400).json({ success: false, error: 'Invalid balance' });
  }

  try {
    await db.execute(
      'UPDATE users SET initial_balance = ? WHERE id = ?',
      [initial_balance, req.user.userId]
    );

    res.json({ success: true, message: 'Initial balance updated' });
  } catch (err) {
    console.error('Set balance error:', err);
    res.status(500).json({ success: false, error: 'Failed to update balance' });
  }
});

module.exports = router;
