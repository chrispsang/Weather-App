<h1 align="center">🌦️ Weather App</h1>

Welcome to the Weather App! This full-stack web application allows users to search for current weather conditions and 5-day weather forecasts for any city. Users can also delve deeper into weather details with a 3-hourly forecast, view detailed hourly weather information, and save their favorite locations for easy access.

## Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [Usage](#usage)

## Features

1. **User Authentication**
    - Secure user authentication with sign-up and log-in functionalities.

2. **Weather Information**
   - Current weather and 5-day forecast for any city.
   - Detailed 3-hourly forecast for each day.
   - Detailed hourly weather including "feels like" temperature, humidity, and wind speed.

3. **Saving Locations**
   - Save favorite locations for quick access.

## Technologies Used

- **Frontend**: Built using [React.js](https://reactjs.org/), [Axios](https://axios-http.com/) for API requests, and styled with CSS.
- **Backend**: Implemented in [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/) for handling API requests and responses.
- **Database**: [MySQL](https://www.mysql.com/) for storing user data and saved locations.
- **External API**: Integrated with [OpenWeatherMap API](https://openweathermap.org/api) to fetch weather data.
- **Deployment**: [Docker](https://www.docker.com/) and Docker Compose used for containerization and deployment.

## Installation

To run the Weather Application locally:

1. **Prerequisites**:
   - Ensure you have Docker installed on your system. You can download it from [Docker's official website](https://www.docker.com/get-started).
   - Ensure Docker is open and running on your system.

2. Clone this repository to your local machine:
    ```bash
    git clone https://github.com/chrispsang/Weather-App.git
    ```

3. Navigate to the project directory:
    ```bash
    cd Weather-App
    ```

 4. To set up JWT Secret and API Weather Key:
   - Create a `.env` file in the backend directory.
   - Add the following environment variables to the `.env` file:
     ```
     jwt_secret=your_jwt_secret_here
     API=your_openweathermap_api_key_here
     ```  

5. To build the application containers without using cached layers:
    ```bash
    docker-compose build --no-cache
    ```

6. To start the application:
    ```bash
    docker-compose up
    ```
    
7. Once the containers are running, access the application in your web browser:
    - Backend API: [http://localhost:3000](http://localhost:3000)
    - Frontend UI: [http://localhost:8080](http://localhost:8080)

8. To stop and remove the Docker containers and volumes associated with the Weather Application:
    ```bash
    docker-compose down -v
    ```
## Usage

1. **Sign Up / Log In**
   - Create a new account or log in to access the full features of the app. This includes viewing saved locations and making authenticated API requests using bcrypt for password hashing and JWT tokens.

2. **Search for a City**
   - Enter the name of a city in the search bar to get the current weather conditions, including temperature and weather description.

3. **View 5-Day Forecast**
   - After searching for a city, see the 5-day weather forecast providing an overview of expected weather conditions over the coming days.

4. **Explore 3-Hourly Forecast**
   - Click on any day in the 5-day forecast to view the detailed 3-hourly forecast for that day, allowing users to see weather changes throughout the day.

5. **Detailed Hourly Weather**
   - Select any specific hour in the 3-hourly forecast to access detailed weather information such as "feels like" temperature, humidity percentage, and wind speed.

6. **Save Favorite Locations**
   - Save searched cities to your favorites for quick access to their weather information.
