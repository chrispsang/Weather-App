import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', { username, password });
      const token = response.data.token;
      localStorage.setItem('token', token); // Store token in localStorage
  
      // Fetch user data after successful login
      const userResponse = await axios.get('http://localhost:3000/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      onLogin(userResponse.data); // Pass user data to onLogin function
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.response) {
        if (error.response.status === 401 && error.response.data.error === 'Invalid username or password') {
          setError('Invalid username or password');
        } else {
          setError('Failed to login. Please try again.');
        }
      } else {
        setError('Failed to login. Please try again.');
      }
    }
  };
  

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '90%', padding: '12px', marginBottom: '15px' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '90%', padding: '12px' }}
          required
        />
        <button type="submit" style={{ width: '100%' }}>Log In</button>
      </form>
    </div>
  );
};

export default Login;

