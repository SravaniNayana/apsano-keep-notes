// functions/hello.js

// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config();

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('Error connecting to MongoDB:', err));

const express = require('express');
const connectDB = require('../config/db');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello sravani from the backend!' });
});

exports.handler = async (event, context) => {
  // Handle the route logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from the backend!' })
  };
};
