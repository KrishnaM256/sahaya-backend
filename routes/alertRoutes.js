const express = require('express');
const axios = require('axios');
const router = express.Router();

const apiKey = 'a1866a2933be8505a460760170ca2d9a7de58bba46546faaa02c98e6bdc84011'; 

// Helper function to get event ID
function getEventId(responseBody) {
  try {
    const formattedBody = responseBody.data;
    if (formattedBody && formattedBody.result && formattedBody.result.length > 0) {
      const eventId = formattedBody.result[0]?.event_id;
      if (eventId) {
        return eventId;
      } else {
        throw new Error('Event ID is undefined');
      }
    } else {
      throw new Error('No events found in the response');
    }
  } catch (error) {
    console.error('Failed to parse event ID:', error.message);
    throw new Error('Failed to parse event ID');
  }
}

// Helper function to get event details
async function getEventDetails(eventId) {
  try {
    const response = await axios.get('https://api.ambeedata.com/disasters/by-eventId', {
      params: { eventId },
      headers: { 'x-api-key': apiKey, 'Content-type': 'application/json' }
    });
    if (response.data && response.data.result) {
      return response.data;
    } else {
      throw new Error('No event details found');
    }
  } catch (error) {
    console.error('Failed to retrieve event details:', error.response ? error.response.data : error.message);
    throw new Error('Failed to retrieve event details');
  }
}

// Route handler
router.get('/', async (req, res) => {
  const latitude = req.query.lat;
  const longitude = req.query.lon;

  console.log('Received Latitude:', latitude, 'Longitude:', longitude);

  if (latitude && longitude) {
    try {
      const apiResponse = await axios.get('https://api.ambeedata.com/disasters/latest/by-lat-lng', {
        params: {
          lat: latitude,
          lng: longitude,
          limit: 10,
          page: 1
        },
        headers: {
          'x-api-key': apiKey,
          'Content-type': 'application/json'
        }
      });

      console.log('API Response Data:', apiResponse.data);

      const eventId = getEventId(apiResponse);
      if (eventId) {
        const eventDetails = await getEventDetails(eventId);
        console.log('Event Details:', eventDetails);
        res.json(eventDetails);
      } else {
        res.status(404).json({ error: 'Event not found' });
      }
    } catch (error) {
      console.error('Error during alert request:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(400).json({ error: 'Latitude and Longitude are required' });
  }
});

module.exports = router;
