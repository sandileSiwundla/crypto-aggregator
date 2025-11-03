const form = document.getElementById('crypto-form');
const cryptoNameInput = document.getElementById('crypto-name');
const table = document.getElementById('crypto-table');
const cryptoDetails = document.getElementById('crypto-details');

let chart;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const cryptoName = cryptoNameInput.value;

  if (!cryptoName) {
    return;
  }

  try {
    const res = await fetch(`/api/single/${cryptoName}`);
    const { coin, usdToZar } = await res.json();

    // Clear existing table rows and details
    while (table.rows.length > 1) {
      table.deleteRow(1);
    }
    cryptoDetails.innerHTML = '';
    if (chart) {
      chart.destroy();
    }

    if (coin) {
      cryptoDetails.innerHTML = `
        <img src="${coin.logo}" alt="${coin.name} logo" width="50">
        <h2>${coin.name} (${coin.symbol})</h2>
        <p>${coin.description}</p>
        <a href="${coin.urls.website[0]}" target="_blank">Website</a>
      `;

      const historicalRes = await fetch(`/api/single/${cryptoName}/historical`);
      const { quotes } = await historicalRes.json();
      renderChart(quotes);

      const row = document.createElement('tr');
      const priceUSD = coin.quote.USD.price;
      const priceZAR = usdToZar ? priceUSD * usdToZar : 'N/A';

      row.innerHTML = `
        <td>${coin.cmc_rank}</td>
        <td>${coin.name}</td>
        <td>${coin.symbol}</td>
        <td>$${priceUSD.toFixed(2)}</td>
        <td>${priceZAR === 'N/A' ? 'N/A' : 'R' + priceZar.toFixed(2)}</td>
        <td>$${coin.quote.USD.market_cap.toLocaleString()}</td>
        <td>$${coin.quote.USD.volume_24h.toLocaleString()}</td>
        <td>${coin.circulating_supply.toLocaleString()} ${coin.symbol}</td>
      `;
      table.appendChild(row);
    } else {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="5">Crypto not found</td>`;
      table.appendChild(row);
    }
  } catch (err) {
    console.error('Error fetching crypto data:', err);
  }
});

function renderChart(quotes) {
  const ctx = document.getElementById('historical-chart').getContext('2d');
  const labels = quotes.map(q => new Date(q.timestamp).toLocaleDateString());
  const data = quotes.map(q => q.quote.USD.price);

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Price (USD)',
        data,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}
