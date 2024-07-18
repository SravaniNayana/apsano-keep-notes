// frontend/src/components/Notes.js

import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import NoteForm from './NoteForm';
import api from '../services/api';

const Notes = () => {
    const { auth, logout } = useContext(AuthContext);
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const { data } = await api.get('/notes');
                setNotes(data);
            } catch (error) {
                console.error('Failed to fetch notes', error);
                logout();
            }
        };

        if (auth.token) {
            fetchNotes();
        }
    }, [auth.token, logout]);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notes/${id}`);
            setNotes(notes.filter(note => note._id !== id));
        } catch (error) {
            console.error('Failed to delete note', error);
        }
    };

    return (
        <div className="notes-container">
            <button onClick={logout}>Logout</button>
            <NoteForm setNotes={setNotes} />
            <h2>Your Notes</h2>
            <div className="notes-list">
                {notes.map(note => (
                    <div key={note._id} className="note" style={{ backgroundColor: note.color }}>
                        <h3>{note.title}</h3>
                        <p>{note.content}</p>
                        {note.reminder && <p>Reminder: {new Date(note.reminder).toLocaleString()}</p>}
                        {note.tags && <p>Tags: {note.tags.join(', ')}</p>}
                        <button onClick={() => handleDelete(note._id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notes;
