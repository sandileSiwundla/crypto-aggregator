"use client";

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
                <div class="token-pair-logos">
                    <div class="token-logo-left">
                        ${this.currentToken1.logo ? `
                            <img src="${this.currentToken1.logo}" alt="${this.currentToken1.name}" 
                                 class="token-icon-large" onerror="this.style.display='none'">
                        ` : '<div class="token-placeholder"></div>'}
                    </div>
                    <span class="vs-text">vs</span>
                    <div class="token-logo-right">
                        ${this.currentToken2.logo ? `
                            <img src="${this.currentToken2.logo}" alt="${this.currentToken2.name}" 
                                 class="token-icon-large" onerror="this.style.display='none'">
                        ` : '<div class="token-placeholder"></div>'}
                    </div>
                </div>
                <h4 class="section-title">Market Metrics Comparison</h4>
            </div>
        </div>
        <div class="metrics-table">
            <div class="table-row header-row">
                <div class="table-cell">${this.currentToken1.name}</div>
                <div class="table-cell">Metric</div>
                <div class="table-cell">${this.currentToken2.name}</div>
            </div>
            <div class="table-row">
                <div class="table-cell value-cell token1-value">${this.currentToken1.symbol}</div>
                <div class="table-cell metric-cell">Symbol</div>
                <div class="table-cell value-cell token2-value">${this.currentToken2.symbol}</div>
            </div>
            <!-- New Price row -->
<div class="table-row">
    <div class="table-cell value-cell token1-value">
        $${this.formatNumber(this.currentToken1.quote?.USD?.price || 0)}
    </div>
    <div class="table-cell metric-cell">Price</div>
    <div class="table-cell value-cell token2-value">
        $${this.formatNumber(this.currentToken2.quote?.USD?.price || 0)}
    </div>
</div>
            <div class="table-row">
                <div class="table-cell value-cell token1-value">${this.formatNumber(this.currentToken1.quote?.USD?.market_cap || 0)}</div>
                <div class="table-cell metric-cell">Market Cap</div>
                <div class="table-cell value-cell token2-value">${this.formatNumber(this.currentToken2.quote?.USD?.market_cap || 0)}</div>
            </div>
            <div class="table-row">
                <div class="table-cell value-cell token1-value">${this.formatNumber(this.currentToken1.quote?.USD?.fully_diluted_market_cap || 0)}</div>
                <div class="table-cell metric-cell">Fully Diluted MCap</div>
                <div class="table-cell value-cell token2-value">${this.formatNumber(this.currentToken2.quote?.USD?.fully_diluted_market_cap || 0)}</div>
            </div>
            <div class="table-row">
                <div class="table-cell value-cell token1-value">#${this.currentToken1.cmc_rank || 'N/A'}</div>
                <div class="table-cell metric-cell">Market Cap Rank</div>
                <div class="table-cell value-cell token2-value">#${this.currentToken2.cmc_rank || 'N/A'}</div>
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
                            <div class="token-pair-logos">
                                <div class="token-logo-left">
                                    ${this.currentToken1.logo ? `
                                        <img src="${this.currentToken1.logo}" alt="${this.currentToken1.name}" 
                                             class="token-icon-large" onerror="this.style.display='none'">
                                    ` : '<div class="token-placeholder"></div>'}
                                </div>
                                <span class="vs-text">vs</span>
                                <div class="token-logo-right">
                                    ${this.currentToken2.logo ? `
                                        <img src="${this.currentToken2.logo}" alt="${this.currentToken2.name}" 
                                             class="token-icon-large" onerror="this.style.display='none'">
                                    ` : '<div class="token-placeholder"></div>'}
                                </div>
                            </div>
                            <h4 class="section-title">Supply Metrics Comparison</h4>
                        </div>
                    </div>
                    <div class="metrics-table">
                        <div class="table-row header-row">
                            <div class="table-cell">${this.currentToken1.name}</div>
                            <div class="table-cell">Metric</div>
                            <div class="table-cell">${this.currentToken2.name}</div>
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

            <!-- Performance & Utility Section -->
            <div class="comparison-section" id="performance-section">
                <div class="section-content">
                    <div class="section-token-header">
                        <div class="token-comparison-title">
                            <div class="token-pair-logos">
                                <div class="token-logo-left">
                                    ${this.currentToken1.logo ? `
                                        <img src="${this.currentToken1.logo}" alt="${this.currentToken1.name}" 
                                             class="token-icon-large" onerror="this.style.display='none'">
                                    ` : '<div class="token-placeholder"></div>'}
                                </div>
                                <span class="vs-text">vs</span>
                                <div class="token-logo-right">
                                    ${this.currentToken2.logo ? `
                                        <img src="${this.currentToken2.logo}" alt="${this.currentToken2.name}" 
                                             class="token-icon-large" onerror="this.style.display='none'">
                                    ` : '<div class="token-placeholder"></div>'}
                                </div>
                            </div>
                            <h4 class="section-title">Performance & Utility Comparison</h4>
                        </div>
                    </div>
                    <div class="metrics-table">
                        <div class="table-row header-row">
                            <div class="table-cell">${this.currentToken1.name}</div>
                            <div class="table-cell">Metric</div>
                            <div class="table-cell">${this.currentToken2.name}</div>
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
                            <div class="table-cell value-cell token1-value">${this.formatNumber(this.currentToken1.quote?.USD?.volume_24h || 0)}</div>
                            <div class="table-cell metric-cell">24h Trading Volume</div>
                            <div class="table-cell value-cell token2-value">${this.formatNumber(this.currentToken2.quote?.USD?.volume_24h || 0)}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value">${this.calculateVolumeRatio(this.currentToken1)}%</div>
                            <div class="table-cell metric-cell">Volume/MCap Ratio</div>
                            <div class="table-cell value-cell token2-value">${this.calculateVolumeRatio(this.currentToken2)}%</div>
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

