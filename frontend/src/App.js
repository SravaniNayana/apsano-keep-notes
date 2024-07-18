// frontend/src/App.js

import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import Auth from './components/Auth';
import Notes from './components/Notes';

const App = () => {
    const { auth } = useContext(AuthContext);

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={auth.token ? <Navigate to="/notes" /> : <Auth />}
                />
                <Route
                    path="/notes"
                    element={auth.token ? <Notes /> : <Navigate to="/" />}
                />
            </Routes>
        </Router>
    );
};

export default App;
