require('dotenv').config();
const axios = require('axios');
const express = require('express');
const router = express.Router();

// ENV VARS (Vercel-safe)
const API_KEY = '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

if (!API_KEY) {
  console.warn('⚠️ CoinMarketCap API key is missing');
}

/**
 * Fetch USD → ZAR exchange rate
 */
async function getUSDToZARRate() {
  try {
    const res = await axios.get(
      'https://api.frankfurter.app/latest',
      { params: { from: 'USD', to: 'ZAR' } }
    );

    return res.data?.rates?.ZAR ?? null;
  } catch (err) {
    console.error('Error fetching ZAR rate:', err.message);
    return null;
  }
}

/**
 * GET /api/single/:cryptoName
 * Example: /api/single/btc or /api/single/bitcoin
 */
router.get('/:cryptoName', async (req, res) => {
  try {
    const cryptoName = req.params.cryptoName.toLowerCase();

    // 1️⃣ Fetch listings (to resolve ID)
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

    // 2️⃣ Fetch quote + info in parallel
    const [quoteRes, infoRes, usdToZar] = await Promise.all([
      axios.get(`${BASE_URL}/cryptocurrency/quotes/latest`, {
        headers: { 'X-CMC_PRO_API_KEY': API_KEY },
        params: { id: crypto.id, convert: 'USD' }
      }),
      axios.get(`${BASE_URL}/cryptocurrency/info`, {
        headers: { 'X-CMC_PRO_API_KEY': API_KEY },
        params: { id: crypto.id }
      }),
      getUSDToZARRate()
    ]);

    const coinData = {
      ...quoteRes.data.data[crypto.id],
      ...infoRes.data.data[crypto.id]
    };

    res.json({
      coin: coinData,
      usdToZar
    });
  } catch (err) {
    console.error(
      'Error fetching crypto data:',
      err.response?.data || err.message
    );

    res.status(500).json({
      error: 'Failed to fetch crypto data',
      details:
        err.response?.data?.status?.error_message ||
        err.message
    });
  }
});

/**
 * GET /api/single/:cryptoName/historical
 * (Free tier fallback)
 */
router.get('/:cryptoName/historical', async (req, res) => {
  try {
    res.json({
      quotes: [],
      message:
        'Historical data requires a premium CoinMarketCap plan.'
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch historical data'
    });
  }
});

module.exports = router;
