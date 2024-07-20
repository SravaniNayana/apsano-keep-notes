// functions/auth/register.js

const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust the path as needed
const jwt = require('jsonwebtoken');

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'User already exists' }),
      };
    }

    // Create new user
    const user = new User({ username, password });
    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    return {
      statusCode: 201,
      body: JSON.stringify({ token, userId: user._id }),
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to register user', error }),
    };
  }
};
