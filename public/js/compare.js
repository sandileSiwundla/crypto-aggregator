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
    }

    async handleCompare(token1, token2) {
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
            
            // Fetch both tokens in parallel
            const [token1Data, token2Data] = await Promise.all([
                this.fetchTokenData(token1),
                this.fetchTokenData(token2)
            ]);
            
            this.tokenCards.display(token1Data, token2Data);
            this.compareChart.render(token1Data, token2Data);
            this.compareTable.render(token1Data, token2Data);
            this.verticalCompareTable.render(token1Data, token2Data);
            this.tokenomicsComparison.render(token1Data, token2Data);
            
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

    showError(message) {
        const resultsSection = document.getElementById('comparison-results');
        resultsSection.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <p>${message}</p>
            </div>
        `;
        resultsSection.classList.remove('hidden');
    }
}

// Initialize the compare tool when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CryptoCompare();
});