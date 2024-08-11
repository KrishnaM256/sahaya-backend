const express = require('express')
const cors = require('cors') // Import CORS
const axios = require('axios')
const dotenv = require('dotenv').config()
const connectDb = require('./connectDB/connectDB.js')
const cookieParser = require('cookie-parser')

// Initialize Express app
const app = express()
const port = process.env.PORT

// Use CORS middleware
app.use(cors())

// Initialize database connection
connectDb()

// Use middleware
app.use(express.json())
app.use(cookieParser())

// Hard-coded OpenWeatherMap API key
const weatherApiKey = 'a98a12a23c2ea8daed3cfd5b7d192d07' // Replace with your OpenWeatherMap API key

// Function to get current weather based on latitude and longitude
async function getWeather(latitude, longitude) {
  try {
    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          lat: latitude,
          lon: longitude,
          appid: weatherApiKey,
          units: 'metric', // Optional: Use 'imperial' for Fahrenheit, 'metric' for Celsius
        },
      }
    )
    return response.data
  } catch (error) {
    console.error('Failed to get weather:', error)
    return { error: 'Failed to retrieve weather data' }
  }
}

// Route to handle weather requests
app.get('/weather', async (req, res) => {
  const latitude = req.query.lat
  const longitude = req.query.lon

  if (latitude && longitude) {
    try {
      const weatherData = await getWeather(latitude, longitude)
      res.json(weatherData)
    } catch (error) {
      console.error('Error during weather request:', error)
      res.status(500).json({ error: 'Failed to retrieve weather data' })
    }
  } else {
    res.status(400).json({ error: 'Latitude and Longitude are required' })
  }
})

// Define your other routes
app.use('/api/users', require('./routes/userRoutes'))
const alertRoutes = require('./routes/alertRoutes') // Adjust path as needed
app.use('/api/alerts', alertRoutes)
// Error handling for uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err}`)
  console.log('Shutting down server due to Uncaught Exception')
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err}`)
  console.log('Shutting down the server due to Unhandled Rejection')
  app.close(() => {
    process.exit(1)
  })
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
