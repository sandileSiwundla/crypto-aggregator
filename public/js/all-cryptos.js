class AllCryptos {
    constructor() {
        this.cryptoData = [];
        this.currentSort = { field: 'rank', direction: 'asc' };
        this.init();
    }

    async init() {
        await this.loadCryptoData();
        this.setupEventListeners();
    }

    async loadCryptoData() {
        const loading = document.getElementById('loading');
        const errorMessage = document.getElementById('error-message');
        const tableBody = document.getElementById('crypto-table-body');

        try {
            loading.classList.remove('hidden');
            errorMessage.classList.add('hidden');

            const response = await fetch('/api/all');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.cryptoData = data.slice(0, 50); // Get top 50 cryptos
            
            this.renderTable();
            this.renderMarketStats();
            this.updateLastUpdated();
            
            loading.classList.add('hidden');
            
        } catch (error) {
            console.error('Error loading crypto data:', error);
            loading.classList.add('hidden');
            errorMessage.classList.remove('hidden');
            document.getElementById('error-text').textContent = 
                `Failed to load cryptocurrency data: ${error.message}`;
        }
    }

    renderTable() {
        const tableBody = document.getElementById('crypto-table-body');
        const sortedData = this.sortData([...this.cryptoData]);
        
        tableBody.innerHTML = sortedData.map((crypto, index) => `
            <tr>
                <td>${crypto.cmc_rank || index + 1}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <img src="${this.getLogoUrl(crypto)}" 
                             alt="${crypto.name}" 
                             style="width: 24px; height: 24px; border-radius: 50%;">
                        <span>${crypto.name}</span>
                    </div>
                </td>
                <td><strong>${crypto.symbol}</strong></td>
                <td class="price-up">$${this.formatNumber(crypto.quote?.USD?.price || 0)}</td>
                <td class="price-up">R${this.formatNumber((crypto.quote?.USD?.price || 0) * this.getExchangeRate())}</td>
                <td>$${this.formatMarketCap(crypto.quote?.USD?.market_cap || 0)}</td>
                <td class="${this.getChangeClass(crypto.quote?.USD?.percent_change_24h || 0)}">
                    ${this.formatPercent(crypto.quote?.USD?.percent_change_24h || 0)}
                </td>
                <td>$${this.formatNumber(crypto.quote?.USD?.volume_24h || 0)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewToken('${crypto.symbol}')">
                            <i class="fas fa-chart-line"></i>
                            View
                        </button>
                        <button class="compare-btn" onclick="compareToken('${crypto.symbol}')">
                            <i class="fas fa-balance-scale"></i>
                            Compare
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderMarketStats() {
        const statsContainer = document.getElementById('market-stats');
        
        if (this.cryptoData.length === 0) return;

        const totalMarketCap = this.cryptoData.reduce((sum, crypto) => 
            sum + (crypto.quote?.USD?.market_cap || 0), 0);
        
        const totalVolume = this.cryptoData.reduce((sum, crypto) => 
            sum + (crypto.quote?.USD?.volume_24h || 0), 0);
        
        const avgChange24h = this.cryptoData.reduce((sum, crypto) => 
            sum + (crypto.quote?.USD?.percent_change_24h || 0), 0) / this.cryptoData.length;

        const gaining = this.cryptoData.filter(crypto => 
            (crypto.quote?.USD?.percent_change_24h || 0) > 0).length;

        statsContainer.innerHTML = `
            <div class="stat-card">
                <i class="fas fa-globe"></i>
                <h3>Total Market Cap</h3>
                <div class="value">$${this.formatMarketCap(totalMarketCap)}</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-exchange-alt"></i>
                <h3>Total Volume (24h)</h3>
                <div class="value">$${this.formatNumber(totalVolume)}</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-chart-line"></i>
                <h3>Average Change (24h)</h3>
                <div class="value ${this.getChangeClass(avgChange24h)}">${this.formatPercent(avgChange24h)}</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-arrow-up"></i>
                <h3>Gaining Tokens</h3>
                <div class="value">${gaining}/${this.cryptoData.length}</div>
                <div class="change change-positive">${Math.round((gaining / this.cryptoData.length) * 100)}%</div>
            </div>
        `;
    }

    setupEventListeners() {
        // Table sorting
        document.querySelectorAll('#crypto-table th[data-sort]').forEach(header => {
            header.addEventListener('click', () => {
                const field = header.getAttribute('data-sort');
                this.handleSort(field);
            });
        });

        // Download functionality
        document.getElementById('download-table').addEventListener('click', () => {
            this.downloadTable();
        });
    }

    handleSort(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }
        
        this.updateSortHeaders();
        this.renderTable();
    }

    updateSortHeaders() {
        document.querySelectorAll('#crypto-table th[data-sort]').forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header.getAttribute('data-sort') === this.currentSort.field) {
                header.classList.add(this.currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });
    }

    sortData(data) {
        return data.sort((a, b) => {
            let aValue = this.getSortValue(a, this.currentSort.field);
            let bValue = this.getSortValue(b, this.currentSort.field);
            
            if (this.currentSort.direction === 'desc') {
                [aValue, bValue] = [bValue, aValue];
            }
            
            if (typeof aValue === 'string') {
                return aValue.localeCompare(bValue);
            }
            return aValue - bValue;
        });
    }

    getSortValue(crypto, field) {
        switch (field) {
            case 'rank':
                return crypto.cmc_rank;
            case 'name':
                return crypto.name.toLowerCase();
            case 'symbol':
                return crypto.symbol.toLowerCase();
            case 'price':
                return crypto.quote?.USD?.price || 0;
            case 'priceZar':
                return (crypto.quote?.USD?.price || 0) * this.getExchangeRate();
            case 'marketCap':
                return crypto.quote?.USD?.market_cap || 0;
            case 'change24h':
                return crypto.quote?.USD?.percent_change_24h || 0;
            case 'volume24h':
                return crypto.quote?.USD?.volume_24h || 0;
            default:
                return 0;
        }
    }

    getLogoUrl(crypto) {
        // You might need to adjust this based on your API response
        return `https://s2.coinmarketcap.com/static/img/coins/64x64/${crypto.id}.png`;
    }

    getExchangeRate() {
        // You can fetch this from an API or set a fixed rate
        return 18.5; // Example ZAR to USD rate
    }

    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(4);
    }

    formatMarketCap(marketCap) {
        if (marketCap >= 1000000000000) {
            return (marketCap / 1000000000000).toFixed(2) + 'T';
        }
        if (marketCap >= 1000000000) {
            return (marketCap / 1000000000).toFixed(2) + 'B';
        }
        if (marketCap >= 1000000) {
            return (marketCap / 1000000).toFixed(2) + 'M';
        }
        return marketCap.toFixed(2);
    }

    formatPercent(percent) {
        return `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;
    }

    getChangeClass(change) {
        if (change > 0) return 'change-positive';
        if (change < 0) return 'change-negative';
        return 'price-neutral';
    }

    updateLastUpdated() {
        const timeElement = document.getElementById('last-updated-time');
        const now = new Date();
        timeElement.textContent = now.toLocaleString();
    }

    async downloadTable() {
        const table = document.getElementById('crypto-table');
        const button = document.getElementById('download-table');
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
            button.disabled = true;

            const canvas = await html2canvas(table);
            const link = document.createElement('a');
            link.download = `crypto-report-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL();
            link.click();
            
        } catch (error) {
            console.error('Error downloading table:', error);
            alert('Failed to download table. Please try again.');
        } finally {
            button.innerHTML = '<i class="fas fa-download"></i> Download Report';
            button.disabled = false;
        }
    }
}

// Global functions for button actions
function viewToken(symbol) {
    window.location.href = `/token?symbol=${symbol}`;
}

function compareToken(symbol) {
    window.location.href = `/compare?token1=${symbol}`;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.allCryptos = new AllCryptos();
});

// Make load function globally available for retry button
window.loadCryptoData = function() {
    window.allCryptos.loadCryptoData();
};