"use client";


const cryptoDetails = document.getElementById('crypto-details');

export function displayCryptoDetails(coin, usdToZar) {
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

export function showLoading() {
  cryptoDetails.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Analyzing cryptocurrency data...</p>
    </div>
  `;
  cryptoDetails.classList.remove('hidden');
}

export function showError(message) {
  cryptoDetails.innerHTML = `
    <div class="loading">
      <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
      <p>${message}</p>
    </div>
  `;
  cryptoDetails.classList.remove('hidden');
}

export function showDetails() {
  cryptoDetails.classList.remove('hidden');
  cryptoDetails.classList.add('fade-in');
}