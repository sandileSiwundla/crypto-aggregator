require('dotenv').config();
const axios = require('axios');
const express = require('express');

const app = express();

// USE ENV VARIABLE (IMPORTANT)
const API_KEY = '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

async function getUSDToZARRate() {
  try {
    const res = await axios.get(
      'https://api.frankfurter.app/latest?from=USD&to=ZAR'
    );
    return res.data.rates?.ZAR;
  } catch (err) {
    console.error('Error fetching ZAR rate:', err.message);
    return null;
  }
}

// 🔹 GET COIN DATA
app.get('/:cryptoName', async (req, res) => {
  try {
    const cryptoName = req.params.cryptoName.toLowerCase();

    const listingsResponse = await axios.get(
      `${BASE_URL}/cryptocurrency/listings/latest`,
      {
        headers: { 'X-CMC_PRO_API_KEY': API_KEY },
        params: { limit: 5000 }
      }
    );

    const crypto = listingsResponse.data.data.find(
      coin =>
        coin.name.toLowerCase() === cryptoName ||
        coin.symbol.toLowerCase() === cryptoName
    );

    if (!crypto) {
      return res.status(404).json({ error: 'Cryptocurrency not found' });
    }

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

    const usdToZar = await getUSDToZARRate();

    res.json({
      coin: {
        ...quoteResponse.data.data[crypto.id],
        ...infoResponse.data.data[crypto.id]
      },
      usdToZar
    });
  } catch (err) {
    console.error('API error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch crypto data'
    });
  }
});

// 🔹 HISTORICAL (stub)
app.get('/:cryptoName/historical', async (req, res) => {
  res.json({
    quotes: [],
    message:
      'Historical data requires a higher CoinMarketCap plan'
  });
});

module.exports = app;