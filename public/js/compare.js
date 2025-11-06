class CryptoCompare {
  constructor() {
    this.form = document.getElementById('compare-form');
    this.token1Input = document.getElementById('token1-input');
    this.token2Input = document.getElementById('token2-input');
    this.resultsSection = document.getElementById('comparison-results');
    this.chart = null;
    
    this.initializeEventListeners();
    this.loadPopularTokens();
  }

  initializeEventListeners() {
    this.form.addEventListener('submit', this.handleCompare.bind(this));
    
    // Add input event listeners for suggestions
    this.token1Input.addEventListener('input', this.handleTokenInput.bind(this, 'token1'));
    this.token2Input.addEventListener('input', this.handleTokenInput.bind(this, 'token2'));
    
    // Close suggestions when clicking outside
    document.addEventListener('click', this.closeAllSuggestions.bind(this));
  }

  async handleCompare(e) {
    e.preventDefault();
    
    const token1 = this.token1Input.value.trim();
    const token2 = this.token2Input.value.trim();
    
    if (!token1 || !token2) {
      alert('Please enter both tokens to compare');
      return;
    }
    
    if (token1.toLowerCase() === token2.toLowerCase()) {
      alert('Please enter two different tokens to compare');
      return;
    }
    
    try {
      this.showLoading();
      
      // Fetch both tokens in parallel
      const [token1Data, token2Data] = await Promise.all([
        this.fetchTokenData(token1),
        this.fetchTokenData(token2)
      ]);
      
      this.displayComparison(token1Data, token2Data);
      this.renderComparisonChart(token1Data, token2Data);
      this.renderComparisonTable(token1Data, token2Data);
      this.renderTokenomicsComparison(token1Data, token2Data);
      
    } catch (error) {
      console.error('Error comparing tokens:', error);
      this.showError('Failed to compare tokens: ' + error.message);
    }
  }

  async fetchTokenData(tokenName) {
    const response = await fetch(`/api/single/${encodeURIComponent(tokenName)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${tokenName}`);
    }
    const data = await response.json();
    return data;
  }

  displayComparison(token1Data, token2Data) {
    const token1 = token1Data.coin;
    const token2 = token2Data.coin;
    
    const token1Price = token1.quote?.USD?.price || 0;
    const token2Price = token2.quote?.USD?.price || 0;
    
    // Determine winner based on market cap (you can change this logic)
    const token1MarketCap = token1.quote?.USD?.market_cap || 0;
    const token2MarketCap = token2.quote?.USD?.market_cap || 0;
    
    const token1Class = token1MarketCap > token2MarketCap ? 'winner' : 'loser';
    const token2Class = token2MarketCap > token1MarketCap ? 'winner' : 'loser';
    
    this.resultsSection.innerHTML = `
      <div class="tokens-comparison fade-in">
        <div class="token-card ${token1Class}">
          <div class="token-header">
            ${token1.logo ? `<img src="${token1.logo}" alt="${token1.name}" class="token-logo">` : ''}
            <div class="token-info">
              <h3>${token1.name}</h3>
              <div class="token-symbol">${token1.symbol}</div>
            </div>
          </div>
          <div class="token-price">$${token1Price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
          <div class="token-price-change ${this.getPriceChangeClass(token1.quote?.USD?.percent_change_24h)}">
            ${token1.quote?.USD?.percent_change_24h ? 
              (token1.quote.USD.percent_change_24h > 0 ? '↗ ' : '↘ ') + 
              Math.abs(token1.quote.USD.percent_change_24h).toFixed(2) + '%' : 'N/A'}
          </div>
          <div class="token-stats">
            <div class="stat">
              <span class="stat-label">Market Cap</span>
              <span class="stat-value">$${(token1MarketCap / 1e9).toFixed(2)}B</span>
            </div>
            <div class="stat">
              <span class="stat-label">Volume (24h)</span>
              <span class="stat-value">$${(token1.quote?.USD?.volume_24h / 1e6).toFixed(2)}M</span>
            </div>
            <div class="stat">
              <span class="stat-label">Circulating Supply</span>
              <span class="stat-value">${(token1.circulating_supply / 1e6).toFixed(2)}M</span>
            </div>
            <div class="stat">
              <span class="stat-label">Rank</span>
              <span class="stat-value">#${token1.cmc_rank || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div class="token-card ${token2Class}">
          <div class="token-header">
            ${token2.logo ? `<img src="${token2.logo}" alt="${token2.name}" class="token-logo">` : ''}
            <div class="token-info">
              <h3>${token2.name}</h3>
              <div class="token-symbol">${token2.symbol}</div>
            </div>
          </div>
          <div class="token-price">$${token2Price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
          <div class="token-price-change ${this.getPriceChangeClass(token2.quote?.USD?.percent_change_24h)}">
            ${token2.quote?.USD?.percent_change_24h ? 
              (token2.quote.USD.percent_change_24h > 0 ? '↗ ' : '↘ ') + 
              Math.abs(token2.quote.USD.percent_change_24h).toFixed(2) + '%' : 'N/A'}
          </div>
          <div class="token-stats">
            <div class="stat">
              <span class="stat-label">Market Cap</span>
              <span class="stat-value">$${(token2MarketCap / 1e9).toFixed(2)}B</span>
            </div>
            <div class="stat">
              <span class="stat-label">Volume (24h)</span>
              <span class="stat-value">$${(token2.quote?.USD?.volume_24h / 1e6).toFixed(2)}M</span>
            </div>
            <div class="stat">
              <span class="stat-label">Circulating Supply</span>
              <span class="stat-value">${(token2.circulating_supply / 1e6).toFixed(2)}M</span>
            </div>
            <div class="stat">
              <span class="stat-label">Rank</span>
              <span class="stat-value">#${token2.cmc_rank || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Update table headers
    document.getElementById('token1-header').textContent = token1.name;
    document.getElementById('token2-header').textContent = token2.name;
    
    this.resultsSection.classList.remove('hidden');
  }

  renderComparisonChart(token1Data, token2Data) {
    const ctx = document.getElementById('comparison-chart').getContext('2d');
    
    if (this.chart) {
      this.chart.destroy();
    }
    
    // Create mock historical data for demonstration
    const labels = this.generateDateLabels(30);
    const token1Prices = this.generateMockPriceData(token1Data.coin.quote?.USD?.price || 100, 30);
    const token2Prices = this.generateMockPriceData(token2Data.coin.quote?.USD?.price || 100, 30);
    
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: token1Data.coin.name,
            data: token1Prices,
            borderColor: 'rgb(37, 99, 235)',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 3,
            tension: 0.1,
            fill: false
          },
          {
            label: token2Data.coin.name,
            data: token2Prices,
            borderColor: 'rgb(124, 58, 237)',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            borderWidth: 3,
            tension: 0.1,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(229, 231, 235, 0.5)'
            }
          },
          y: {
            grid: {
              color: 'rgba(229, 231, 235, 0.5)'
            },
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  renderComparisonTable(token1Data, token2Data) {
    const tbody = document.getElementById('comparison-table-body');
    const token1 = token1Data.coin;
    const token2 = token2Data.coin;
    
    const metrics = [
      {
        name: 'Price (USD)',
        token1: `$${token1.quote?.USD?.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
        token2: `$${token2.quote?.USD?.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
        value1: token1.quote?.USD?.price,
        value2: token2.quote?.USD?.price
      },
      {
        name: 'Market Cap',
        token1: `$${(token1.quote?.USD?.market_cap / 1e9).toFixed(2)}B`,
        token2: `$${(token2.quote?.USD?.market_cap / 1e9).toFixed(2)}B`,
        value1: token1.quote?.USD?.market_cap,
        value2: token2.quote?.USD?.market_cap
      },
      {
        name: 'Volume (24h)',
        token1: `$${(token1.quote?.USD?.volume_24h / 1e6).toFixed(2)}M`,
        token2: `$${(token2.quote?.USD?.volume_24h / 1e6).toFixed(2)}M`,
        value1: token1.quote?.USD?.volume_24h,
        value2: token2.quote?.USD?.volume_24h
      },
      {
        name: 'Price Change (24h)',
        token1: token1.quote?.USD?.percent_change_24h ? `${token1.quote.USD.percent_change_24h.toFixed(2)}%` : 'N/A',
        token2: token2.quote?.USD?.percent_change_24h ? `${token2.quote.USD.percent_change_24h.toFixed(2)}%` : 'N/A',
        value1: token1.quote?.USD?.percent_change_24h,
        value2: token2.quote?.USD?.percent_change_24h
      },
      {
        name: 'Circulating Supply',
        token1: token1.circulating_supply ? `${(token1.circulating_supply / 1e6).toFixed(2)}M` : 'N/A',
        token2: token2.circulating_supply ? `${(token2.circulating_supply / 1e6).toFixed(2)}M` : 'N/A',
        value1: token1.circulating_supply,
        value2: token2.circulating_supply
      },
      {
        name: 'Total Supply',
        token1: token1.total_supply ? `${(token1.total_supply / 1e6).toFixed(2)}M` : 'N/A',
        token2: token2.total_supply ? `${(token2.total_supply / 1e6).toFixed(2)}M` : 'N/A',
        value1: token1.total_supply,
        value2: token2.total_supply
      },
      {
        name: 'Max Supply',
        token1: token1.max_supply ? `${(token1.max_supply / 1e6).toFixed(2)}M` : 'Infinite',
        token2: token2.max_supply ? `${(token2.max_supply / 1e6).toFixed(2)}M` : 'Infinite',
        value1: token1.max_supply,
        value2: token2.max_supply
      },
      {
        name: 'Market Rank',
        token1: `#${token1.cmc_rank || 'N/A'}`,
        token2: `#${token2.cmc_rank || 'N/A'}`,
        value1: token1.cmc_rank,
        value2: token2.cmc_rank
      }
    ];
    
    tbody.innerHTML = metrics.map(metric => {
      const advantage = this.calculateAdvantage(metric.value1, metric.value2, metric.name);
      
      return `
        <tr>
          <td class="metric-name">${metric.name}</td>
          <td>${metric.token1}</td>
          <td>${metric.token2}</td>
          <td>${this.calculateDifference(metric.value1, metric.value2, metric.name)}</td>
          <td class="advantage-${advantage}">${this.getAdvantageText(advantage, metric.name)}</td>
        </tr>
      `;
    }).join('');
  }

  renderTokenomicsComparison(token1Data, token2Data) {
    const container = document.getElementById('tokenomics-comparison');
    const token1 = token1Data.coin;
    const token2 = token2Data.coin;
    
    container.innerHTML = `
      <div class="tokenomics-card">
        <h4>${token1.name} Tokenomics</h4>
        <div class="supply-metrics">
          <div class="supply-metric">
            <span>Circulating Supply</span>
            <span>${token1.circulating_supply ? (token1.circulating_supply / 1e6).toFixed(2) + 'M' : 'N/A'}</span>
          </div>
          <div class="supply-metric">
            <span>Total Supply</span>
            <span>${token1.total_supply ? (token1.total_supply / 1e6).toFixed(2) + 'M' : 'N/A'}</span>
          </div>
          <div class="supply-metric">
            <span>Max Supply</span>
            <span>${token1.max_supply ? (token1.max_supply / 1e6).toFixed(2) + 'M' : 'Infinite'}</span>
          </div>
          <div class="supply-metric">
            <span>Circulating %</span>
            <span>${token1.max_supply ? ((token1.circulating_supply / token1.max_supply) * 100).toFixed(2) + '%' : 'N/A'}</span>
          </div>
        </div>
      </div>
      
      <div class="tokenomics-card">
        <h4>${token2.name} Tokenomics</h4>
        <div class="supply-metrics">
          <div class="supply-metric">
            <span>Circulating Supply</span>
            <span>${token2.circulating_supply ? (token2.circulating_supply / 1e6).toFixed(2) + 'M' : 'N/A'}</span>
          </div>
          <div class="supply-metric">
            <span>Total Supply</span>
            <span>${token2.total_supply ? (token2.total_supply / 1e6).toFixed(2) + 'M' : 'N/A'}</span>
          </div>
          <div class="supply-metric">
            <span>Max Supply</span>
            <span>${token2.max_supply ? (token2.max_supply / 1e6).toFixed(2) + 'M' : 'Infinite'}</span>
          </div>
          <div class="supply-metric">
            <span>Circulating %</span>
            <span>${token2.max_supply ? ((token2.circulating_supply / token2.max_supply) * 100).toFixed(2) + '%' : 'N/A'}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Helper methods
  getPriceChangeClass(change) {
    if (!change) return '';
    return change >= 0 ? 'price-up' : 'price-down';
  }

  calculateAdvantage(value1, value2, metric) {
    if (value1 === undefined || value2 === undefined) return 'draw';
    
    // For some metrics, lower is better (like rank)
    if (metric.includes('Rank')) {
      return value1 < value2 ? 'win' : value1 > value2 ? 'lose' : 'draw';
    }
    
    // For most metrics, higher is better
    return value1 > value2 ? 'win' : value1 < value2 ? 'lose' : 'draw';
  }

  calculateDifference(value1, value2, metric) {
    if (value1 === undefined || value2 === undefined) return 'N/A';
    
    if (metric.includes('Rank')) {
      const diff = value1 - value2;
      return diff === 0 ? 'Same' : (diff > 0 ? `+${diff}` : diff);
    }
    
    if (metric.includes('Price Change')) {
      const diff = value1 - value2;
      return diff === 0 ? 'Same' : (diff > 0 ? `+${diff.toFixed(2)}%` : `${diff.toFixed(2)}%`);
    }
    
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      const diff = ((value1 - value2) / value2) * 100;
      return diff === 0 ? 'Same' : (diff > 0 ? `+${diff.toFixed(2)}%` : `${diff.toFixed(2)}%`);
    }
    
    return 'N/A';
  }

  getAdvantageText(advantage, metric) {
    if (advantage === 'draw') return 'Equal';
    
    const isRank = metric.includes('Rank');
    if (isRank) {
      return advantage === 'win' ? 'Lower (Better)' : 'Higher (Worse)';
    }
    
    return advantage === 'win' ? 'Better' : 'Worse';
  }

  generateDateLabels(days) {
    const labels = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString());
    }
    return labels;
  }

  generateMockPriceData(basePrice, days) {
    const data = [basePrice];
    let currentPrice = basePrice;
    
    for (let i = 1; i <= days; i++) {
      const change = (Math.random() - 0.5) * 0.1; // ±5% change
      currentPrice = Math.max(0.1, currentPrice * (1 + change));
      data.push(currentPrice);
    }
    
    return data;
  }

  showLoading() {
    this.resultsSection.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Comparing cryptocurrencies...</p>
      </div>
    `;
    this.resultsSection.classList.remove('hidden');
  }

  showError(message) {
    this.resultsSection.innerHTML = `
      <div class="loading">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
        <p>${message}</p>
      </div>
    `;
    this.resultsSection.classList.remove('hidden');
  }

  // Autocomplete/suggestions functionality
  async handleTokenInput(tokenField, e) {
    const input = e.target;
    const query = input.value.trim();
    
    if (query.length < 2) {
      this.hideSuggestions(tokenField);
      return;
    }
    
    // In a real implementation, you'd fetch suggestions from an API
    // For now, we'll use a simple mock
    const suggestions = await this.getTokenSuggestions(query);
    this.showSuggestions(tokenField, suggestions);
  }

  async getTokenSuggestions(query) {
    // Mock suggestions - in real implementation, fetch from your API
    const popularTokens = [
      { name: 'Bitcoin', symbol: 'BTC', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png' },
      { name: 'Ethereum', symbol: 'ETH', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
      { name: 'Binance Coin', symbol: 'BNB', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' },
      { name: 'Cardano', symbol: 'ADA', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png' },
      { name: 'Solana', symbol: 'SOL', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png' },
      { name: 'XRP', symbol: 'XRP', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/52.png' },
      { name: 'Polkadot', symbol: 'DOT', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png' },
      { name: 'Dogecoin', symbol: 'DOGE', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png' }
    ];
    
    const queryLower = query.toLowerCase();
    return popularTokens.filter(token => 
      token.name.toLowerCase().includes(queryLower) || 
      token.symbol.toLowerCase().includes(queryLower)
    );
  }

  showSuggestions(tokenField, suggestions) {
    const suggestionsEl = document.getElementById(`${tokenField}-suggestions`);
    
    if (suggestions.length === 0) {
      suggestionsEl.style.display = 'none';
      return;
    }
    
    suggestionsEl.innerHTML = suggestions.map(token => `
      <div class="suggestion-item" data-name="${token.name}" data-symbol="${token.symbol}">
        ${token.logo ? `<img src="${token.logo}" alt="${token.name}" class="suggestion-logo">` : ''}
        <span class="suggestion-name">${token.name}</span>
        <span class="suggestion-symbol">${token.symbol}</span>
      </div>
    `).join('');
    
    // Add click event listeners to suggestions
    suggestionsEl.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const input = document.getElementById(`${tokenField}-input`);
        input.value = item.dataset.name;
        this.hideSuggestions(tokenField);
      });
    });
    
    suggestionsEl.style.display = 'block';
  }

  hideSuggestions(tokenField) {
    const suggestionsEl = document.getElementById(`${tokenField}-suggestions`);
    suggestionsEl.style.display = 'none';
  }

  closeAllSuggestions(e) {
    if (!e.target.closest('.token-input-group')) {
      this.hideSuggestions('token1');
      this.hideSuggestions('token2');
    }
  }

  loadPopularTokens() {
    // Pre-populate with popular pairs for quick testing
    const popularPairs = [
      { token1: 'Bitcoin', token2: 'Ethereum' },
      { token1: 'Cardano', token2: 'Solana' },
      { token1: 'Binance Coin', token2: 'XRP' }
    ];
    
    // You could display these as quick-select buttons
  }
}

// Initialize the compare tool when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new CryptoCompare();
});