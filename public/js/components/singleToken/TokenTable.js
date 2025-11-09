const table = document.getElementById('crypto-table');
const tableBody = table.querySelector('tbody');

// Add research table class
table.classList.add('research-table');

// ABC Africa Blockchain Club branding
const abcBranding = {
    name: "ABC Africa Blockchain Club",
    logo: "/images/abc-logo.png", // Update with actual logo path
    website: "https://abc-africa-blockchain.org", // Update with actual website
    tagline: "Empowering Africa's Blockchain Future"
};

// Add download button and branding to table
function initializeTableWithBranding() {
    if (!table.querySelector('thead')) {
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Rank</th>
                <th>Cryptocurrency</th>
                <th>Symbol</th>
                <th>Price (USD)</th>
                <th>Price (ZAR)</th>
                <th>Market Cap</th>
                <th>24h Volume</th>
                <th>Circulating Supply</th>
            </tr>
        `;
        table.insertBefore(thead, tableBody);
    }

    // Add download button and branding to table container
    const tableContainer = table.closest('.table-container');
    if (tableContainer && !tableContainer.querySelector('.table-controls')) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'table-controls';
        controlsDiv.innerHTML = `
            <div class="branding-section">
                <div class="abc-branding">
                    ${abcBranding.logo ? `
                        <img src="${abcBranding.logo}" alt="${abcBranding.name}" class="abc-logo" 
                             onerror="this.style.display='none'">
                    ` : ''}
                    <div class="abc-info">
                        <span class="provided-by">Data provided by</span>
                        <strong class="abc-name">${abcBranding.name}</strong>
                        <span class="abc-tagline">${abcBranding.tagline}</span>
                    </div>
                </div>
                <button id="download-table" class="download-btn" title="Download Table Data">
                    <i class="fas fa-download"></i>
                    Download CSV
                </button>
            </div>
        `;
        tableContainer.insertBefore(controlsDiv, table);
    }

    // Add download event listener
    const downloadBtn = document.getElementById('download-table');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadTableAsCSV);
    }
}

export function addToTable(coin, usdToZar) {
    const priceUSD = coin.quote?.USD?.price || 0;
    const priceZAR = usdToZar && priceUSD ? priceUSD * usdToZar : 'N/A';
    const priceChange24h = coin.quote?.USD?.percent_change_24h || 0;
    const priceChangeClass = priceChange24h >= 0 ? 'price-up' : 'price-down';
    const changeIcon = priceChange24h >= 0 ? '↗' : '↘';

    const row = document.createElement('tr');
    row.className = 'table-row-enter';
    row.dataset.coinData = JSON.stringify({
        rank: coin.cmc_rank,
        name: coin.name,
        symbol: coin.symbol,
        priceUSD: priceUSD,
        priceZAR: priceZAR,
        priceChange24h: priceChange24h,
        marketCap: coin.quote?.USD?.market_cap || 0,
        volume24h: coin.quote?.USD?.volume_24h || 0,
        circulatingSupply: coin.circulating_supply || 0,
        platform: coin.platform?.name || 'Native Chain'
    });
    
    row.innerHTML = `
        <td class="rank-cell">
            <span style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 0.5rem 0.75rem;
                border-radius: 8px;
                font-size: 0.9rem;
                min-width: 50px;
                display: inline-block;
                text-align: center;
            ">#${coin.cmc_rank || 'N/A'}</span>
        </td>
        
        <td class="name-cell">
            ${coin.logo ? `
                <img src="${coin.logo}" alt="${coin.name}" 
                     onerror="this.style.display='none'">
            ` : ''}
            <div>
                <div style="font-weight: 700; color: #2d3748;">${coin.name}</div>
                <div style="font-size: 0.85rem; color: #718096; margin-top: 0.25rem;">
                    ${coin.platform?.name || 'Native Chain'}
                </div>
            </div>
        </td>
        
        <td class="symbol-cell">${coin.symbol}</td>
        
        <td class="price-cell">
            <div style="color: #2d3748; font-size: 1.1rem;">
                $${priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div class="price-change ${priceChangeClass}">
                <span>${changeIcon}</span>
                <span>${Math.abs(priceChange24h).toFixed(2)}%</span>
            </div>
        </td>
        
        <td class="currency-cell">
            ${priceZAR === 'N/A' ? 'N/A' : 
                `R ${priceZAR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
        </td>
        
        <td class="metric-cell">
            $${(coin.quote?.USD?.market_cap || 0).toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
            })}
        </td>
        
        <td class="metric-cell">
            $${(coin.quote?.USD?.volume_24h || 0).toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
            })}
        </td>
        
        <td class="supply-cell">
            ${(coin.circulating_supply || 0).toLocaleString('en-US')} 
            <span style="font-size: 0.8rem; color: #7c2d12; display: block; margin-top: 0.25rem;">
                ${coin.symbol}
            </span>
        </td>
    `;
    
    tableBody.appendChild(row);
}

export function clearTable() {
    tableBody.innerHTML = '';
}

// Download table as CSV
function downloadTableAsCSV() {
    const rows = tableBody.querySelectorAll('tr');
    if (rows.length === 0) {
        alert('No data available to download');
        return;
    }

    const csvContent = [];
    
    // Add ABC Africa Blockchain Club header
    csvContent.push(`"${abcBranding.name}"`);
    csvContent.push(`"${abcBranding.tagline}"`);
    csvContent.push(`"Generated on: ${new Date().toLocaleString()}"`);
    csvContent.push(''); // Empty line
    
    // Add headers
    const headers = [
        'Rank', 'Name', 'Symbol', 'Platform', 
        'Price (USD)', 'Price (ZAR)', '24h Change (%)',
        'Market Cap (USD)', '24h Volume (USD)', 'Circulating Supply'
    ];
    csvContent.push(headers.map(header => `"${header}"`).join(','));
    
    // Add data rows
    rows.forEach(row => {
        const coinData = JSON.parse(row.dataset.coinData);
        const csvRow = [
            coinData.rank,
            `"${coinData.name}"`,
            coinData.symbol,
            `"${coinData.platform}"`,
            coinData.priceUSD,
            coinData.priceZAR === 'N/A' ? 'N/A' : coinData.priceZAR,
            coinData.priceChange24h,
            coinData.marketCap,
            coinData.volume24h,
            coinData.circulatingSupply
        ];
        csvContent.push(csvRow.join(','));
    });
    
    // Add footer with ABC branding
    csvContent.push('');
    csvContent.push(`"Data provided by ${abcBranding.name}"`);
    csvContent.push(`"${abcBranding.website}"`);
    
    // Create and trigger download
    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `crypto-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Enhanced initialization
export function initializeTable() {
    initializeTableWithBranding();
}

// Add this CSS to your stylesheet
const tableStyles = `
<style>
.table-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: white;
}

.branding-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.abc-branding {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.abc-logo {
    height: 40px;
    width: auto;
    border-radius: 8px;
}

.abc-info {
    display: flex;
    flex-direction: column;
}

.provided-by {
    font-size: 0.8rem;
    opacity: 0.9;
}

.abc-name {
    font-size: 1.1rem;
    font-weight: 700;
}

.abc-tagline {
    font-size: 0.75rem;
    opacity: 0.8;
}

.download-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    backdrop-filter: blur(10px);
}

.download-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.research-table {
    position: relative;
}

/* Print styles for better printing experience */
@media print {
    .table-controls {
        background: #667eea !important;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
    }
    
    .download-btn {
        display: none;
    }
}

/* Responsive design */
@media (max-width: 768px) {
    .table-controls {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
    
    .abc-branding {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
    }
    
    .download-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
`;

// Inject styles into document
document.head.insertAdjacentHTML('beforeend', tableStyles);