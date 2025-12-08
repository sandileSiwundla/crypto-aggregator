import { CompareChart } from './components/compareToken/CompareChart.js';
import { CompareTable } from './components/compareToken/CompareTable.js';
import { VerticalCompareTable } from './components/compareToken/VerticalCompareTable.js';
import { TokenCards } from './components/compareToken/TokenCards.js';
import { TokenomicsComparison } from './components/compareToken/TokenomicsComparison.js';
import { TokenSearch } from './components/compareToken/TokenSearch.js';
import { VolumeCompare } from './components/compareToken/VolumeCompare.js';
import { FeeComparison } from './components/compareToken/feeComparison.js';

class CryptoCompare {
    constructor() {
        this.compareChart = new CompareChart();
        this.compareTable = new CompareTable();
        this.verticalCompareTable = new VerticalCompareTable();
        this.tokenCards = new TokenCards();
        this.tokenomicsComparison = new TokenomicsComparison();
        this.volumeCompare = new VolumeCompare(); 
        this.feeComparison = new FeeComparison(); // Added FeeComparison instance
        this.tokenSearch = new TokenSearch(this.handleCompare.bind(this));
        
        this.currentToken1 = null;
        this.currentToken2 = null;
        this.currentPeriod = 30;

        this.initializePeriodSelector();
        this.initializeEventListeners();
    }

