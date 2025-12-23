"use client";


const table = document.getElementById('vertical-comparison-table');
const tableBody = table.querySelector('tbody');

// Add research table class
table.classList.add('research-table');

export class VerticalCompareTable {
    constructor() {
        this.tableBody = document.getElementById('vertical-comparison-body');
    }

    render(token1Data, token2Data) {
        const token1 = token1Data.coin;
        const token2 = token2Data.coin;
        const usdToZar = token1Data.usdToZar || token2Data.usdToZar;

        const metrics = [
            {
                name: 'Rank',
                token1: token1.cmc_rank || 'N/A',
                token2: token2.cmc_rank || 'N/A',
                type: 'rank'
            },
            {
                name: 'Name',
                token1: token1.name,
                token2: token2.name,
                type: 'name'
            },
            {
                name: 'Symbol',
                token1: token1.symbol,
                token2: token2.symbol,
                type: 'symbol'
            },
            {
                name: 'Price (USD)',
                token1: token1.quote?.USD?.price || 0,
                token2: token2.quote?.USD?.price || 0,
                type: 'price'
            },
            {
                name: 'Price (ZAR)',
                token1: token1.quote?.USD?.price ? token1.quote.USD.price * usdToZar : 'N/A',
                token2: token2.quote?.USD?.price ? token2.quote.USD.price * usdToZar : 'N/A',
                type: 'currency'
            },
            {
                name: 'Market Cap',
                token1: token1.quote?.USD?.market_cap || 0,
                token2: token2.quote?.USD?.market_cap || 0,
                type: 'metric'
            },
            {
                name: '24h Volume',
                token1: token1.quote?.USD?.volume_24h || 0,
                token2: token2.quote?.USD?.volume_24h || 0,
                type: 'metric'
            },
            {
                name: 'Circulating Supply',
                token1: token1.circulating_supply || 0,
                token2: token2.circulating_supply || 0,
                type: 'supply'
            },
            {
                name: 'Total Supply',
                token1: token1.total_supply || 'N/A',
                token2: token2.total_supply || 'N/A',
                type: 'supply'
            },
            {
                name: 'Max Supply',
                token1: token1.max_supply || 'Infinite',
                token2: token2.max_supply || 'Infinite',
                type: 'supply'
            },
            {
                name: '24h Change',
                token1: token1.quote?.USD?.percent_change_24h || 0,
                token2: token2.quote?.USD?.percent_change_24h || 0,
                type: 'change'
            },
            {
                name: '7d Change',
                token1: token1.quote?.USD?.percent_change_7d || 0,
                token2: token2.quote?.USD?.percent_change_7d || 0,
                type: 'change'
            },
            {
                name: '30d Change',
                token1: token1.quote?.USD?.percent_change_30d || 0,
                token2: token2.quote?.USD?.percent_change_30d || 0,
                type: 'change'
            }
        ];

        this.tableBody.innerHTML = metrics.map(metric => {
            const token1Value = this.formatValue(metric.token1, metric.type, metric.name);
            const token2Value = this.formatValue(metric.token2, metric.type, metric.name);
            
            // Determine winner for this metric (for styling)
            const advantage = this.calculateAdvantage(metric.token1, metric.token2, metric.name);
            
            return `
                <tr class="table-row-enter">
                    <td class="metric-name-cell">
                        <span style="
                            font-weight: 600;
                            color: #2d3748;
                            padding: 0.5rem 0;
                            display: block;
                        ">${metric.name}</span>
                    </td>
                    <td class="token-value-cell ${advantage === 'win' ? 'advantage-win' : ''}">
                        ${token1Value}
                    </td>
                    <td class="token-value-cell ${advantage === 'lose' ? 'advantage-lose' : ''}">
                        ${token2Value}
                    </td>
                </tr>
            `;
        }).join('');

        // Update table headers with token names and logos
        document.getElementById('vertical-token1-header').innerHTML = this.createHeaderContent(token1);
        document.getElementById('vertical-token2-header').innerHTML = this.createHeaderContent(token2);
    }

