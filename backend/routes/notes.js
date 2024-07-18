// backend/routes/notes.js

const express = require('express');
const Note = require('../models/Note');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to protect routes
const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Get all notes
router.get('/', protect, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new note
router.post('/', protect, async (req, res) => {
    const { title, content, tags, color, reminder } = req.body;
    try {
        const note = new Note({
            user: req.user,
            title,
            content,
            tags,
            color,
            reminder
        });
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        res.status(400).json({ error: 'Note creation failed' });
    }
});

// Update a note
router.put('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const { title, content, tags, color, reminder, archived, trash } = req.body;
    try {
        const note = await Note.findByIdAndUpdate(id, {
            title,
            content,
            tags,
            color,
            reminder,
            archived,
            trash
        }, { new: true });
        res.json(note);
    } catch (error) {
        res.status(400).json({ error: 'Note update failed' });
    }
});

// Delete a note
router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        await Note.findByIdAndDelete(id);
        res.json({ message: 'Note deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Note deletion failed' });
    }
});

module.exports = router;
