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

router.get('/:cryptoName', async (req, res) => {
  try {
    const cryptoName = req.params.cryptoName;
    const quoteResponse = await axios.get(`${BASE_URL}/cryptocurrency/quotes/latest`, {
      headers: { 'X-CMC_PRO_API_KEY': API_KEY },
      params: { slug: cryptoName, convert: 'USD' }
    });

    const coin = quoteResponse.data.data[Object.keys(quoteResponse.data.data)[0]];

    const infoResponse = await axios.get(`${BASE_URL}/cryptocurrency/info`, {
      headers: { 'X-CMC_PRO_API_KEY': API_KEY },
      params: { slug: cryptoName }
    });

    const coinInfo = infoResponse.data.data[Object.keys(infoResponse.data.data)[0]];
    const usdToZar = await getUSDToZARRate();

    res.json({ coin: { ...coin, ...coinInfo }, usdToZar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch crypto data' });
  }
});

router.get('/:cryptoName/historical', async (req, res) => {
  try {
    const cryptoName = req.params.cryptoName;
    const response = await axios.get(`${BASE_URL}/cryptocurrency/quotes/historical`, {
      headers: { 'X-CMC_PRO_API_KEY': API_KEY },
      params: { slug: cryptoName, count: 30, convert: 'USD' }
    });

    const quotes = response.data.data.quotes;
    res.json({ quotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

module.exports = router;
