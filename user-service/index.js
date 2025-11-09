const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Database connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mssql',
});

// Models
const User = sequelize.define('User', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false,
  tableName: 'Users'
});

// Endpoints

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'user-service' });
});

// Get all users (for testing)
app.get('/v1/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// User Registration
app.post('/v1/users/register', async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Get the next user_id
    const maxUser = await User.findOne({ 
      order: [['user_id', 'DESC']] 
    });
    const nextUserId = maxUser ? maxUser.user_id + 1 : 1;
    
    // Create user (password is not stored in demo for simplicity)
    const user = await User.create({ 
      user_id: nextUserId,
      name, 
      email, 
      phone,
      created_at: new Date()
    });
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      user: { id: user.user_id, name: user.name, email: user.email, phone: user.phone },
      note: 'For demo purposes, use password "password123" to login'
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// User Authentication
app.post('/v1/users/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // For demo purposes, accept password "password123" for any user
    // In production, you'd have proper password authentication
    if (password !== 'password123') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, user: { id: user.user_id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get User Profile
app.get('/v1/users/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authorization token is required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Optional: Update User Profile
app.put('/v1/users/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authorization token is required' });

  const { name, phone } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    await user.save();

    res.json({ message: 'Profile updated successfully', user: { id: user.user_id, name: user.name, email: user.email, phone: user.phone } });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Health check endpoint
app.get('/v1/users/health', (req, res) => {
  res.json({ status: 'OK', service: 'user-service' });
});

// Sync DB and start server
sequelize.sync().then(() => {
  app.listen(3000, () => console.log('User Service running on port 3000'));
});
