// frontend/src/components/NoteForm.js

import React, { useState } from 'react';
import api from '../services/api';

const NoteForm = ({ setNotes }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: '',
        color: '#ffffff',
        reminder: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).slice(0, 9);
            const noteData = { ...formData, tags: tagsArray };
            const { data } = await api.post('/notes', noteData);
            setNotes(prevNotes => [...prevNotes, data]);
            setFormData({
                title: '',
                content: '',
                tags: '',
                color: '#ffffff',
                reminder: ''
            });
        } catch (error) {
            console.error('Failed to create note', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="note-form">
            <h2>Create a New Note</h2>
            <div>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <textarea
                    name="content"
                    placeholder="Content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <input
                    type="text"
                    name="tags"
                    placeholder="Tags (comma-separated, max 9)"
                    value={formData.tags}
                    onChange={handleChange}
                />
            </div>
            <div>
                <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                />
            </div>
            <div>
                <input
                    type="datetime-local"
                    name="reminder"
                    value={formData.reminder}
                    onChange={handleChange}
                />
            </div>
            <button type="submit">Add Note</button>
        </form>
    );
};

export default NoteForm
