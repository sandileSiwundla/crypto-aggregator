
import { CompareChart } from './components/compareToken/CompareChart.js';
import { CompareTable } from './components/compareToken/CompareTable.js';
import { VerticalCompareTable } from './components/compareToken/VerticalCompareTable.js';
import { TokenCards } from './components/compareToken/TokenCards.js';
import { TokenomicsComparison } from './components/compareToken/TokenomicsComparison.js';
import { TokenSearch } from './components/compareToken/TokenSearch.js';

class CryptoCompare {
    constructor() {
        this.compareChart = new CompareChart();
        this.compareTable = new CompareTable();
        this.verticalCompareTable = new VerticalCompareTable();
        this.tokenCards = new TokenCards();
        this.tokenomicsComparison = new TokenomicsComparison();
        this.tokenSearch = new TokenSearch(this.handleCompare.bind(this));
        
        this.currentToken1 = null;
        this.currentToken2 = null;
        this.currentPeriod = 30;

        this.initializePeriodSelector();
    }

    initializePeriodSelector() {
        const periodSelect = document.getElementById('period-select');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value === 'max' ? 1825 : parseInt(e.target.value); // 5 years for "max"
                this.updateChartPeriod();
            });
        }

        // Optional: Add button-based period selector
        this.createPeriodButtons();
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
            button.className = `period-btn ${period.days === 30 ? 'active' : ''}`;
            button.textContent = period.label;
            button.dataset.days = period.days;
            
            button.addEventListener('click', () => {
                // Update active state
                document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update period select dropdown
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
            
            this.currentToken1 = token1Data;
            this.currentToken2 = token2Data;
            this.currentPeriod = period;
            
            this.tokenCards.display(token1Data, token2Data);
            this.compareChart.render(token1Data, token2Data, period);
            this.compareTable.render(token1Data, token2Data);
            this.verticalCompareTable.render(token1Data, token2Data);
            this.tokenomicsComparison.render(token1Data, token2Data);
            
            this.showResults();
            
        } catch (error) {
            console.error('Error comparing tokens:', error);
            this.showError('Failed to compare tokens: ' + error.message);
        }
    }

    updateChartPeriod() {
        if (this.currentToken1 && this.currentToken2) {
            this.compareChart.updatePeriod(this.currentPeriod);
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

    showLoading() {
        const resultsSection = document.getElementById('comparison-results');
        resultsSection.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Comparing cryptocurrencies...</p>
            </div>
        `;
        resultsSection.classList.remove('hidden');
    }

    showResults() {
        const resultsSection = document.getElementById('comparison-results');
        resultsSection.innerHTML = `
            <div class="results-loaded">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
                <p>Comparison loaded successfully! Scroll down to view detailed analysis.</p>
                <div class="current-period-info">
                    <small>Showing data for: <strong>${this.getPeriodLabel(this.currentPeriod)}</strong></small>
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
                <p>${message}</p>
                <button class="retry-btn" onclick="location.reload()">
                    <i class="fas fa-redo"></i>
                    Try Again
                </button>
            </div>
        `;
        resultsSection.classList.remove('hidden');
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

    // Method to update with real historical data when available
    async updateWithHistoricalData(token1Historical, token2Historical) {
        if (this.compareChart && this.currentToken1 && this.currentToken2) {
            this.compareChart.updateWithRealData(token1Historical, token2Historical);
        }
    }

    // Method to change period programmatically
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
        
        // Update chart
        this.updateChartPeriod();
    }

    // Get current comparison data
    getCurrentComparison() {
        return {
            token1: this.currentToken1,
            token2: this.currentToken2,
            period: this.currentPeriod
        };
    }

    // Reset comparison
    reset() {
        this.currentToken1 = null;
        this.currentToken2 = null;
        this.currentPeriod = 30;
        
        // Reset UI
        const resultsSection = document.getElementById('comparison-results');
        resultsSection.classList.add('hidden');
        
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
        
        // Clear chart if exists
        if (this.compareChart.chart) {
            this.compareChart.destroy();
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cryptoCompare = new CryptoCompare();
    
    // Optional: Add keyboard shortcuts for period selection
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    window.cryptoCompare.setPeriod(7);
                    break;
                case '2':
                    e.preventDefault();
                    window.cryptoCompare.setPeriod(30);
                    break;
                case '3':
                    e.preventDefault();
                    window.cryptoCompare.setPeriod(90);
                    break;
                case '4':
                    e.preventDefault();
                    window.cryptoCompare.setPeriod(365);
                    break;
                case '5':
                    e.preventDefault();
                    window.cryptoCompare.setPeriod(1825);
                    break;
            }
        }
    });
});

export default CryptoCompare;