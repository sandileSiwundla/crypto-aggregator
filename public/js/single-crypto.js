const form = document.getElementById('crypto-form');
const cryptoNameInput = document.getElementById('crypto-name');
const table = document.getElementById('crypto-table');
const cryptoDetails = document.getElementById('crypto-details');

let chart;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const cryptoName = cryptoNameInput.value.trim();

  if (!cryptoName) {
    alert('Please enter a cryptocurrency name');
    return;
  }

  try {
    // Show loading state
    cryptoDetails.innerHTML = '<p>Loading...</p>';
    
    const res = await fetch(`/api/single/${encodeURIComponent(cryptoName)}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch data');
    }

    const { coin, usdToZar } = data;

    // Clear existing table rows and details
    while (table.rows.length > 1) {
      table.deleteRow(1);
    }
    
    if (chart) {
      chart.destroy();
    }

    if (coin) {
      // Display crypto details
      cryptoDetails.innerHTML = `
        ${coin.logo ? `<img src="${coin.logo}" alt="${coin.name} logo" width="50" height="50">` : ''}
        <h2>${coin.name} (${coin.symbol})</h2>
        ${coin.description ? `<p>${coin.description.substring(0, 200)}...</p>` : ''}
        ${coin.urls?.website?.[0] ? `<a href="${coin.urls.website[0]}" target="_blank">Website</a>` : ''}
      `;

      // Try to fetch historical data
      try {
        const historicalRes = await fetch(`/api/single/${encodeURIComponent(cryptoName)}/historical`);
        const historicalData = await historicalRes.json();
        
        if (historicalData.quotes && historicalData.quotes.length > 0) {
          renderChart(historicalData.quotes);
        } else {
          // Create mock historical data for demonstration
          createMockChart();
        }
      } catch (historicalErr) {
        console.error('Error with historical data:', historicalErr);
        createMockChart();
      }

      // Add to table
      const row = document.createElement('tr');
      const priceUSD = coin.quote?.USD?.price || 0;
      const priceZAR = usdToZar && priceUSD ? priceUSD * usdToZar : 'N/A';

      row.innerHTML = `
        <td>${coin.cmc_rank || 'N/A'}</td>
        <td>${coin.name}</td>
        <td>${coin.symbol}</td>
        <td>$${priceUSD.toFixed(2)}</td>
        <td>${priceZAR === 'N/A' ? 'N/A' : 'R' + priceZAR.toFixed(2)}</td>
        <td>$${(coin.quote?.USD?.market_cap || 0).toLocaleString()}</td>
        <td>$${(coin.quote?.USD?.volume_24h || 0).toLocaleString()}</td>
        <td>${(coin.circulating_supply || 0).toLocaleString()} ${coin.symbol}</td>
      `;
      table.appendChild(row);
    } else {
      cryptoDetails.innerHTML = '<p>Crypto not found</p>';
    }
  } catch (err) {
    console.error('Error fetching crypto data:', err);
    cryptoDetails.innerHTML = `<p>Error: ${err.message}</p>`;
  }
});

function renderChart(quotes) {
  const ctx = document.getElementById('historical-chart').getContext('2d');
  const labels = quotes.map(q => new Date(q.timestamp).toLocaleDateString());
  const data = quotes.map(q => q.quote?.USD?.price || 0);

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Price (USD)',
        data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 2,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

function createMockChart() {
  const ctx = document.getElementById('historical-chart').getContext('2d');
  const labels = [];
  const data = [];
  
  // Create mock data for last 30 days
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString());
    data.push(100 + Math.random() * 50); // Random price between 100-150
  }

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Price (USD) - Mock Data',
        data,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 2,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}