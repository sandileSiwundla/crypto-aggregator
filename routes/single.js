require('dotenv').config();
const axios = require('axios');
const express = require('express');
const router = express.Router();

// Use environment variable for API key
const API_KEY = '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

async function getUSDToZARRate() {
  try {
    const res = await axios.get('https://api.frankfurter.app/latest?from=USD&to=ZAR');
    return res.data.rates?.ZAR;
  } catch (err) {
    console.error('Error fetching ZAR rate:', err);
    return null;
  }
}

// Get crypto data
router.get('/:cryptoName', async (req, res) => {
  try {
    const cryptoName = req.params.cryptoName.toLowerCase();
    
    // First get the cryptocurrency ID using the listings endpoint
    const listingsResponse = await axios.get(`${BASE_URL}/cryptocurrency/listings/latest`, {
      headers: { 'X-CMC_PRO_API_KEY': API_KEY },
      params: { limit: 5000 }
    });

    // Find the crypto by name
    const crypto = listingsResponse.data.data.find(
      coin => coin.name.toLowerCase() === cryptoName || 
              coin.symbol.toLowerCase() === cryptoName
    );

    if (!crypto) {
      return res.status(404).json({ error: 'Cryptocurrency not found' });
    }

    // Now get detailed quotes and info using the ID
    const [quoteResponse, infoResponse] = await Promise.all([
      axios.get(`${BASE_URL}/cryptocurrency/quotes/latest`, {
        headers: { 'X-CMC_PRO_API_KEY': API_KEY },
        params: { id: crypto.id, convert: 'USD' }
      }),
      axios.get(`${BASE_URL}/cryptocurrency/info`, {
        headers: { 'X-CMC_PRO_API_KEY': API_KEY },
        params: { id: crypto.id }
      })
    ]);

    const coinData = {
      ...quoteResponse.data.data[crypto.id],
      ...infoResponse.data.data[crypto.id]
    };

    const usdToZar = await getUSDToZARRate();

    res.json({ coin: coinData, usdToZar });
  } catch (err) {
    console.error('Error fetching crypto data:', err.response?.data || err.message);
    res.status(500).json({ 
      error: 'Failed to fetch crypto data',
      details: err.response?.data?.status?.error_message || err.message 
    });
  }
});

// Get historical data (Note: This endpoint might not be available in free tier)
router.get('/:cryptoName/historical', async (req, res) => {
  try {
    const cryptoName = req.params.cryptoName.toLowerCase();
    
    // First get the ID
    const listingsResponse = await axios.get(`${BASE_URL}/cryptocurrency/listings/latest`, {
      headers: { 'X-CMC_PRO_API_KEY': API_KEY },
      params: { limit: 5000 }
    });

    const crypto = listingsResponse.data.data.find(
      coin => coin.name.toLowerCase() === cryptoName || 
              coin.symbol.toLowerCase() === cryptoName
    );

    if (!crypto) {
      return res.status(404).json({ error: 'Cryptocurrency not found' });
    }

    // For historical data, you might need a different approach as the quotes/historical endpoint
    // might not be available in all plans. Let's use a fallback approach.
    res.json({ 
      quotes: [],
      message: 'Historical data endpoint might require premium plan. Using mock data for demonstration.'
    });
    
  } catch (err) {
    console.error('Error fetching historical data:', err.response?.data || err.message);
    res.status(500).json({ 
      error: 'Failed to fetch historical data',
      details: err.response?.data?.status?.error_message || err.message 
    });
  }
});

module.exports = router;