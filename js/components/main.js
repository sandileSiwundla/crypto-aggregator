class CryptoResearchApp {
  constructor() {
    this.tokenSearch = new TokenSearch(this.handleSearch.bind(this));
    this.tokenDetails = new TokenDetails();
    this.tokenChart = new TokenChart();
    this.tokenTable = new TokenTable();
  }

  async handleSearch(cryptoName) {
    try {
      this.tokenSearch.setLoading(true);
      this.tokenDetails.showLoading();

      const res = await fetch(`/api/single/${encodeURIComponent(cryptoName)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      const { coin, usdToZar } = data;

      if (coin) {
        this.tokenDetails.display(coin, usdToZar);
        this.tokenTable.clear();
        this.tokenTable.addRow(coin, usdToZar);
        await this.loadHistoricalData(cryptoName);
      } else {
        this.tokenDetails.showError('Cryptocurrency not found');
      }
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      this.tokenDetails.showError(`Error: ${err.message}`);
    } finally {
      this.tokenSearch.setLoading(false);
    }
  }

  async loadHistoricalData(cryptoName) {
    try {
      const historicalRes = await fetch(`/api/single/${encodeURIComponent(cryptoName)}/historical`);
      const historicalData = await historicalRes.json();
      
      if (historicalData.quotes && historicalData.quotes.length > 0) {
        this.tokenChart.renderChart(historicalData.quotes);
      } else {
        this.tokenChart.createMockChart();
      }
    } catch (historicalErr) {
      console.error('Error with historical data:', historicalErr);
      this.tokenChart.createMockChart();
    }
  }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new CryptoResearchApp();
});