    formatValue(value, type, metricName) {
        if (value === 'N/A' || value === 'Infinite') {
            return `<span style="color: #a0aec0; font-style: italic;">${value}</span>`;
        }

        switch (type) {
            case 'rank':
                return `
                    <span style="
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        padding: 0.5rem 0.75rem;
                        border-radius: 8px;
                        font-size: 0.9rem;
                        min-width: 50px;
                        display: inline-block;
                        text-align: center;
                    ">#${value}</span>
                `;

            case 'name':
                return `
                    <div style="font-weight: 700; color: #2d3748;">${value}</div>
                `;

            case 'symbol':
                return `
                    <code style="background: #f7fafc; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600;">${value}</code>
                `;

            case 'price':
                return `
                    <div style="color: #2d3748; font-size: 1.1rem; font-weight: 600;">
                        $${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </div>
                `;

            case 'currency':
                if (value === 'N/A') return value;
                return `
                    <div style="color: #2d3748; font-size: 1rem; font-weight: 600;">
                        R ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                `;

            case 'metric':
                return `
                    <div style="color: #2d3748; font-weight: 600;">
                        $${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                `;

            case 'supply':
                if (metricName === 'Circulating Supply') {
                    return `
                        <div style="color: #2d3748; font-weight: 600;">
                            ${Number(value).toLocaleString('en-US')}
                        </div>
                    `;
                }
                return `
                    <div style="color: #2d3748; font-weight: 600;">
                        ${value === 'Infinite' ? 'Infinite' : Number(value).toLocaleString('en-US')}
                    </div>
                `;

            case 'change':
                const changeClass = Number(value) >= 0 ? 'price-up' : 'price-down';
                const changeIcon = Number(value) >= 0 ? '↗' : '↘';
                return `
                    <div class="price-change ${changeClass}" style="font-weight: 600;">
                        <span>${changeIcon}</span>
                        <span>${Math.abs(Number(value)).toFixed(2)}%</span>
                    </div>
                `;

            default:
                return value;
        }
    }

    createHeaderContent(token) {
        return `
            <div style="display: flex; align-items: center; gap: 0.75rem; justify-content: center;">
                ${token.logo ? `
                    <img src="${token.logo}" alt="${token.name}" 
                         style="width: 32px; height: 32px; border-radius: 50%;"
                         onerror="this.style.display='none'">
                ` : ''}
                <div style="text-align: center;">
                    <div style="font-weight: 700; font-size: 1.1rem;">${token.name}</div>
                    <div style="font-size: 0.85rem; color: #e2e8f0;">${token.symbol}</div>
                </div>
            </div>
        `;
    }

    calculateAdvantage(value1, value2, metricName) {
        if (value1 === 'N/A' || value2 === 'N/A' || value1 === 'Infinite' || value2 === 'Infinite') {
            return 'draw';
        }

        // For rank and change percentages, lower is better
        if (metricName.includes('Rank') || metricName.includes('Change')) {
            const num1 = Number(value1);
            const num2 = Number(value2);
            
            if (isNaN(num1) || isNaN(num2)) return 'draw';
            
            // For rank/change, lower values are better
            return num1 < num2 ? 'win' : num1 > num2 ? 'lose' : 'draw';
        }

        // For all other metrics, higher is better
        const num1 = Number(value1);
        const num2 = Number(value2);
        
        if (isNaN(num1) || isNaN(num2)) return 'draw';
        
        return num1 > num2 ? 'win' : num1 < num2 ? 'lose' : 'draw';
    }

    clear() {
        this.tableBody.innerHTML = '';
        document.getElementById('vertical-token1-header').innerHTML = 'Token 1';
        document.getElementById('vertical-token2-header').innerHTML = 'Token 2';
    }
}