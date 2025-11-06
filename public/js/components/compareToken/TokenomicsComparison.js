export class TokenomicsComparison {
    constructor() {
        this.container = document.getElementById('tokenomics-comparison');
    }

    render(token1Data, token2Data) {
        const token1 = token1Data.coin;
        const token2 = token2Data.coin;
        
        this.container.innerHTML = `
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

    hide() {
        this.container.innerHTML = '';
    }
}