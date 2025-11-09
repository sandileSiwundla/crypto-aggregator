// ABC Africa Blockchain Club branding
const abcBranding = {
    name: "ABC Africa Blockchain Club",
    logo: "/ABC.png",
    website: "https://abc-africa-blockchain.org",
    tagline: "Empowering Africa's Blockchain Future"
};

export class TokenomicsComparison {
    constructor() {
        this.container = document.getElementById('tokenomics-comparison');
        this.currentToken1 = null;
        this.currentToken2 = null;
        this.isGenerating = false;
    }

    render(token1Data, token2Data) {
        this.currentToken1 = token1Data.coin;
        this.currentToken2 = token2Data.coin;
        
        this.container.innerHTML = `
            <!-- Market Metrics Section -->
            <div class="comparison-section" id="market-metrics-section">
                <div class="section-content">
                    <div class="section-token-header">
                        <div class="token-comparison-title">
                            <div class="token-pair">
                                <div class="token-info-compact">
                                    ${this.currentToken1.logo ? `
                                        <img src="${this.currentToken1.logo}" alt="${this.currentToken1.name}" 
                                             class="token-icon-small" onerror="this.style.display='none'">
                                    ` : ''}
                                    <span class="token-name-compact">${this.currentToken1.symbol}</span>
                                </div>
                                <span class="vs-text">vs</span>
                                <div class="token-info-compact">
                                    ${this.currentToken2.logo ? `
                                        <img src="${this.currentToken2.logo}" alt="${this.currentToken2.name}" 
                                             class="token-icon-small" onerror="this.style.display='none'">
                                    ` : ''}
                                    <span class="token-name-compact">${this.currentToken2.symbol}</span>
                                </div>
                            </div>
                            <h4 class="section-title">Market Metrics Comparison</h4>
                        </div>
                    </div>
                    <div class="metrics-table">
                        <div class="table-row header-row">
                            <div class="table-cell">${this.currentToken1.symbol}</div>
                            <div class="table-cell">Metric</div>
                            <div class="table-cell">${this.currentToken2.symbol}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value">$${this.formatNumber(this.currentToken1.quote?.USD?.market_cap || 0)}</div>
                            <div class="table-cell metric-cell">Market Cap</div>
                            <div class="table-cell value-cell token2-value">$${this.formatNumber(this.currentToken2.quote?.USD?.market_cap || 0)}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value">$${this.formatNumber(this.currentToken1.quote?.USD?.fully_diluted_market_cap || 0)}</div>
                            <div class="table-cell metric-cell">Fully Diluted MCap</div>
                            <div class="table-cell value-cell token2-value">$${this.formatNumber(this.currentToken2.quote?.USD?.fully_diluted_market_cap || 0)}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value">#${this.currentToken1.cmc_rank || 'N/A'}</div>
                            <div class="table-cell metric-cell">Market Cap Rank</div>
                            <div class="table-cell value-cell token2-value">#${this.currentToken2.cmc_rank || 'N/A'}</div>
                        </div>
                    </div>
                    <div class="abc-watermark">
                        <div class="abc-brand">
                            <span>Powered by</span>
                            <div class="abc-logo-mini">
                                <img src="${abcBranding.logo}" alt="ABC" onerror="this.style.display='none'">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="download-section">
                    <button class="download-btn download-market" title="Download Market Metrics">
                        <i class="fas fa-camera"></i>
                        Download Market Metrics
                    </button>
                </div>
            </div>

            <!-- Supply Metrics Section -->
            <div class="comparison-section" id="supply-metrics-section">
                <div class="section-content">
                    <div class="section-token-header">
                        <div class="token-comparison-title">
                            <div class="token-pair">
                                <div class="token-info-compact">
                                    ${this.currentToken1.logo ? `
                                        <img src="${this.currentToken1.logo}" alt="${this.currentToken1.name}" 
                                             class="token-icon-small" onerror="this.style.display='none'">
                                    ` : ''}
                                    <span class="token-name-compact">${this.currentToken1.symbol}</span>
                                </div>
                                <span class="vs-text">vs</span>
                                <div class="token-info-compact">
                                    ${this.currentToken2.logo ? `
                                        <img src="${this.currentToken2.logo}" alt="${this.currentToken2.name}" 
                                             class="token-icon-small" onerror="this.style.display='none'">
                                    ` : ''}
                                    <span class="token-name-compact">${this.currentToken2.symbol}</span>
                                </div>
                            </div>
                            <h4 class="section-title">Supply Metrics Comparison</h4>
                        </div>
                    </div>
                    <div class="metrics-table">
                        <div class="table-row header-row">
                            <div class="table-cell">${this.currentToken1.symbol}</div>
                            <div class="table-cell">Metric</div>
                            <div class="table-cell">${this.currentToken2.symbol}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value">${this.currentToken1.circulating_supply ? this.formatSupply(this.currentToken1.circulating_supply) : 'N/A'}</div>
                            <div class="table-cell metric-cell">Circulating Supply</div>
                            <div class="table-cell value-cell token2-value">${this.currentToken2.circulating_supply ? this.formatSupply(this.currentToken2.circulating_supply) : 'N/A'}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value">${this.currentToken1.total_supply ? this.formatSupply(this.currentToken1.total_supply) : 'N/A'}</div>
                            <div class="table-cell metric-cell">Total Supply</div>
                            <div class="table-cell value-cell token2-value">${this.currentToken2.total_supply ? this.formatSupply(this.currentToken2.total_supply) : 'N/A'}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value">${this.currentToken1.max_supply ? this.formatSupply(this.currentToken1.max_supply) : 'Infinite'}</div>
                            <div class="table-cell metric-cell">Max Supply</div>
                            <div class="table-cell value-cell token2-value">${this.currentToken2.max_supply ? this.formatSupply(this.currentToken2.max_supply) : 'Infinite'}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value">${this.currentToken1.max_supply ? ((this.currentToken1.circulating_supply / this.currentToken1.max_supply) * 100).toFixed(2) + '%' : 'N/A'}</div>
                            <div class="table-cell metric-cell">Circulating %</div>
                            <div class="table-cell value-cell token2-value">${this.currentToken2.max_supply ? ((this.currentToken2.circulating_supply / this.currentToken2.max_supply) * 100).toFixed(2) + '%' : 'N/A'}</div>
                        </div>
                    </div>
                    <div class="abc-watermark">
                        <div class="abc-brand">
                            <span>Powered by</span>
                            <div class="abc-logo-mini">
                                <img src="${abcBranding.logo}" alt="ABC" onerror="this.style.display='none'">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="download-section">
                    <button class="download-btn download-supply" title="Download Supply Metrics">
                        <i class="fas fa-camera"></i>
                        Download Supply Metrics
                    </button>
                </div>
            </div>

            <!-- Performance & Utility Section -->
<div class="comparison-section" id="performance-section">
    <div class="section-content">
        <div class="section-token-header">
            <div class="token-comparison-title">
                <div class="token-pair">
                    <div class="token-info-compact">
                        ${this.currentToken1.logo ? `
                            <img src="${this.currentToken1.logo}" alt="${this.currentToken1.name}" 
                                 class="token-icon-small" onerror="this.style.display='none'">
                        ` : ''}
                        <span class="token-name-compact">${this.currentToken1.symbol}</span>
                    </div>
                    <span class="vs-text">vs</span>
                    <div class="token-info-compact">
                        ${this.currentToken2.logo ? `
                            <img src="${this.currentToken2.logo}" alt="${this.currentToken2.name}" 
                                 class="token-icon-small" onerror="this.style.display='none'">
                        ` : ''}
                        <span class="token-name-compact">${this.currentToken2.symbol}</span>
                    </div>
                </div>
                <h4 class="section-title">Performance & Utility Comparison</h4>
            </div>
        </div>
        <div class="metrics-table">
            <div class="table-row header-row">
                <div class="table-cell">${this.currentToken1.symbol}</div>
                <div class="table-cell">Metric</div>
                <div class="table-cell">${this.currentToken2.symbol}</div>
            </div>
            <div class="table-row">
                <div class="table-cell value-cell token1-value ${this.getChangeClass(this.currentToken1.quote?.USD?.percent_change_30d)}">
                    ${this.formatChange(this.currentToken1.quote?.USD?.percent_change_30d)}
                </div>
                <div class="table-cell metric-cell">30-Day Change</div>
                <div class="table-cell value-cell token2-value ${this.getChangeClass(this.currentToken2.quote?.USD?.percent_change_30d)}">
                    ${this.formatChange(this.currentToken2.quote?.USD?.percent_change_30d)}
                </div>
            </div>
            <div class="table-row">
                <div class="table-cell value-cell token1-value">${this.currentToken1.platform?.name || 'Native'}</div>
                <div class="table-cell metric-cell">Platform</div>
                <div class="table-cell value-cell token2-value">${this.currentToken2.platform?.name || 'Native'}</div>
            </div>
            <div class="table-row">
                <div class="table-cell value-cell token1-value ${this.getChangeClass(this.currentToken1.quote?.USD?.percent_change_7d)}">
                    ${this.formatChange(this.currentToken1.quote?.USD?.percent_change_7d)}
                </div>
                <div class="table-cell metric-cell">7-Day Change</div>
                <div class="table-cell value-cell token2-value ${this.getChangeClass(this.currentToken2.quote?.USD?.percent_change_7d)}">
                    ${this.formatChange(this.currentToken2.quote?.USD?.percent_change_7d)}
                </div>
            </div>
            <div class="table-row">
                <div class="table-cell value-cell token1-value ${this.getChangeClass(this.currentToken1.quote?.USD?.percent_change_24h)}">
                    ${this.formatChange(this.currentToken1.quote?.USD?.percent_change_24h)}
                </div>
                <div class="table-cell metric-cell">24-Hour Change</div>
                <div class="table-cell value-cell token2-value ${this.getChangeClass(this.currentToken2.quote?.USD?.percent_change_24h)}">
                    ${this.formatChange(this.currentToken2.quote?.USD?.percent_change_24h)}
                </div>
            </div>
        </div>
        <div class="abc-watermark">
            <div class="abc-brand">
                <span>Powered by</span>
                <div class="abc-logo-mini">
                    <img src="${abcBranding.logo}" alt="ABC" onerror="this.style.display='none'">
                </div>
            </div>
        </div>
    </div>
    <div class="download-section">
        <button class="download-btn download-performance" title="Download Performance Metrics">
            <i class="fas fa-camera"></i>
            Download Performance Metrics
        </button>
    </div>
</div>
        `;

        // Add download event listeners for each section
        const marketBtn = this.container.querySelector('.download-market');
        const supplyBtn = this.container.querySelector('.download-supply');
        const performanceBtn = this.container.querySelector('.download-performance');

        if (marketBtn) {
            marketBtn.addEventListener('click', () => this.downloadSectionAsJPEG('market-metrics-section', 'market-metrics'));
        }
        if (supplyBtn) {
            supplyBtn.addEventListener('click', () => this.downloadSectionAsJPEG('supply-metrics-section', 'supply-metrics'));
        }
        if (performanceBtn) {
            performanceBtn.addEventListener('click', () => this.downloadSectionAsJPEG('performance-section', 'performance-metrics'));
        }
    }