const tokenomicsStyles = `
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

.comparison-section {
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

.comparison-section::before {
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

.comparison-section:hover {
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

.token-comparison-title {
    text-align: center;
}

.token-pair-logos {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    position: relative;
    min-height: 60px;
}

.token-logo-left {
    position: absolute;
    left: 20%;
    transform: translateX(-50%);
}

.token-logo-right {
    position: absolute;
    right: 20%;
    transform: translateX(50%);
}

.token-icon-large {
    width: 70px;
    height: 70px;
    border-radius: 12px;
    border: none;
    margin-top: 40px;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
    background: linear-gradient(145deg, #1e40af, #3b82f6);
    transition: all 0.3s ease;
}

.token-icon-large:hover {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border-color: rgba(59, 130, 246, 0.8);
    transform: scale(1.05);
}

.token-placeholder {
    width: 70px;
    height: 70px;
    background: linear-gradient(145deg, #1e40af, #3b82f6);
    border-radius: 12px;
    border: 2px solid rgba(59, 130, 246, 0.4);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.vs-text {
    color: #bfdbfe;
    font-weight: 600;
    font-size: 0.9rem;
    background: linear-gradient(90deg, #1e40af, #3b82f6);
    padding: 0.5rem 1.5rem;
    border-radius: 25px;
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
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

.header-row .table-cell {
    border-right: 1px solid rgba(59, 130, 246, 0.3);
}

.header-row .table-cell:last-child {
    border-right: none;
}

.value-cell {
    font-weight: 600;
    padding: 1rem;
}

.token1-value {
    background: linear-gradient(90deg, 
        rgba(59, 130, 246, 0.15), 
        rgba(59, 130, 246, 0.05)
    );
    color: #bfdbfe;
    border-right: 1px solid rgba(59, 130, 246, 0.2);
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.token2-value {
    background: linear-gradient(90deg, 
        rgba(139, 92, 246, 0.15), 
        rgba(139, 92, 246, 0.05)
    );
    color: #ddd6fe;
    border-left: 1px solid rgba(139, 92, 246, 0.2);
    text-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
}

.metric-cell {
    background: linear-gradient(145deg, #1e293b, #0f172a);
    color: var(--text-primary);
    font-weight: 500;
    border-left: 1px solid rgba(59, 130, 246, 0.2);
    border-right: 1px solid rgba(59, 130, 246, 0.2);
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
    .comparison-section {
        padding: 1rem;
        border-radius: 12px;
    }
    
    .token-pair-logos {
        flex-direction: column;
        gap: 0.5rem;
        padding: 0;
    }
    
    .token-logo-left, .token-logo-right {
        padding: 0;
        justify-content: center;
        position: static;
        transform: none;
    }
    
    .token-icon-large {
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

/* Smooth transitionts (or “perpetual futures”) are derivative instruments similar to futures contracts but without an expiry date.

Traders can take longs for theme changes */
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