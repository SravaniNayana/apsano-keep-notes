const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Note = require('./models/note'); // Adjust path as needed

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes', error });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const newNote = new Note(req.body);
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create note', error });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note', error });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note', error });
  }
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
