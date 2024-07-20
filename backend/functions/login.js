// functions/auth/login.js

const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust the path as needed
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(mongoURI);

const corsOptions = {
  origin: 'https://sravanikeepnotes.netlify.app', // allow requests from your frontend domain
  methods: ['POST', 'OPTIONS'], // allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization'], // allow specific headers
  credentials: true, // Allow credentials if needed
};

exports.handler = async (event) => {
  // Enable CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': corsOptions.origin,
        'Access-Control-Allow-Methods': corsOptions.methods.join(','),
        'Access-Control-Allow-Headers': corsOptions.allowedHeaders.join(','),
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid username or password' }),
        headers: {
          'Access-Control-Allow-Origin': corsOptions.origin,
        },
      };
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid username or password' }),
        headers: {
          'Access-Control-Allow-Origin': corsOptions.origin,
        },
      };
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    return {
      statusCode: 200,
      body: JSON.stringify({ token, userId: user._id }),
      headers: {
        'Access-Control-Allow-Origin': corsOptions.origin,
      },
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to log in user', error }),
      headers: {
        'Access-Control-Allow-Origin': corsOptions.origin,
      },
    };
  }
};
