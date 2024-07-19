const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors({
  origin: 'https://sravanikeepnotes.netlify.app', // Replace with your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));
app.use(express.json());
const authRoutes = require('../routes/notes');
app.use('/api/notes', authRoutes);
// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

exports.handler = async (event) => {
  return new Promise((resolve, reject) => {
    const req = {
      method: event.httpMethod,
      headers: event.headers,
      body: JSON.parse(event.body || '{}'),
      query: event.queryStringParameters || {},
    };

    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      setHeader: (key, value) => res.headers[key] = value,
      send: (body) => res.body = body,
      json: (body) => res.body = JSON.stringify(body),
      status: (code) => { res.statusCode = code; return res; }
    };

    app(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          statusCode: res.statusCode,
          headers: {
            ...res.headers,
            'Access-Control-Allow-Origin': 'https://sravanikeepnotes.netlify.app', // Ensure CORS headers are set
            'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Include required headers
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Include required methods
          },
          body: res.body,
        });
      }
    });
  });
};
