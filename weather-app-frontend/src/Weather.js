import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/Weather.css';

const Weather = ({ user, onLogout }) => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState({ daily: [], hourly: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  const [showDetailedForecast, setShowDetailedForecast] = useState(false);

  useEffect(() => {
    fetchSavedLocations();
  }, []);

  const fetchWeatherData = async (selectedCity) => {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    setForecastData({ daily: [], hourly: {} });
    setSelectedDay(null);
    setSelectedHour(null);
    setShowDetailedForecast(false);

    try {
      const token = localStorage.getItem('token');
      const weatherResponse = await axios.get(`http://localhost:3000/weather?city=${selectedCity}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWeatherData(weatherResponse.data);
      await fetchForecastData(selectedCity, token);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to fetch weather data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchForecastData = async (city, token) => {
    try {
      const forecastResponse = await axios.get(`http://localhost:3000/forecast?city=${city}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dailyData = [];
      const hourlyData = {};

      forecastResponse.data.list.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toISOString().split('T')[0];

        if (!hourlyData[day]) {
          hourlyData[day] = [];
        }
        hourlyData[day].push(forecast);

        const existingDay = dailyData.find((d) => d.date === day);
        if (existingDay) {
          existingDay.temp += forecast.main.temp;
          existingDay.count += 1;
        } else {
          dailyData.push({
            date: day,
            temp: forecast.main.temp,
            count: 1,
            main: forecast.weather[0].main,
          });
        }
      });

      dailyData.forEach((day) => {
        day.temp = day.temp / day.count;
      });

      setForecastData({ daily: dailyData, hourly: hourlyData });
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      setForecastData({ daily: [], hourly: {} });

      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to fetch forecast data');
      }
    }
  };

  const fetchSavedLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/saved-locations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          userId: user.id,
        },
      });
      setSavedLocations(response.data);
    } catch (error) {
      console.error('Error fetching saved locations:', error);
    }
  };

  const saveLocation = async () => {
    try {
      const token = localStorage.getItem('token');
      const trimmedCity = city.trim();

      if (trimmedCity === '') {
        alert('Please enter a city name before saving.');
        return;
      }

      const existingLocation = savedLocations.find(loc => loc.city.toLowerCase() === trimmedCity.toLowerCase());
      if (existingLocation) {
        alert(`Location '${trimmedCity}' is already saved!`);
        return;
      }

      await axios.post('http://localhost:3000/save-location', {
        userId: user.id,
        city: trimmedCity,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      fetchSavedLocations();
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  const deleteLocation = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:3000/delete-location', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          id,
        },
      });
      fetchSavedLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim() !== '') {
      fetchWeatherData(city);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setSelectedHour(null);
  };

  const handleHourClick = (hour) => {
    setSelectedHour(hour);
    setShowDetailedForecast(true);
  };

  const closeDetailedForecast = () => {
    setShowDetailedForecast(false);
    setSelectedHour(null);
  };

  const toggleSavedLocations = () => {
    setShowSavedLocations(!showSavedLocations);
  };

  const handleGetWeather = (selectedCity) => {
    setCity(selectedCity);
    fetchWeatherData(selectedCity);
  };

  return (
    <div className="weather-container">
      <div className="weather-header">
        <h2>Welcome, {user.username}!</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      <form className="weather-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="weather-input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          required
        />
        <button type="submit" className="get-weather-button">Get Weather</button>
        <button type="button" className="save-location-button" onClick={saveLocation}>
          Save Location
        </button>
      </form>

      {loading && <p className="loading-message">Loading weather data...</p>}
      {error && <p className="error-message">{error}</p>}
      {weatherData && (
        <div className={`current-forecast ${getBackgroundClass(weatherData.weather[0].main)}`}>
          <h3>Current Weather for {weatherData.name}</h3>
          <p>Temperature: {weatherData.main.temp} °C</p>
          <p>Weather: {weatherData.weather[0].main}</p>
          <p>Description: {weatherData.weather[0].description}</p>
        </div>
      )}

      {forecastData.daily && forecastData.daily.length > 0 && (
        <div className="forecast-data">
          <h3>5-Day Forecast</h3>
          <div className="daily-forecast">
            {forecastData.daily.map((forecast, index) => (
              <div
                key={index}
                className={`daily-forecast-item ${getBackgroundClass(forecast.main)}`}
                onClick={() => handleDayClick(forecast.date)}
              >
                <p>{new Date(forecast.date).toLocaleDateString()}</p>
                <p>{forecast.temp.toFixed(1)} °C</p>
                <p>{forecast.main}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDay && forecastData.hourly[selectedDay] && (
        <div className="hourly-forecast">
          <h3>Hourly Forecast for {new Date(selectedDay).toLocaleDateString()}</h3>
          {forecastData.hourly[selectedDay].map((forecast, index) => (
            <div
              key={index}
              className={`hourly-forecast-item ${getBackgroundClass(forecast.weather[0].main)}`}
              onClick={() => handleHourClick(forecast)}
            >
              <p>{new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
              <p>{forecast.main.temp} °C</p>
              <p>{forecast.weather[0].main}</p>
            </div>
          ))}
        </div>
      )}

      {showDetailedForecast && selectedHour && (
      <div className="detailed-forecast">
       <button className="close-button" onClick={closeDetailedForecast}>Close</button>
       <h3>Detailed Forecast</h3>
       <p>Temperature: {selectedHour.main.temp} °C</p>
      <p>Feels Like: {selectedHour.main.feels_like} °C</p> 
      <p>Weather: {selectedHour.weather[0].main}</p>
      <p>Description: {selectedHour.weather[0].description}</p>
      <p>Humidity: {selectedHour.main.humidity}%</p>
      <p>Wind Speed: {selectedHour.wind.speed} m/s</p>
   </div>
  )}


      <button className="toggle-saved-locations-button" onClick={toggleSavedLocations}>
        {showSavedLocations ? 'Hide Saved Locations' : 'Show Saved Locations'}
      </button>
      {showSavedLocations && (
        <div className="saved-locations">
          <h3>Saved Locations</h3>
          <ul>
            {savedLocations.map((location) => (
              <li key={location.id}>
                {location.city}
                <button className="get-weather-button" onClick={() => handleGetWeather(location.city)}>
                  Get Weather
                </button>
                <button className="delete-location-button" onClick={() => deleteLocation(location.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
const getBackgroundClass = (main) => {
  switch (main.toLowerCase()) {
  case 'clear':
  return 'clear-sky';
  case 'clouds':
  return 'cloudy';
  case 'rain':
  return 'rainy';
  case 'snow':
  return 'snowy';
  case 'thunderstorm':
  return 'thunderstorm';
  default:
  return '';
  }
  };
  
  
export default Weather;

