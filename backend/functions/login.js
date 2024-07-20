// functions/auth/login.js

const mongoose = require('mongoose');
const User = require('../../models/User'); // Adjust the path as needed
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

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid username or password' }),
      };
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid username or password' }),
      };
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    return {
      statusCode: 200,
      body: JSON.stringify({ token, userId: user._id }),
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to log in user', error }),
    };
  }
};
