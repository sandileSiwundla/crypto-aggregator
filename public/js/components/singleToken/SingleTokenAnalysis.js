"use client";

const abcBranding = {
    name: "ABC Africa Blockchain Club",
    logo: "/ABC.png",
    website: "https://abc-africa-blockchain.org",
    tagline: "Empowering Africa's Blockchain Future"
};

export class SingleTokenAnalysis {
    constructor() {
        this.container = document.getElementById('token-analysis');
        this.currentToken = null;
        this.isGenerating = false;
    }

    render(tokenData) {
        this.currentToken = tokenData.coin;
        
        this.container.innerHTML = `
            <!-- Token Overview Section -->
            <div class="token-section" id="token-overview-section">
                <div class="section-content">
                    <div class="section-token-header">
                        <div class="token-title-container">
                            <div class="token-logo-title">
                                ${this.currentToken.logo ? `
                                    <img src="${this.currentToken.logo}" alt="${this.currentToken.name}" 
                                         class="token-icon-large" onerror="this.style.display='none'">
                                ` : '<div class="token-placeholder"></div>'}
                                <div class="token-name-symbol">
                                    <h4 class="section-title">${this.currentToken.name}</h4>
                                    <div class="token-symbol">${this.currentToken.symbol}</div>
                                </div>
                            </div>
                            <div class="token-price-tag">
                                <div class="current-price">$${this.formatNumber(this.currentToken.quote?.USD?.price || 0)}</div>
                                <div class="price-change ${this.getChangeClass(this.currentToken.quote?.USD?.percent_change_24h)}">
                                    ${this.formatChange(this.currentToken.quote?.USD?.percent_change_24h)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="metrics-table">
                        <div class="table-row header-row">
                            <div class="table-cell">Metric</div>
                            <div class="table-cell">Value</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">Market Cap Rank</div>
                            <div class="table-cell value-cell">#${this.currentToken.cmc_rank || 'N/A'}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">Market Cap</div>
                            <div class="table-cell value-cell">${this.formatNumber(this.currentToken.quote?.USD?.market_cap || 0)}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">Fully Diluted MCap</div>
                            <div class="table-cell value-cell">${this.formatNumber(this.currentToken.quote?.USD?.fully_diluted_market_cap || 0)}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">24h Volume</div>
                            <div class="table-cell value-cell">${this.formatNumber(this.currentToken.quote?.USD?.volume_24h || 0)}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">Volume/MCap Ratio</div>
                            <div class="table-cell value-cell">${this.calculateVolumeRatio(this.currentToken)}%</div>
                        </div>
                    </div>
                    <div class="abc-watermark">
                        <div class="abc-brand">
                            <span>Powered by:</span>
                            <div class="abc-logo-mini">
                                <img src="${abcBranding.logo}" alt="ABC" onerror="this.style.display='none'">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="download-section">
                    <button class="download-btn download-overview" title="Download Token Overview">
                        <i class="fas fa-camera"></i>
                        Download Overview
                    </button>
                </div>
            </div>

            <!-- Supply Metrics Section -->
            <div class="token-section" id="supply-section">
                <div class="section-content">
                    <div class="section-token-header">
                        <div class="token-title-container">
                            <div class="token-logo-title">
                                ${this.currentToken.logo ? `
                                    <img src="${this.currentToken.logo}" alt="${this.currentToken.name}" 
                                         class="token-icon-medium" onerror="this.style.display='none'">
                                ` : '<div class="token-placeholder-medium"></div>'}
                                <h4 class="section-title">Supply Metrics</h4>
                            </div>
                        </div>
                    </div>
                    <div class="metrics-table">
                        <div class="table-row header-row">
                            <div class="table-cell">Supply Metric</div>
                            <div class="table-cell">Value</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">Circulating Supply</div>
                            <div class="table-cell value-cell">${this.currentToken.circulating_supply ? this.formatSupply(this.currentToken.circulating_supply) : 'N/A'}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">Total Supply</div>
                            <div class="table-cell value-cell">${this.currentToken.total_supply ? this.formatSupply(this.currentToken.total_supply) : 'N/A'}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">Max Supply</div>
                            <div class="table-cell value-cell">${this.currentToken.max_supply ? this.formatSupply(this.currentToken.max_supply) : 'Infinite'}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">Circulating %</div>
                            <div class="table-cell value-cell">${this.currentToken.max_supply ? ((this.currentToken.circulating_supply / this.currentToken.max_supply) * 100).toFixed(2) + '%' : 'N/A'}</div>
                        </div>
                    </div>
                    <div class="abc-watermark">
                        <div class="abc-brand">
                            <span>Powered by:</span>
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

            <!-- Performance Metrics Section -->
            <div class="token-section" id="performance-section">
                <div class="section-content">
                    <div class="section-token-header">
                        <div class="token-title-container">
                            <div class="token-logo-title">
                                ${this.currentToken.logo ? `
                                    <img src="${this.currentToken.logo}" alt="${this.currentToken.name}" 
                                         class="token-icon-medium" onerror="this.style.display='none'">
                                ` : '<div class="token-placeholder-medium"></div>'}
                                <h4 class="section-title">Performance Metrics</h4>
                            </div>
                        </div>
                    </div>
                    <div class="metrics-table">
                        <div class="table-row header-row">
                            <div class="table-cell">Time Period</div>
                            <div class="table-cell">Price Change</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">1 Hour</div>
                            <div class="table-cell value-cell ${this.getChangeClass(this.currentToken.quote?.USD?.percent_change_1h)}">
                                ${this.formatChange(this.currentToken.quote?.USD?.percent_change_1h)}
                            </div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">24 Hours</div>
                            <div class="table-cell value-cell ${this.getChangeClass(this.currentToken.quote?.USD?.percent_change_24h)}">
                                ${this.formatChange(this.currentToken.quote?.USD?.percent_change_24h)}
                            </div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">7 Days</div>
                            <div class="table-cell value-cell ${this.getChangeClass(this.currentToken.quote?.USD?.percent_change_7d)}">
                                ${this.formatChange(this.currentToken.quote?.USD?.percent_change_7d)}
                            </div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">30 Days</div>
                            <div class="table-cell value-cell ${this.getChangeClass(this.currentToken.quote?.USD?.percent_change_30d)}">
                                ${this.formatChange(this.currentToken.quote?.USD?.percent_change_30d)}
                            </div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell metric-cell">Platform</div>
                            <div class="table-cell value-cell">${this.currentToken.platform?.name || 'Native'}</div>
                        </div>
                    </div>
                    <div class="abc-watermark">
                        <div class="abc-brand">
                            <span>Powered by:</span>
                            <div class="abc-logo-mini">
                                <img src="${abcBranding.logo}" alt="ABC" onerror="this.style.display='none'">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="download-section">
                    <button class="download-btn download-performance" title="Download Performance Metrics">
                        <i class="fas fa-camera"></i>
                        Download Performance
                    </button>
                </div>
            </div>
        `;

        // Add download event listeners
        const overviewBtn = this.container.querySelector('.download-overview');
        const supplyBtn = this.container.querySelector('.download-supply');
        const performanceBtn = this.container.querySelector('.download-performance');

        if (overviewBtn) {
            overviewBtn.addEventListener('click', () => this.downloadSectionAsJPEG('token-overview-section', 'token-overview'));
        }
        if (supplyBtn) {
            supplyBtn.addEventListener('click', () => this.downloadSectionAsJPEG('supply-section', 'supply-metrics'));
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
        if (num === 0) return '0';
        if (num >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        }
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
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

    calculateVolumeRatio(token) {
        const marketCap = token.quote?.USD?.market_cap || 0;
        const volume = token.quote?.USD?.volume_24h || 0;
        
        if (marketCap === 0) return '0.00';
        
        const ratio = (volume / marketCap) * 100;
        return ratio.toFixed(2);
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
                backgroundColor: '#1a1b23',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                width: sectionContent.scrollWidth,
                height: sectionContent.scrollHeight,
                onclone: function(clonedDoc) {
                    const clonedSection = clonedDoc.getElementById(sectionId);
                    if (clonedSection) {
                        clonedSection.style.backgroundColor = '#1a1b23';
                        clonedSection.style.color = '#ffffff';
                    }
                }
            });

            // Create rounded canvas
            const roundedCanvas = this.createRoundedCanvas(canvas, 16);

            const jpegURL = roundedCanvas.toDataURL('image/jpeg', 0.95);
            const link = document.createElement('a');
            link.download = `${this.currentToken.symbol}-${sectionName}.jpg`;
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
                downloadBtn.innerHTML = '<i class="fas fa-camera"></i> Download ' + 
                    sectionName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
        
        ctx.beginPath();
        this.roundRect(ctx, 0, 0, canvas.width, canvas.height, radius);
        ctx.closePath();
        ctx.clip();
        
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
        this.currentToken = null;
    }
}

