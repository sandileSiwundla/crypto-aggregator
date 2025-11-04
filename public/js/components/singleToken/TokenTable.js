const table = document.getElementById('crypto-table');
const tableBody = table.querySelector('tbody');

// Add research table class
table.classList.add('research-table');

export function addToTable(coin, usdToZar) {
  const priceUSD = coin.quote?.USD?.price || 0;
  const priceZAR = usdToZar && priceUSD ? priceUSD * usdToZar : 'N/A';
  const priceChange24h = coin.quote?.USD?.percent_change_24h || 0;
  const priceChangeClass = priceChange24h >= 0 ? 'price-up' : 'price-down';
  const changeIcon = priceChange24h >= 0 ? '↗' : '↘';

  const row = document.createElement('tr');
  row.className = 'table-row-enter';
  
  row.innerHTML = `
    <td class="rank-cell">
      <span style="
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-size: 0.9rem;
        min-width: 50px;
        display: inline-block;
        text-align: center;
      ">#${coin.cmc_rank || 'N/A'}</span>
    </td>
    
    <td class="name-cell">
      ${coin.logo ? `
        <img src="${coin.logo}" alt="${coin.name}" 
             onerror="this.style.display='none'">
      ` : ''}
      <div>
        <div style="font-weight: 700; color: #2d3748;">${coin.name}</div>
        <div style="font-size: 0.85rem; color: #718096; margin-top: 0.25rem;">
          ${coin.platform?.name || 'Native Chain'}
        </div>
      </div>
    </td>
    
    <td class="symbol-cell">${coin.symbol}</td>
    
    <td class="price-cell">
      <div style="color: #2d3748; font-size: 1.1rem;">
        $${priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div class="price-change ${priceChangeClass}">
        <span>${changeIcon}</span>
        <span>${Math.abs(priceChange24h).toFixed(2)}%</span>
      </div>
    </td>
    
    <td class="currency-cell">
      ${priceZAR === 'N/A' ? 'N/A' : 
        `R ${priceZAR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }
    </td>
    
    <td class="metric-cell">
      $${(coin.quote?.USD?.market_cap || 0).toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      })}
    </td>
    
    <td class="metric-cell">
      $${(coin.quote?.USD?.volume_24h || 0).toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      })}
    </td>
    
    <td class="supply-cell">
      ${(coin.circulating_supply || 0).toLocaleString('en-US')} 
      <span style="font-size: 0.8rem; color: #7c2d12; display: block; margin-top: 0.25rem;">
        ${coin.symbol}
      </span>
    </td>
  `;
  
  tableBody.appendChild(row);
}

export function clearTable() {
  tableBody.innerHTML = '';
}

// Optional: Add table header if not already in HTML
export function initializeTable() {
  if (!table.querySelector('thead')) {
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Rank</th>
        <th>Cryptocurrency</th>
        <th>Symbol</th>
        <th>Price (USD)</th>
        <th>Price (ZAR)</th>
        <th>Market Cap</th>
        <th>24h Volume</th>
        <th>Circulating Supply</th>
      </tr>
    `;
    table.insertBefore(thead, tableBody);
  }
}