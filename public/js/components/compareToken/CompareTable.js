"use client";


const table = document.getElementById('comparison-table');
const tableBody = table.querySelector('tbody');

// Add research table class
table.classList.add('research-table');

export class CompareTable {
    constructor() {
        this.tableBody = document.getElementById('comparison-table-body');
    }

    render(token1Data, token2Data) {
        const token1 = token1Data.coin;
        const token2 = token2Data.coin;
        
        const metrics = [
            {
                name: 'Price (USD)',
                token1: `$${token1.quote?.USD?.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
                token2: `$${token2.quote?.USD?.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
                value1: token1.quote?.USD?.price,
                value2: token2.quote?.USD?.price
            },
            {
                name: 'Market Cap',
                token1: `$${(token1.quote?.USD?.market_cap / 1e9).toFixed(2)}B`,
                token2: `$${(token2.quote?.USD?.market_cap / 1e9).toFixed(2)}B`,
                value1: token1.quote?.USD?.market_cap,
                value2: token2.quote?.USD?.market_cap
            },
            {
                name: 'Volume (24h)',
                token1: `$${(token1.quote?.USD?.volume_24h / 1e6).toFixed(2)}M`,
                token2: `$${(token2.quote?.USD?.volume_24h / 1e6).toFixed(2)}M`,
                value1: token1.quote?.USD?.volume_24h,
                value2: token2.quote?.USD?.volume_24h
            },
            {
                name: 'Price Change (24h)',
                token1: token1.quote?.USD?.percent_change_24h ? `${token1.quote.USD.percent_change_24h.toFixed(2)}%` : 'N/A',
                token2: token2.quote?.USD?.percent_change_24h ? `${token2.quote.USD.percent_change_24h.toFixed(2)}%` : 'N/A',
                value1: token1.quote?.USD?.percent_change_24h,
                value2: token2.quote?.USD?.percent_change_24h
            },
            {
                name: 'Circulating Supply',
                token1: token1.circulating_supply ? `${(token1.circulating_supply / 1e6).toFixed(2)}M` : 'N/A',
                token2: token2.circulating_supply ? `${(token2.circulating_supply / 1e6).toFixed(2)}M` : 'N/A',
                value1: token1.circulating_supply,
                value2: token2.circulating_supply
            },
            {
                name: 'Total Supply',
                token1: token1.total_supply ? `${(token1.total_supply / 1e6).toFixed(2)}M` : 'N/A',
                token2: token2.total_supply ? `${(token2.total_supply / 1e6).toFixed(2)}M` : 'N/A',
                value1: token1.total_supply,
                value2: token2.total_supply
            },
            {
                name: 'Max Supply',
                token1: token1.max_supply ? `${(token1.max_supply / 1e6).toFixed(2)}M` : 'Infinite',
                token2: token2.max_supply ? `${(token2.max_supply / 1e6).toFixed(2)}M` : 'Infinite',
                value1: token1.max_supply,
                value2: token2.max_supply
            },
            {
                name: 'Market Rank',
                token1: `#${token1.cmc_rank || 'N/A'}`,
                token2: `#${token2.cmc_rank || 'N/A'}`,
                value1: token1.cmc_rank,
                value2: token2.cmc_rank
            }
        ];
        
        this.tableBody.innerHTML = metrics.map(metric => {
            const advantage = this.calculateAdvantage(metric.value1, metric.value2, metric.name);
            
            return `
                <tr class="table-row-enter">
                    <td class="metric-name">${metric.name}</td>
                    <td>${metric.token1}</td>
                    <td>${metric.token2}</td>
                    <td>${this.calculateDifference(metric.value1, metric.value2, metric.name)}</td>
                    <td class="advantage-${advantage}">${this.getAdvantageText(advantage, metric.name)}</td>
                </tr>
            `;
        }).join('');

        // Update table headers
        document.getElementById('token1-header').textContent = token1.name;
        document.getElementById('token2-header').textContent = token2.name;
    }

    calculateAdvantage(value1, value2, metric) {
        if (value1 === undefined || value2 === undefined) return 'draw';
        
        if (metric.includes('Rank')) {
            return value1 < value2 ? 'win' : value1 > value2 ? 'lose' : 'draw';
        }
        
        return value1 > value2 ? 'win' : value1 < value2 ? 'lose' : 'draw';
    }

    calculateDifference(value1, value2, metric) {
        if (value1 === undefined || value2 === undefined) return 'N/A';
        
        if (metric.includes('Rank')) {
            const diff = value1 - value2;
            return diff === 0 ? 'Same' : (diff > 0 ? `+${diff}` : diff);
        }
        
        if (metric.includes('Price Change')) {
            const diff = value1 - value2;
            return diff === 0 ? 'Same' : (diff > 0 ? `+${diff.toFixed(2)}%` : `${diff.toFixed(2)}%`);
        }
        
        if (typeof value1 === 'number' && typeof value2 === 'number') {
            const diff = ((value1 - value2) / value2) * 100;
            return diff === 0 ? 'Same' : (diff > 0 ? `+${diff.toFixed(2)}%` : `${diff.toFixed(2)}%`);
        }
        
        return 'N/A';
    }

    getAdvantageText(advantage, metric) {
        if (advantage === 'draw') return 'Equal';
        
        const isRank = metric.includes('Rank');
        if (isRank) {
            return advantage === 'win' ? 'Lower (Better)' : 'Higher (Worse)';
        }
        
        return advantage === 'win' ? 'Better' : 'Worse';
    }

    clear() {
        this.tableBody.innerHTML = '';
    }
}