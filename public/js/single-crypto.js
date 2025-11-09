import { renderChart, createMockChart, destroyChart } from './components/singleToken/TokenChart.js';
import { addToTable, clearTable } from './components/singleToken/TokenTable.js';
import { displayCryptoDetails, showLoading, showError, showDetails } from './components/singleToken/TokenDetails.js';
import { initializeTokenomics, destroyTokenomicsChart } from './components/singleToken/TokenomicsChart.js';

const form = document.getElementById('crypto-form');
const cryptoNameInput = document.getElementById('crypto-name');

// Initialize tokenomics when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeTokenomics();
});

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

    clearTable();
    destroyChart();
    destroyTokenomicsChart(); // Clear any existing tokenomics chart

    if (coin) {
      displayCryptoDetails(coin, usdToZar);
      await loadHistoricalData(cryptoName);
      addToTable(coin, usdToZar);
      showDetails();
    } else {
      showError('Cryptocurrency not found');
    }
  } catch (err) {
    console.error('Error fetching crypto data:', err);
    showError(`Error: ${err.message}`);
  }
});

// Interactive effects remain here
cryptoNameInput.addEventListener('focus', () => {
  cryptoNameInput.parentElement.style.transform = 'scale(1.02)';
});

cryptoNameInput.addEventListener('blur', () => {
  cryptoNameInput.parentElement.style.transform = 'scale(1)';
});