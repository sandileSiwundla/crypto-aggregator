class TokenTable {
  constructor() {
    this.container = document.getElementById('table-section');
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="section-header">
        <h2><i class="fas fa-table"></i> Research Data</h2>
        <p>Comprehensive cryptocurrency metrics</p>
      </div>
      <div class="table-container">
        <table id="crypto-table">
          <thead>
            <tr>
              <th><i class="fas fa-hashtag"></i> Rank</th>
              <th><i class="fas fa-coins"></i> Name</th>
              <th><i class="fas fa-code"></i> Symbol</th>
              <th><i class="fas fa-dollar-sign"></i> Price (USD)</th>
              <th><i class="fas fa-money-bill-wave"></i> Price (ZAR)</th>
              <th><i class="fas fa-chart-pie"></i> Market Cap</th>
              <th><i class="fas fa-exchange-alt"></i> Volume (24h)</th>
              <th><i class="fas fa-boxes"></i> Circulating Supply</th>
            </tr>
          </thead>
          <tbody>
            <!-- Data will be populated here -->
          </tbody>
        </table>
      </div>
    `;
  }

  addRow(coin, usdToZar) {
    const tbody = this.container.querySelector('tbody');
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
    
    tbody.appendChild(row);
  }

  clear() {
    const tbody = this.container.querySelector('tbody');
    tbody.innerHTML = '';
  }
}