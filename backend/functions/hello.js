// functions/hello.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

exports.handler = async (event, context) => {
  // Handle the route logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from the backend!' })
  };
};
