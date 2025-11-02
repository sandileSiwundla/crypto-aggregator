require('dotenv').config();
const axios = require('axios');
const express = require('express');
const app = express();
const PORT = 3000;

const API_KEY = process.env.COINMARKETCAP_API;
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

async function getUSDToZARRate() {
  try {
    const res = await axios.get('https://api.frankfurter.app/latest?from=USD&to=ZAR');
    const rate = res.data.rates?.ZAR;
    if (!rate) throw new Error('USD→ZAR rate not found');
    return rate;
  } catch (err) {
    console.error('Error fetching USD→ZAR rate:', err.message);
    return null;
  }
}

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/cryptocurrency/listings/latest`, {
      headers: { 'X-CMC_PRO_API_KEY': API_KEY },
      params: { start: 1, limit: 10, convert: 'USD' }
    });

    const coins = response.data.data;
    const usdToZar = await getUSDToZARRate();
    if (!usdToZar) return res.send('Error fetching USD→ZAR rate');

    let html = `
      <h1>Top 10 Cryptos</h1>
\      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Symbol</th>
          <th>Price (USD)</th>
          <th>Price (ZAR)</th>
        </tr>
    `;

    coins.forEach(coin => {
      const priceUSD = coin.quote.USD.price;
      const priceZAR = priceUSD * usdToZar;

      html += `
        <tr>
          <td>${coin.cmc_rank}</td>
          <td>${coin.name}</td>
          <td>${coin.symbol}</td>
          <td>$${priceUSD.toFixed(2)}</td>
          <td>R${priceZAR.toFixed(2)}</td>
        </tr>`;
    });

    html += `</table>`;
    res.send(html);

  } catch (err) {
    console.error(err.message);
    res.send(err.response ? err.response.data : err.message);
  }
});

app.listen(PORT, () => console.log(`✅ Server running: http://localhost:${PORT}`));
