const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Note = require('../models/note'); // Adjust path as needed

const app = express();

app.use(cors());
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
          headers: res.headers,
          body: res.body,
        });
      }
    });
  });
};