    initializePeriodSelector() {
        const periodSelect = document.getElementById('period-select');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value === 'max' ? 1825 : parseInt(e.target.value);
                this.updateChartPeriod();
            });
        }

        this.createPeriodButtons();
    }

    initializeEventListeners() {
        // Add global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && !e.altKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.setPeriod(7);
                        break;
                    case '2':
                        e.preventDefault();
                        this.setPeriod(30);
                        break;
                    case '3':
                        e.preventDefault();
                        this.setPeriod(90);
                        break;
                    case '4':
                        e.preventDefault();
                        this.setPeriod(365);
                        break;
                    case '5':
                        e.preventDefault();
                        this.setPeriod(1825);
                        break;
                    case 'r':
                        e.preventDefault();
                        this.reset();
                        break;
                }
            }
        });
    }

    createPeriodButtons() {
        const periodButtons = [
            { days: 7, label: '1W' },
            { days: 30, label: '1M' },
            { days: 90, label: '3M' },
            { days: 365, label: '1Y' },
            { days: 1825, label: 'All' }
        ];

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'period-buttons';
        
        periodButtons.forEach(period => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `period-btn ${period.days === 30 ? 'active' : ''}`;
            button.textContent = period.label;
            button.dataset.days = period.days;
            
            button.addEventListener('click', () => {
                document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const periodSelect = document.getElementById('period-select');
                if (periodSelect) {
                    periodSelect.value = period.days === 1825 ? 'max' : period.days.toString();
                }
                
                this.currentPeriod = period.days;
                this.updateChartPeriod();
            });
            
            buttonContainer.appendChild(button);
        });

        const periodSelector = document.querySelector('.period-selector');
        if (periodSelector) {
            periodSelector.appendChild(buttonContainer);
        }
    }

    async handleCompare(token1, token2, period = this.currentPeriod) {
        if (!token1 || !token2) {
            this.showError('Please enter both tokens to compare');
            return;
        }

        if (token1.toLowerCase() === token2.toLowerCase()) {
            this.showError('Please enter two different tokens to compare');
            return;
        }

        try {
            this.showLoading();
            
            const [token1Data, token2Data] = await Promise.all([
                this.fetchTokenData(token1),
                this.fetchTokenData(token2)
            ]);
            
            if (!token1Data || !token2Data) {
                throw new Error('Failed to fetch token data');
            }
            
            this.currentToken1 = token1Data;
            this.currentToken2 = token2Data;
            this.currentPeriod = period;
            
            this.displayAllComparisons(token1Data, token2Data, period);
            this.showResults();
            
        } catch (error) {
            console.error('Error comparing tokens:', error);
            this.showError('Failed to compare tokens: ' + error.message);
        }
    }

    displayAllComparisons(token1Data, token2Data, period) {
        try {
            this.tokenCards.display(token1Data, token2Data);
            this.compareChart.render(token1Data, token2Data, period);
            this.compareTable.render(token1Data, token2Data);
            this.verticalCompareTable.render(token1Data, token2Data);
            this.tokenomicsComparison.render(token1Data, token2Data);
            this.volumeCompare.render(token1Data, token2Data, period);
            
            // Get exchange data for fee comparison
            // In production, replace with actual exchange data fetching
            const exchange1Data = this.getExchangeDataForToken(token1Data);
            const exchange2Data = this.getExchangeDataForToken(token2Data);
            
            if (exchange1Data && exchange2Data) {
                // Render fee comparison with associated exchange data
                // Note: In production, you'd want to map tokens to their primary exchanges
                this.renderFeeComparison(exchange1Data, exchange2Data);
            } else {
                // Fallback: Compare Binance vs Coinbase as default exchanges
                this.renderDefaultFeeComparison();
            }
            
        } catch (error) {
            console.error('Error displaying comparison:', error);
            throw new Error('Failed to render comparison data');
        }
    }

    renderFeeComparison(exchange1Data, exchange2Data) {
        try {
            // Check if fee comparison container exists
            let feeComparisonSection = document.getElementById('fee-comparison-section');
            
            if (!feeComparisonSection) {
                // Create the fee comparison section if it doesn't exist
                feeComparisonSection = document.createElement('div');
                feeComparisonSection.id = 'fee-comparison-section';
                feeComparisonSection.className = 'fee-comparison-section';
                
                // Insert after volume comparison section or at the end
                const volumeSection = document.getElementById('volume-comparison-section');
                if (volumeSection && volumeSection.parentNode) {
                    volumeSection.parentNode.insertBefore(feeComparisonSection, volumeSection.nextSibling);
                } else {
                    // Fallback: append to results container
                    const resultsContainer = document.getElementById('comparison-results');
                    if (resultsContainer) {
                        resultsContainer.appendChild(feeComparisonSection);
                    }
                }
            }
            
            // Create container for fee comparison
            const feeContainer = document.createElement('div');
            feeContainer.id = 'fee-comparison';
            feeComparisonSection.innerHTML = ''; // Clear previous content
            feeComparisonSection.appendChild(feeContainer);
            
            // Render fee comparison
            this.feeComparison.render(exchange1Data.name, exchange2Data.name);
            
        } catch (error) {
            console.error('Error rendering fee comparison:', error);
            // Don't throw - fee comparison is secondary feature
        }
    }

    renderDefaultFeeComparison() {
        try {
            // Render default fee comparison between major exchanges
            // This is a fallback when token-specific exchange data isn't available
            const defaultExchanges = ['Binance', 'Coinbase'];
            this.renderFeeComparison(
                { name: defaultExchanges[0] },
                { name: defaultExchanges[1] }
            );
        } catch (error) {
            console.error('Error rendering default fee comparison:', error);
        }
    }

    getExchangeDataForToken(tokenData) {
        // Map tokens to their primary exchanges
        // In production, this would be an API call or database query
        const tokenExchangeMap = {
            'BTC': { name: 'Binance', logo: 'https://example.com/binance-logo.png' },
            'ETH': { name: 'Coinbase', logo: 'https://example.com/coinbase-logo.png' },
            'SOL': { name: 'FTX', logo: 'https://example.com/ftx-logo.png' },
            'XRP': { name: 'Kraken', logo: 'https://example.com/kraken-logo.png' },
            'ADA': { name: 'Binance', logo: 'https://example.com/binance-logo.png' },
            'DOT': { name: 'Kraken', logo: 'https://example.com/kraken-logo.png' }
        };
        
        return tokenExchangeMap[tokenData.symbol] || { name: 'Binance', logo: null };
    }

    updateChartPeriod() {
        if (this.currentToken1 && this.currentToken2) {
            this.compareChart.updatePeriod(this.currentPeriod);
            this.volumeCompare.updatePeriod(this.currentPeriod);
        }
    }

    async fetchTokenData(tokenName) {
        try {
            // First try to fetch from API
            const response = await fetch(`/api/single/${encodeURIComponent(tokenName)}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.warn(`API fetch failed for ${tokenName}, using mock data:`, error);
            // Fallback to mock data for demonstration
            return this.generateMockTokenData(tokenName);
        }
    }

    generateMockTokenData(tokenName) {
        const symbols = {
            'bitcoin': 'BTC', 'btc': 'BTC',
            'ethereum': 'ETH', 'eth': 'ETH',
            'ripple': 'XRP', 'xrp': 'XRP',
            'cardano': 'ADA', 'ada': 'ADA',
            'solana': 'SOL', 'sol': 'SOL',
            'polkadot': 'DOT', 'dot': 'DOT'
        };
        
        const symbol = symbols[tokenName.toLowerCase()] || tokenName.toUpperCase().substring(0, 4);
        const basePrice = 100 + Math.random() * 400;
        const baseVolume = 50000000 + Math.random() * 950000000;
        
        return {
            id: tokenName.toLowerCase(),
            name: tokenName.charAt(0).toUpperCase() + tokenName.slice(1).toLowerCase(),
            symbol: symbol,
            price: basePrice,
            priceChange24h: (Math.random() - 0.5) * 20,
            volume24h: baseVolume,
            volumeChange24h: (Math.random() - 0.5) * 50,
            marketCap: basePrice * (1000000 + Math.random() * 9000000),
            marketCapRank: Math.floor(Math.random() * 100) + 1,
            circulatingSupply: 10000000 + Math.random() * 90000000,
            totalSupply: 100000000 + Math.random() * 900000000,
            maxSupply: 210000000,
            allTimeHigh: basePrice * (1 + Math.random() * 2),
            allTimeLow: basePrice * (0.1 + Math.random() * 0.5)
        };
    }

    showLoading() {
        const resultsSection = document.getElementById('comparison-results');
        resultsSection.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Comparing cryptocurrencies...</p>
                <p class="loading-subtext">Fetching latest market data including fee structures</p>
            </div>
        `;
        resultsSection.classList.remove('hidden');
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showResults() {
        const resultsSection = document.getElementById('comparison-results');
        resultsSection.innerHTML = `
            <div class="results-loaded">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
                <h3>Comparison Complete!</h3>
                <p>Successfully compared ${this.currentToken1.name} vs ${this.currentToken2.name}</p>
                <p><small>Including price charts, tokenomics, volume, and fee structures</small></p>
                <div class="current-period-info">
                    <small>Showing data for: <strong>${this.getPeriodLabel(this.currentPeriod)}</strong></small>
                </div>
                <div class="keyboard-shortcuts">
                    <small>Tip: Use Ctrl+1 to 5 for quick period changes | Ctrl+R to reset</small>
                </div>
            </div>
        `;
        resultsSection.classList.remove('hidden');
    }

    showError(message) {
        const resultsSection = document.getElementById('comparison-results');
        resultsSection.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <h3>Comparison Failed</h3>
                <p>${message}</p>
                <div class="error-actions">
                    <button class="retry-btn" onclick="window.cryptoCompare.retryLastComparison()">
                        <i class="fas fa-redo"></i>
                        Try Again
                    </button>
                    <button class="retry-btn" onclick="window.cryptoCompare.reset()" style="background: #6b7280;">
                        <i class="fas fa-times"></i>
                        Start Over
                    </button>
                </div>
            </div>
        `;
        resultsSection.classList.remove('hidden');
    }

    retryLastComparison() {
        if (this.currentToken1 && this.currentToken2) {
            this.handleCompare(this.currentToken1.name, this.currentToken2.name, this.currentPeriod);
        } else {
            this.showError('No previous comparison found');
        }
    }

    getPeriodLabel(period) {
        const periods = {
            7: '7 Days',
            30: '30 Days',
            90: '90 Days',
            365: '1 Year',
            1825: 'All Time'
        };
        return periods[period] || `${period} Days`;
    }

    setPeriod(days) {
        this.currentPeriod = days;
        
        // Update UI
        const periodSelect = document.getElementById('period-select');
        if (periodSelect) {
            periodSelect.value = days === 1825 ? 'max' : days.toString();
        }
        
        // Update buttons
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.days) === days) {
                btn.classList.add('active');
            }
        });
        
        // Update charts
        this.updateChartPeriod();
    }

    getCurrentComparison() {
        return {
            token1: this.currentToken1,
            token2: this.currentToken2,
            period: this.currentPeriod
        };
    }

    reset() {
        this.currentToken1 = null;
        this.currentToken2 = null;
        this.currentPeriod = 30;
        
        // Reset UI
        const resultsSection = document.getElementById('comparison-results');
        resultsSection.classList.add('hidden');
        
        // Reset form
        const form = document.getElementById('compare-form');
        if (form) form.reset();
        
        // Reset period selector
        const periodSelect = document.getElementById('period-select');
        if (periodSelect) {
            periodSelect.value = '30';
        }
        
        // Reset buttons
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.days) === 30) {
                btn.classList.add('active');
            }
        });
        
        // Clear charts
        if (this.compareChart.chart) {
            this.compareChart.destroy();
        }
        
        // Clear comparison sections
        const sectionsToClear = [
            'vertical-comparison-table',
            'comparison-table-body',
            'tokenomics-comparison',
            'volume-comparison-section',
            'fee-comparison-section' // Added fee comparison section
        ];
        
        sectionsToClear.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.innerHTML = '';
            }
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Method to update with real historical data when available
    async updateWithHistoricalData(token1Historical, token2Historical) {
        if (this.compareChart && this.currentToken1 && this.currentToken2) {
            this.compareChart.updateWithRealData(token1Historical, token2Historical);
        }
    }

    // Export comparison data
    exportComparisonData() {
        if (!this.currentToken1 || !this.currentToken2) {
            alert('No comparison data to export');
            return;
        }

        const data = {
            comparison: this.getCurrentComparison(),
            timestamp: new Date().toISOString(),
            dataSource: 'CryptoResearch Analytics',
            components: [
                'Price Charts',
                'Tokenomics',
                'Volume Analysis',
                'Fee Structures' // Added fee structures to export
            ]
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crypto-comparison-${this.currentToken1.symbol}-vs-${this.currentToken2.symbol}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cryptoCompare = new CryptoCompare();
    
    // Add global error handler
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
    });
    
    // Add unhandled rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
    });
});

// Export for use in other modules
export default CryptoCompare;