const table = document.getElementById('crypto-table');
const tableBody = table.querySelector('tbody');

export function addToTable(coin, usdToZar) {
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

export function clearTable() {
  tableBody.innerHTML = '';
}