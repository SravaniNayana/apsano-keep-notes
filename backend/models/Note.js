// backend/models/Note.js

const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], maxlength: 9 },
    color: { type: String, default: '#ffffff' },
    archived: { type: Boolean, default: false },
    trash: { type: Boolean, default: false },
    reminder: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);
