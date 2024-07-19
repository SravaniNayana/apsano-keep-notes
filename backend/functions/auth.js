// functions/auth.js

const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as needed

const app = express();
app.use(cors({
  origin: 'https://sravanikeepnotes.netlify.app', // Replace with your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));
app.use(express.json());

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET;

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  throw new Error('MONGO_URI environment variable is not set');
}

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit with failure code
  });

// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ username, password });
    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Failed to register user', error });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userId: user._id });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Failed to log in user', error });
  }
});

// Serverless function handler
exports.handler = serverless(app);