    formatSupply(supply) {
        if (supply >= 1e9) {
            return (supply / 1e9).toFixed(2) + 'B';
        } else if (supply >= 1e6) {
            return (supply / 1e6).toFixed(2) + 'M';
        } else if (supply >= 1e3) {
            return (supply / 1e3).toFixed(2) + 'K';
        }
        return supply.toLocaleString();
    }

    formatNumber(num) {
        if (num === 0) return '$0';
        if (num >= 1e9) {
            return '$' + (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return '$' + (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return '$' + (num / 1e3).toFixed(2) + 'K';
        }
        return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    }

    formatChange(change) {
        if (change === null || change === undefined) return 'N/A';
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}%`;
    }

    getChangeClass(change) {
        if (change === null || change === undefined) return '';
        return change >= 0 ? 'positive' : 'negative';
    }

    calculateLiquidityScore(token) {
        const marketCap = token.quote?.USD?.market_cap || 0;
        const volume = token.quote?.USD?.volume_24h || 0;
        
        if (marketCap === 0) return '0.0';
        
        let score = 0;
        
        if (marketCap >= 1e9) score += 6;
        else if (marketCap >= 1e8) score += 4;
        else if (marketCap >= 1e7) score += 2;
        else score += 1;
        
        const volumeRatio = volume / marketCap;
        if (volumeRatio >= 0.1) score += 4;
        else if (volumeRatio >= 0.05) score += 3;
        else if (volumeRatio >= 0.01) score += 2;
        else score += 1;
        
        return score.toFixed(1);
    }

    async downloadSectionAsJPEG(sectionId, sectionName) {
        if (this.isGenerating) return;
        
        try {
            this.isGenerating = true;
            
            const downloadBtn = document.querySelector(`.download-${sectionName.split('-')[0]}`);
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            downloadBtn.disabled = true;

            const section = document.getElementById(sectionId);
            const sectionContent = section.querySelector('.section-content');
            
            if (!sectionContent) {
                throw new Error('Section content not found');
            }

            const canvas = await html2canvas(sectionContent, {
                backgroundColor: '#1a1b23', // Dark mode background
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                width: sectionContent.scrollWidth,
                height: sectionContent.scrollHeight,
                onclone: function(clonedDoc) {
                    // Ensure dark mode styles are applied in the cloned document
                    const clonedSection = clonedDoc.getElementById(sectionId);
                    if (clonedSection) {
                        clonedSection.style.backgroundColor = '#1a1b23';
                        clonedSection.style.color = '#ffffff';
                    }
                }
            });

            // Create rounded canvas
            const roundedCanvas = this.createRoundedCanvas(canvas, 16); // 16px border radius

            const jpegURL = roundedCanvas.toDataURL('image/jpeg', 0.95);
            const link = document.createElement('a');
            link.download = `${this.currentToken1.symbol}-vs-${this.currentToken2.symbol}-${sectionName}.jpg`;
            link.href = jpegURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Error generating JPEG:', error);
            alert('Failed to generate image.');
        } finally {
            const downloadBtn = document.querySelector(`.download-${sectionName.split('-')[0]}`);
            if (downloadBtn) {
                downloadBtn.innerHTML = '<i class="fas fa-camera"></i> Download ' + sectionName.split('-')[0].charAt(0).toUpperCase() + sectionName.split('-')[0].slice(1) + ' Metrics';
                downloadBtn.disabled = false;
            }
            this.isGenerating = false;
        }
    }

    createRoundedCanvas(sourceCanvas, radius) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = sourceCanvas.width;
        canvas.height = sourceCanvas.height;
        
        // Create rounded rectangle path
        ctx.beginPath();
        this.roundRect(ctx, 0, 0, canvas.width, canvas.height, radius);
        ctx.closePath();
        ctx.clip();
        
        // Draw the original canvas onto the rounded one
        ctx.drawImage(sourceCanvas, 0, 0);
        
        return canvas;
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    hide() {
        this.container.innerHTML = '';
        this.currentToken1 = null;
        this.currentToken2 = null;
    }
}

// Updated CSS styles with dark mode and rounded edges
const tokenomicsStyles = `
<style>
:root {
    --bg-primary: #1a1b23;
    --bg-secondary: #2d2e3a;
    --bg-tertiary: #3a3b4a;
    --text-primary: #ffffff;
    --text-secondary: #a0a0b0;
    --text-muted: #6b7280;
    --border-color: #3a3b4a;
    --accent-blue: #3b82f6;
    --accent-purple: #8b5cf6;
    --positive: #10b981;
    --negative: #ef4444;
}

.comparison-section {
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.comparison-section:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.4);
}

.section-content {
    position: relative;
    padding-bottom: 2.5rem;
    border-radius: 12px;
    overflow: hidden;
}

.section-token-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.token-comparison-title {
    text-align: center;
}

.token-pair {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.token-info-compact {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.token-icon-small {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 2px solid var(--border-color);
}

.token-name-compact {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1.1rem;
}

.vs-text {
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 0.9rem;
    background: var(--bg-tertiary);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
}

.section-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

/* Table Styles */
.metrics-table {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.table-row {
    display: flex;
    border-bottom: 1px solid var(--border-color);
}

.table-row:last-child {
    border-bottom: none;
}

.header-row {
    background: var(--bg-tertiary);
    font-weight: 600;
    color: var(--text-primary);
}

.table-cell {
    flex: 1;
    padding: 1.25rem 1rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
}

.header-row .table-cell {
    border-right: 1px solid var(--border-color);
}

.header-row .table-cell:last-child {
    border-right: none;
}

.value-cell {
    font-weight: 600;
    padding: 1rem;
}

.token1-value {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
    border-right: 1px solid var(--border-color);
}

.token2-value {
    background: rgba(139, 92, 246, 0.15);
    color: #a78bfa;
    border-left: 1px solid var(--border-color);
}

.metric-cell {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    font-weight: 500;
    border-left: 1px solid var(--border-color);
    border-right: 1px solid var(--border-color);
}

.positive {
    background: rgba(16, 185, 129, 0.2) !important;
    color: #34d399 !important;
}

.negative {
    background: rgba(239, 68, 68, 0.2) !important;
    color: #f87171 !important;
}

/* ABC Watermark */
.abc-watermark {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.abc-watermark:hover {
    opacity: 1;
}

.abc-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.95rem;
    color: var(--text-secondary);
}

.abc-logo-mini img {
    height: 36px;
    width: auto;
    border-radius: 6px;
    opacity: 0.8;
    margin-top: 0; 
}

/* Download Button */
.download-section {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
}

.download-btn {
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
    color: white;
    border: none;
    padding: 0.875rem 1.75rem;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.download-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.download-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

/* Responsive Design */
@media (max-width: 768px) {
    .comparison-section {
        padding: 1rem;
        border-radius: 12px;
    }
    
    .token-pair {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .table-row {
        flex-direction: column;
    }
    
    .table-cell {
        border: none !important;
        border-bottom: 1px solid var(--border-color) !important;
        justify-content: space-between;
        text-align: left;
        padding: 1rem;
    }
    
    .table-cell::before {
        content: attr(data-label);
        font-weight: 600;
        color: var(--text-secondary);
    }
    
    .header-row {
        display: none;
    }
    
    .abc-watermark {
        position: relative;
        bottom: auto;
        right: auto;
        margin-top: 1rem;
        display: flex;
        justify-content: center;
    }
    
    .download-btn {
        width: 100%;
        justify-content: center;
    }
}

/* Print Styles */
@media print {
    .download-section {
        display: none;
    }
}

/* Dark mode enhancements */
body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

/* Smooth transitions for theme changes */
.comparison-section,
.metrics-table,
.table-cell,
.download-btn {
    transition: all 0.3s ease;
}
</style>
`;

// Inject styles into document
document.head.insertAdjacentHTML('beforeend', tokenomicsStyles);