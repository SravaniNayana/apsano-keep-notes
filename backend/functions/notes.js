// functions/notes.js

const mongoose = require('mongoose');
const Note = require('../models/Note'); // Adjust the path as per your directory structure
const jwt = require('jsonwebtoken');

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(mongoURI);

const corsOptions = {
  origin: 'https://sravanikeepnotes.netlify.app', // allow requests from your frontend domain
  methods: ['GET, POST, PUT, DELETE, OPTIONS'], // allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization'], // allow specific headers
  credentials: true, // Allow credentials if needed
};
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

exports.handler = async (event, context) => {
  // Handle CORS preflight request
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

  // Ensure the request has a valid token
  const token = event.headers.authorization?.split(' ')[1];
  if (!token || !verifyToken(token)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
      headers: {
        'Access-Control-Allow-Origin': corsOptions.origin,
      },
    };
  }

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await handleGet(event);
      case 'POST':
        return await handlePost(event);
      case 'PUT':
        return await handlePut(event);
      case 'DELETE':
        return await handleDelete(event);
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: 'Method Not Allowed' }),
          headers: {
            'Access-Control-Allow-Origin': corsOptions.origin,
          },
        };
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error }),
      headers: {
        'Access-Control-Allow-Origin': corsOptions.origin,
      },
    };
  }
};

// Handler functions

const handleGet = async (event) => {
  const path = event.path;
  const userId = verifyToken(event.headers.authorization.split(' ')[1]).userId;

  if (path.includes('/archived')) {
    const notes = await Note.find({ user: userId, archived: true });
    return {
      statusCode: 200,
      body: JSON.stringify(notes),
      headers: {
        'Access-Control-Allow-Origin': corsOptions.origin,
      },
    };
  } else if (path.includes('/trash')) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const notes = await Note.find({ user: userId, trash: true, updatedAt: { $gte: thirtyDaysAgo } });
      const deletedNotes = await Note.deleteMany({
        user: userId,
        trash: true,
        updatedAt: { $lt: thirtyDaysAgo }
      });
      return {
        statusCode: 200,
        body: JSON.stringify(notes),
        headers: {
          'Access-Control-Allow-Origin': corsOptions.origin,
        },
      };
  }

  const notes = await Note.find({  user: userId, archived: false, trash: false });
  return {
    statusCode: 200,
    body: JSON.stringify(notes),
    headers: {
      'Access-Control-Allow-Origin': corsOptions.origin,
    },
  };
};

const handlePost = async (event) => {
  const userId = verifyToken(event.headers.authorization.split(' ')[1]).userId;
  const { title, content, tags, color, reminder } = JSON.parse(event.body);

  const note = new Note({
    user: userId,
    title,
    content,
    tags,
    color,
    reminder,
    archived: false,
    trash: false,
  });

  await note.save();

  return {
    statusCode: 201,
    body: JSON.stringify(note),
    headers: {
      'Access-Control-Allow-Origin': corsOptions.origin,
    },
  };
};

const handlePut = async (event) => {
  const path = event.path;
  const pathSegments = path.split('/');
  const noteId = pathSegments.splice(-2, 1)[0]; // Get ID from the path
  const userId = verifyToken(event.headers.authorization.split(' ')[1]).userId;
  if (path.includes('/archive')) {
    const note = await Note.findByIdAndUpdate({ _id: noteId, user: userId }, { archived: true }, { new: true });
    return {
      statusCode: 200,
      body: JSON.stringify(note),
      headers: {
        'Access-Control-Allow-Origin': corsOptions.origin,
      },
    };
  } else if (path.includes('/unarchive')) {
     const note = await Note.findByIdAndUpdate({ _id: noteId, user: userId }, { archived: false }, { new: true });
     return {
        statusCode: 200,
        body: JSON.stringify(note),
        headers: {
          'Access-Control-Allow-Origin': corsOptions.origin,
        },
      };
  }  
};

const handleDelete = async (event) => {
  const path = event.path;
  const pathSegments = path.split('/');
  const noteId = pathSegments.splice(-2, 1)[0]; // Get ID from the path
  const userId = verifyToken(event.headers.authorization.split(' ')[1]).userId;

  // await Note.findByIdAndDelete(noteId);
  const note = await Note.findByIdAndUpdate( { _id: noteId, user: userId },
    { trash: true },
    { new: true }
  );
  return {
    statusCode: 204, // No Content
    headers: {
      'Access-Control-Allow-Origin': corsOptions.origin,
    },
  };
};
