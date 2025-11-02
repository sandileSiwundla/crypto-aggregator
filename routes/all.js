require('dotenv').config();
const axios = require('axios');
const express = require('express');
const router = express.Router();

const API_KEY = '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

async function getUSDToZARRate() {
  try {
    const res = await axios.get('https://api.frankfurter.app/latest?from=USD&to=ZAR');
    return res.data.rates?.ZAR;
  } catch (err) {
    console.error(err);
    return null;
  }
}

router.get('/data', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/cryptocurrency/listings/latest`, {
      headers: { 'X-CMC_PRO_API_KEY': API_KEY },
      params: { start: 1, limit: 10, convert: 'USD' }
    });

    const coins = response.data.data;
    console.log(coins)
    const usdToZar = await getUSDToZARRate();

    res.json({ coins, usdToZar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch crypto data' });
  }
});

module.exports = router;
