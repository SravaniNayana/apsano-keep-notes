// frontend/src/components/Auth.js

import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const Auth = () => {
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLogin, setIsLogin] = useState(true);

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const { data } = await api.post(endpoint, formData);
            if (isLogin) {
                login(data.token);
            } else {
                alert('Registration successful. You can now log in.');
                setIsLogin(true);
            }
        } catch (error) {
            console.error(error);
            alert('Authentication failed');
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit}>
                <h2>{isLogin ? 'Login' : 'Register'}</h2>
                {!isLogin && (
                    <div>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}
                <div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
                <button type="button" onClick={toggleAuthMode}>
                    {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
                </button>
            </form>
        </div>
    );
};

export default Auth;
