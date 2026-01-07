

export class TokenCards {
    constructor() {
        this.container = document.getElementById('comparison-results');
    }

    display(token1Data, token2Data) {
        const token1 = token1Data.coin;
        const token2 = token2Data.coin;
        
        const token1Price = token1.quote?.USD?.price || 0;
        const token2Price = token2.quote?.USD?.price || 0;
        
        const token1MarketCap = token1.quote?.USD?.market_cap || 0;
        const token2MarketCap = token2.quote?.USD?.market_cap || 0;
        
        const token1Class = token1MarketCap > token2MarketCap ? 'winner' : 'loser';
        const token2Class = token2MarketCap > token1MarketCap ? 'winner' : 'loser';
        
        this.container.innerHTML = `
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
        
        this.container.classList.remove('hidden');
    }

    getPriceChangeClass(change) {
        if (!change) return '';
        return change >= 0 ? 'price-up' : 'price-down';
    }

    hide() {
        this.container.classList.add('hidden');
    }
}