const singleTokenStyles = `
<style>
:root {
    --bg-primary: #0a0e17;
    --bg-secondary: #0f172a;
    --bg-tertiary: #1e293b;
    --border-color: #334155;
    --text-primary: #ffffff;
    --text-secondary: #cbd5e1;
    --text-muted: #94a3b8;
    --accent-blue: #3b82f6;
    --accent-blue-glow: #60a5fa;
    --accent-purple: #6366f1;
    --positive: #10b981;
    --negative: #ef4444;
    --glow-effect: 0 0 20px rgba(59, 130, 246, 0.3);
}

.token-section {
    background: linear-gradient(145deg, #0f172a, #1e293b);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 
                0 0 0 1px rgba(59, 130, 246, 0.1),
                var(--glow-effect);
    border: 1px solid rgba(59, 130, 246, 0.2);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.token-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
        transparent, 
        rgba(59, 130, 246, 0.6), 
        transparent
    );
}

.token-section:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 
                0 0 0 1px rgba(59, 130, 246, 0.3),
                0 0 30px rgba(59, 130, 246, 0.4);
    border-color: rgba(59, 130, 246, 0.4);
}

.section-content {
    position: relative;
    padding-bottom: 4.5rem;
    border-radius: 12px;
    overflow: hidden;
    background: linear-gradient(145deg, #1e293b, #0f172a);
}

.section-token-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
    background: linear-gradient(90deg, 
        rgba(59, 130, 246, 0.1), 
        transparent, 
        rgba(59, 130, 246, 0.1)
    );
    padding: 1rem;
    border-radius: 8px;
    margin: -0.5rem -0.5rem 1.5rem -0.5rem;
}

.token-title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.token-logo-title {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.token-icon-large {
    width: 70px;
    height: 70px;
    border-radius: 12px;
    border: none;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
    background: linear-gradient(145deg, #1e40af, #3b82f6);
    transition: all 0.3s ease;
}

.token-icon-medium {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    border: none;
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
    background: linear-gradient(145deg, #1e40af, #3b82f6);
}

.token-name-symbol {
    display: flex;
    flex-direction: column;
}

.section-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.token-symbol {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
}

.token-price-tag {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
}

.current-price {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent-blue);
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.price-change {
    font-size: 0.9rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
}

.token-placeholder {
    width: 70px;
    height: 70px;
    background: linear-gradient(145deg, #1e40af, #3b82f6);
    border-radius: 12px;
    border: 2px solid rgba(59, 130, 246, 0.4);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.token-placeholder-medium {
    width: 50px;
    height: 50px;
    background: linear-gradient(145deg, #1e40af, #3b82f6);
    border-radius: 10px;
    border: 2px solid rgba(59, 130, 246, 0.4);
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

/* Table Styles */
.metrics-table {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(59, 130, 246, 0.2);
    background: linear-gradient(145deg, #1e293b, #0f172a);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.table-row {
    display: flex;
    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.table-row:last-child {
    border-bottom: none;
}

.header-row {
    background: linear-gradient(90deg, #1e40af, #3b82f6);
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.table-cell {
    flex: 1;
    padding: 1.25rem 1rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    border-color: rgba(59, 130, 246, 0.2) !important;
}

.metric-cell {
    background: linear-gradient(145deg, #1e293b, #0f172a);
    color: var(--text-primary);
    font-weight: 500;
    border-right: 1px solid rgba(59, 130, 246, 0.2);
}

.value-cell {
    font-weight: 600;
    padding: 1rem;
    background: linear-gradient(90deg, 
        rgba(59, 130, 246, 0.15), 
        rgba(59, 130, 246, 0.05)
    );
    color: #bfdbfe;
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.positive {
    background: linear-gradient(90deg, 
        rgba(16, 185, 129, 0.25), 
        rgba(16, 185, 129, 0.1)
    ) !important;
    color: #6ee7b7 !important;
    text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.negative {
    background: linear-gradient(90deg, 
        rgba(239, 68, 68, 0.25), 
        rgba(239, 68, 68, 0.1)
    ) !important;
    color: #fca5a5 !important;
    text-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
}

/* ABC Watermark */
.abc-watermark {
    position: absolute;
    bottom: -0.3rem;
    right: 1rem;
    opacity: 0.7;
    transition: opacity 0.2s ease;
    padding: 0.5rem 1rem;
    border: none;
}

.abc-watermark:hover {
    opacity: 1;
}

.abc-brand {
    display: flex;
    align-items: center;
    gap: 0;
    font-size: 0.95rem;
    bottom: -0.3rem;
    color: #bfdbfe;
    font-weight: 600;
    margin-left: -4px;
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.abc-logo-mini {
    margin-left: -6px;
}

.abc-logo-mini img {
    height: 46px;
    width: auto;
    opacity: 0.8;
    margin-top: 0;
    margin-left: -2px;
    border: none;
}

/* Download Button */
.download-section {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
}

.download-btn {
    background: linear-gradient(135deg, #1e40af, #3b82f6);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4),
                0 0 0 1px rgba(59, 130, 246, 0.2);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.download-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6),
                0 0 0 1px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.download-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

/* Responsive Design */
@media (max-width: 768px) {
    .token-section {
        padding: 1rem;
        border-radius: 12px;
    }
    
    .token-title-container {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .token-price-tag {
        align-items: flex-start;
    }
    
    .token-logo-title {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .token-icon-large, .token-icon-medium {
        margin-top: 0;
    }
    
    .table-row {
        flex-direction: column;
    }
    
    .table-cell {
        border: none !important;
        border-bottom: 1px solid rgba(59, 130, 246, 0.2) !important;
        justify-content: space-between;
        text-align: left;
        padding: 1rem;
    }
    
    .table-cell::before {
        content: attr(data-label);
        font-weight: 600;
        color: #bfdbfe;
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

/* Smooth transitions */
.token-section,
.metrics-table,
.table-cell,
.download-btn {
    transition: all 0.3s ease;
}
</style>
`;

// Inject styles into document
document.head.insertAdjacentHTML('beforeend', singleTokenStyles);