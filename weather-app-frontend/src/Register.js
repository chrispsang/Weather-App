import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/signup', { username, password });
      console.log(response.data);

      const loginResponse = await axios.post('http://localhost:3000/login', { username, password });
      const token = loginResponse.data.token;
      localStorage.setItem('token', token);

      const userResponse = await axios.get('http://localhost:3000/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      onRegister(userResponse.data);
    } catch (error) {
      console.error('Error registering user:', error);
      if (error.response && error.response.data && error.response.data.error === 'Username already exists') {
        setError('Username already exists. Please choose a different username.');
      } else {
        setError('Failed to register. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleRegister}>
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
        <button type="submit" style={{ width: '100%' }}>Register</button>
      </form>
    </div>
  );
};

export default Register;

