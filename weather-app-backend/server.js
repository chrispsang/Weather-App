const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'mysql',
  user: 'exampleuser',
  password: 'examplepassword',
  database: 'exampledb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
  connection.release();
});

app.get('/', (req, res) => {
  res.send('Welcome to the Weather App API');
});

app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    const userExistsQuery = 'SELECT * FROM exampledb.users WHERE username = ?';
    pool.query(userExistsQuery, [username], async (err, results) => {
      if (err) {
        console.error('Error checking existing user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
      pool.query(insertUserQuery, [username, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error creating new user:', err);
          res.status(500).json({ error: 'Failed to create new user' });
        } else {
          console.log('User created successfully');
          res.status(201).json({ message: 'User created successfully' });
        }
      });
    });
  } catch (error) {
    console.error('Error during sign up:', error);
    res.status(500).json({ error: 'Failed to sign up' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const query = 'SELECT * FROM exampledb.users WHERE username = ?';
    pool.query(query, [username], async (err, results) => {
      if (err) {
        console.error('Error retrieving user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length === 0) {
        // Username not found
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const user = results[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        // Password incorrect
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Successful login
      const token = jwt.sign({ userId: user.id, username: user.username }, process.env.jwt_secret, { expiresIn: '1h' });
      res.json({ message: 'User successfully logged in', token });
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});


app.get('/weather', async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  try {
    const apiKey =  process.env.API;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

    const response = await axios.get(apiUrl);
    const weatherData = response.data;

    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    if (error.response && error.response.data) {
      return res.status(error.response.status).json({ error: error.response.data.message });
    }
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.get('/forecast', async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  try {
    const apiKey = process.env.API;
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

    const response = await axios.get(apiUrl);
    const forecastData = response.data;

    res.json(forecastData);
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    if (error.response && error.response.data) {
      return res.status(error.response.status).json({ error: error.response.data.message });
    }
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});


app.post('/save-location', async (req, res) => {
  try {
    const { userId, city } = req.body;

    const insertLocationQuery = 'INSERT INTO saved_locations (user_id, city) VALUES (?, ?)';
    pool.query(insertLocationQuery, [userId, city], (err, result) => {
      if (err) {
        console.error('Error saving location:', err);
        return res.status(500).json({ error: 'Failed to save location' });
      }
      console.log('Location saved successfully');
      res.status(201).json({ message: 'Location saved successfully' });
    });
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({ error: 'Failed to save location' });
  }
});

app.get('/saved-locations', async (req, res) => {
  try {
    const { userId } = req.query;

    const getLocationsQuery = 'SELECT id, city FROM saved_locations WHERE user_id = ?';
    pool.query(getLocationsQuery, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching saved locations:', err);
        return res.status(500).json({ error: 'Failed to fetch saved locations' });
      }
      
      res.json(results); // Assuming results contain id and city for each saved location
    });
  } catch (error) {
    console.error('Error fetching saved locations:', error);
    res.status(500).json({ error: 'Failed to fetch saved locations' });
  }
});

app.delete('/delete-location', (req, res) => {
  const { id } = req.body;

  const deleteLocationQuery = 'DELETE FROM saved_locations WHERE id = ?';
  pool.query(deleteLocationQuery, [id], (err, result) => {
    if (err) {
      console.error('Error deleting location:', err);
      res.status(500).json({ error: 'Failed to delete location' });
    } else {
      res.json({ message: 'Location deleted successfully' });
    }
  });
});

app.get('/user', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.jwt_secret);
    const query = 'SELECT id, username FROM users WHERE id = ?';
    pool.query(query, [decoded.userId], (err, results) => {
      if (err) {
        console.error('Error retrieving user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = results[0];
      res.json(user);
    });
  } catch (error) {
    console.error('Error decoding token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
