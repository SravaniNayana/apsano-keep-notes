const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Import your route handlers
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

exports.handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    const req = {
      method: event.httpMethod,
      headers: event.headers,
      body: JSON.parse(event.body),
    };

    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      setHeader: (key, value) => res.headers[key] = value,
      send: (body) => res.body = body,
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
