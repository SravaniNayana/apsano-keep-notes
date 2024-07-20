const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(mongoURI);

const corsOptions = {
  origin: 'https://sravanikeepnotes.netlify.app', // allow requests from your frontend domain
  methods: ['POST', 'OPTIONS'], // allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization'], // allow specific headers
  credentials: true, // Allow credentials if needed
};

exports.handler = async (event, context) => {
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
    const { username, email, password } = JSON.parse(event.body);
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'User already exists' }),
        headers: {
          'Access-Control-Allow-Origin': corsOptions.origin,
        },
      };
    }

    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    return {
      statusCode: 201,
      body: JSON.stringify({ token, userId: user._id }),
      headers: {
        'Access-Control-Allow-Origin': corsOptions.origin,
      },
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to register user', error }),
      headers: {
        'Access-Control-Allow-Origin': corsOptions.origin,
      },
    };
  }
};
