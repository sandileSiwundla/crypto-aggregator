const form = document.getElementById('crypto-form');
const cryptoNameInput = document.getElementById('crypto-name');
const table = document.getElementById('crypto-table');
const cryptoDetails = document.getElementById('crypto-details');
const tableBody = table.querySelector('tbody');

let chart;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const cryptoName = cryptoNameInput.value.trim();

  if (!cryptoName) {
    showError('Please enter a cryptocurrency name');
    return;
  }

  try {
    showLoading();
    
    const res = await fetch(`/api/single/${encodeURIComponent(cryptoName)}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch data');
    }

    const { coin, usdToZar } = data;

    // Clear existing data
    tableBody.innerHTML = '';
    
    if (chart) {
      chart.destroy();
    }

    if (coin) {
      displayCryptoDetails(coin, usdToZar);
      await loadHistoricalData(cryptoName);
      addToTable(coin, usdToZar);
      
      // Show hidden sections
      cryptoDetails.classList.remove('hidden');
      cryptoDetails.classList.add('fade-in');
    } else {
      showError('Cryptocurrency not found');
    }
  } catch (err) {
    console.error('Error fetching crypto data:', err);
    showError(`Error: ${err.message}`);
  }
});

function displayCryptoDetails(coin, usdToZar) {
  const priceUSD = coin.quote?.USD?.price || 0;
  const priceZAR = usdToZar && priceUSD ? priceUSD * usdToZar : 'N/A';
  const priceChange24h = coin.quote?.USD?.percent_change_24h || 0;
  const priceChangeClass = priceChange24h >= 0 ? 'price-up' : 'price-down';

  cryptoDetails.innerHTML = `
    <div class="crypto-header">
      ${coin.logo ? `<img src="${coin.logo}" alt="${coin.name} logo" class="crypto-logo">` : ''}
      <div class="crypto-title">
        <h2>${coin.name} <span class="symbol">(${coin.symbol})</span></h2>
        <div class="price-info">
          <span class="price-large">$${priceUSD.toFixed(2)}</span>
          <span class="${priceChangeClass}">
            ${priceChange24h >= 0 ? '↗' : '↘'} ${Math.abs(priceChange24h).toFixed(2)}%
          </span>
        </div>
        ${priceZAR !== 'N/A' ? `<div class="zar-price">R ${priceZAR.toFixed(2)} ZAR</div>` : ''}
      </div>
    </div>
    
    ${coin.description ? `
      <div class="crypto-description">
        <h3>About</h3>
        <p>${coin.description.substring(0, 400)}${coin.description.length > 400 ? '...' : ''}</p>
      </div>
    ` : ''}
    
    <div class="crypto-links">
      ${coin.urls?.website?.[0] ? `
        <a href="${coin.urls.website[0]}" target="_blank" class="crypto-link">
          <i class="fas fa-globe"></i> Website
        </a>
      ` : ''}
      
      ${coin.urls?.technical_doc?.[0] ? `
        <a href="${coin.urls.technical_doc[0]}" target="_blank" class="crypto-link">
          <i class="fas fa-file-alt"></i> Whitepaper
        </a>
      ` : ''}
      
      ${coin.urls?.source_code?.[0] ? `
        <a href="${coin.urls.source_code[0]}" target="_blank" class="crypto-link">
          <i class="fab fa-github"></i> Source Code
        </a>
      ` : ''}
    </div>
  `;
}

function addToTable(coin, usdToZar) {
  const priceUSD = coin.quote?.USD?.price || 0;
  const priceZAR = usdToZar && priceUSD ? priceUSD * usdToZar : 'N/A';
  const priceChange24h = coin.quote?.USD?.percent_change_24h || 0;
  const priceChangeClass = priceChange24h >= 0 ? 'price-up' : 'price-down';

  const row = document.createElement('tr');
  row.className = 'fade-in';
  
  row.innerHTML = `
    <td><span class="metric-highlight">${coin.cmc_rank || 'N/A'}</span></td>
    <td>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        ${coin.logo ? `<img src="${coin.logo}" alt="${coin.name}" style="width: 24px; height: 24px; border-radius: 50%;">` : ''}
        <strong>${coin.name}</strong>
      </div>
    </td>
    <td><code>${coin.symbol}</code></td>
    <td>
      <strong>$${priceUSD.toFixed(2)}</strong>
      <div class="${priceChangeClass}" style="font-size: 0.8rem;">
        ${priceChange24h >= 0 ? '↗' : '↘'} ${Math.abs(priceChange24h).toFixed(2)}%
      </div>
    </td>
    <td><strong>${priceZAR === 'N/A' ? 'N/A' : 'R ' + priceZAR.toFixed(2)}</strong></td>
    <td>$${(coin.quote?.USD?.market_cap || 0).toLocaleString()}</td>
    <td>$${(coin.quote?.USD?.volume_24h || 0).toLocaleString()}</td>
    <td>${(coin.circulating_supply || 0).toLocaleString()} ${coin.symbol}</td>
  `;
  
  tableBody.appendChild(row);
}

async function loadHistoricalData(cryptoName) {
  try {
    const historicalRes = await fetch(`/api/single/${encodeURIComponent(cryptoName)}/historical`);
    const historicalData = await historicalRes.json();
    
    if (historicalData.quotes && historicalData.quotes.length > 0) {
      renderChart(historicalData.quotes);
    } else {
      createMockChart();
    }
  } catch (historicalErr) {
    console.error('Error with historical data:', historicalErr);
    createMockChart();
  }
}

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
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 3,
        tension: 0.1,
        fill: true,
        pointBackgroundColor: 'rgb(37, 99, 235)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1f2937',
          bodyColor: '#1f2937',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(229, 231, 235, 0.5)'
          },
          ticks: {
            color: '#6b7280'
          }
        },
        y: {
          grid: {
            color: 'rgba(229, 231, 235, 0.5)'
          },
          ticks: {
            color: '#6b7280',
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'nearest'
      },
      animations: {
        tension: {
          duration: 1000,
          easing: 'linear'
        }
      }
    }
  });
}

function createMockChart() {
  const ctx = document.getElementById('historical-chart').getContext('2d');
  const labels = [];
  const data = [];
  
  // Create more realistic mock data
  let basePrice = 100 + Math.random() * 100;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString());
    
    // Simulate more realistic price movements
    const change = (Math.random() - 0.5) * 20;
    basePrice = Math.max(50, basePrice + change);
    data.push(basePrice);
  }

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Price (USD) - Sample Data',
        data,
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderWidth: 3,
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function showLoading() {
  cryptoDetails.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Analyzing cryptocurrency data...</p>
    </div>
  `;
  cryptoDetails.classList.remove('hidden');
}

function showError(message) {
  cryptoDetails.innerHTML = `
    <div class="loading">
      <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
      <p>${message}</p>
    </div>
  `;
  cryptoDetails.classList.remove('hidden');
}

// Add some interactive effects
cryptoNameInput.addEventListener('focus', () => {
  cryptoNameInput.parentElement.style.transform = 'scale(1.02)';
});

cryptoNameInput.addEventListener('blur', () => {
  cryptoNameInput.parentElement.style.transform = 'scale(1)';
});