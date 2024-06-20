
import React, { useState } from 'react';
import axios from 'axios';
import Register from './Register';
import Login from './Login';
import Weather from './Weather';
import './styles/App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="container">
      <h2>Weather App</h2>
      {user ? (
        <Weather user={user} onLogout={handleLogout} />
      ) : (
        <>
          {showLogin ? (
            <>
              <Login onLogin={handleLogin} />
              <p>Don't have an account? <button className="link-button" onClick={() => setShowLogin(false)}>Register</button></p>
            </>
          ) : (
            <>
              <Register onRegister={handleRegister} />
              <p>Already have an account? <button className="link-button" onClick={() => setShowLogin(true)}>Log In</button></p>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;