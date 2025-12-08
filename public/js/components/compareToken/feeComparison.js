// ABC Africa Blockchain Club branding
const abcBranding = {
    name: "ABC Africa Blockchain Club",
    logo: "/ABC.png",
    website: "https://abc-africa-blockchain.org",
    tagline: "Empowering Africa's Blockchain Future"
};

export class FeeComparison {
    constructor() {
        this.container = document.getElementById('fee-comparison');
        this.currentExchange1 = null;
        this.currentExchange2 = null;
        this.isGenerating = false;
    }

    // Example fee data structure - in practice, this would come from an API
    getFeeData(exchangeName) {
        const feeData = {
            'Binance': {
                name: 'Binance',
                logo: 'https://example.com/binance-logo.png',
                spot: {
                    taker: 0.0450,
                    maker: 0.0150,
                    volume_tier: 'VIP 0',
                    discount_info: 'Fees decrease with higher trading volume and BNB holdings'
                },
                futures: {
                    taker: 0.0400,
                    maker: 0.0200,
                    funding_rate_interval: '8 hours',
                    typical_rate_range: '-0.03% to +0.03%',
                    max_rate: '±0.75%'
                },
                total_fee_revenue_24h: 38500000, // Example in USD
                estimated_annual_revenue: 14000000000 // Example in USD
            },
            'Coinbase': {
                name: 'Coinbase',
                logo: 'https://example.com/coinbase-logo.png',
                spot: {
                    taker: 0.6000, // 0.60%
                    maker: 0.4000, // 0.40%
                    volume_tier: 'Standard',
                    discount_info: 'Lower fees for higher volume traders and Coinbase One subscribers'
                },
                futures: {
                    taker: 0.0500,
                    maker: 0.0300,
                    funding_rate_interval: '8 hours',
                    typical_rate_range: '-0.02% to +0.02%',
                    max_rate: '±0.50%'
                },
                total_fee_revenue_24h: 28500000,
                estimated_annual_revenue: 10400000000
            },
            'Kraken': {
                name: 'Kraken',
                logo: 'https://example.com/kraken-logo.png',
                spot: {
                    taker: 0.2600,
                    maker: 0.1600,
                    volume_tier: 'Starter',
                    discount_info: 'Volume-based discounts available'
                },
                futures: {
                    taker: 0.0500,
                    maker: 0.0200,
                    funding_rate_interval: '8 hours',
                    typical_rate_range: '-0.025% to +0.025%',
                    max_rate: '±0.75%'
                },
                total_fee_revenue_24h: 12500000,
                estimated_annual_revenue: 4560000000
            },
            'Bybit': {
                name: 'Bybit',
                logo: 'https://example.com/bybit-logo.png',
                spot: {
                    taker: 0.1000,
                    maker: 0.1000,
                    volume_tier: 'Standard',
                    discount_info: 'No maker fees for certain pairs'
                },
                futures: {
                    taker: 0.0550,
                    maker: 0.0200,
                    funding_rate_interval: '8 hours',
                    typical_rate_range: '-0.01% to +0.01%',
                    max_rate: '±0.25%'
                },
                total_fee_revenue_24h: 9500000,
                estimated_annual_revenue: 3460000000
            },
            'KuCoin': {
                name: 'KuCoin',
                logo: 'https://example.com/kucoin-logo.png',
                spot: {
                    taker: 0.1000,
                    maker: 0.1000,
                    volume_tier: 'Regular',
                    discount_info: 'Discounts with KCS token holdings'
                },
                futures: {
                    taker: 0.0600,
                    maker: 0.0200,
                    funding_rate_interval: '8 hours',
                    typical_rate_range: '-0.02% to +0.02%',
                    max_rate: '±0.50%'
                },
                total_fee_revenue_24h: 8500000,
                estimated_annual_revenue: 3100000000
            }
        };
        
        return feeData[exchangeName] || null;
    }

    render(exchange1Name, exchange2Name) {
        const exchange1Data = this.getFeeData(exchange1Name);
        const exchange2Data = this.getFeeData(exchange2Name);
        
        if (!exchange1Data || !exchange2Data) {
            this.container.innerHTML = '<p class="error-message">Fee data not available for selected exchanges</p>';
            return;
        }
        
        this.currentExchange1 = exchange1Data;
        this.currentExchange2 = exchange2Data;
        
        this.container.innerHTML = `
            <!-- Trading Fees Section -->
            <div class="comparison-section" id="trading-fees-section">
                <div class="section-content">
                    <div class="section-token-header">
                        <div class="token-comparison-title">
                            <div class="token-pair-logos">
                                <div class="token-logo-left">
                                    ${this.currentExchange1.logo ? `
                                        <img src="${this.currentExchange1.logo}" alt="${this.currentExchange1.name}" 
                                             class="token-icon-large" onerror="this.style.display='none'">
                                    ` : '<div class="token-placeholder"></div>'}
                                </div>
                                <span class="vs-text">vs</span>
                                <div class="token-logo-right">
                                    ${this.currentExchange2.logo ? `
                                        <img src="${this.currentExchange2.logo}" alt="${this.currentExchange2.name}" 
                                             class="token-icon-large" onerror="this.style.display='none'">
                                    ` : '<div class="token-placeholder"></div>'}
                                </div>
                            </div>
                            <h4 class="section-title">Trading Fees Comparison</h4>
                            <p class="section-subtitle">Spot Trading Fee Structure</p>
                        </div>
                    </div>
                    <div class="metrics-table">
                        <div class="table-row header-row">
                            <div class="table-cell">${this.currentExchange1.name}</div>
                            <div class="table-cell">Fee Type</div>
                            <div class="table-cell">${this.currentExchange2.name}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value ${this.getFeeComparisonClass(this.currentExchange1.spot.taker, this.currentExchange2.spot.taker)}">
                                ${this.formatPercentage(this.currentExchange1.spot.taker)}
                            </div>
                            <div class="table-cell metric-cell">
                                Taker Fee (Market Orders)
                                <div class="metric-description">Paid when you execute an order immediately</div>
                            </div>
                            <div class="table-cell value-cell token2-value ${this.getFeeComparisonClass(this.currentExchange2.spot.taker, this.currentExchange1.spot.taker)}">
                                ${this.formatPercentage(this.currentExchange2.spot.taker)}
                            </div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value ${this.getFeeComparisonClass(this.currentExchange1.spot.maker, this.currentExchange2.spot.maker)}">
                                ${this.formatPercentage(this.currentExchange1.spot.maker)}
                            </div>
                            <div class="table-cell metric-cell">
                                Maker Fee (Limit Orders)
                                <div class="metric-description">Paid when you provide liquidity to the order book</div>
                            </div>
                            <div class="table-cell value-cell token2-value ${this.getFeeComparisonClass(this.currentExchange2.spot.maker, this.currentExchange1.spot.maker)}">
                                ${this.formatPercentage(this.currentExchange2.spot.maker)}
                            </div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value">
                                ${this.currentExchange1.spot.volume_tier}
                            </div>
                            <div class="table-cell metric-cell">
                                Volume Tier
                                <div class="metric-description">Current trading volume bracket</div>
                            </div>
                            <div class="table-cell value-cell token2-value">
                                ${this.currentExchange2.spot.volume_tier}
                            </div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value info-cell">
                                ${this.currentExchange1.spot.discount_info}
                            </div>
                            <div class="table-cell metric-cell">
                                Discount Information
                                <div class="metric-description">Ways to reduce trading fees</div>
                            </div>
                            <div class="table-cell value-cell token2-value info-cell">
                                ${this.currentExchange2.spot.discount_info}
                            </div>
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
                    <button class="download-btn download-trading-fees" title="Download Trading Fees">
                        <i class="fas fa-camera"></i>
                        Download Trading Fees
                    </button>
                </div>
            </div>

            <!-- Perpetual Futures & Funding Rates Section -->
            <div class="comparison-section" id="futures-fees-section">
                <div class="section-content">
                    <div class="section-token-header">
                        <div class="token-comparison-title">
                            <div class="token-pair-logos">
                                <div class="token-logo-left">
                                    ${this.currentExchange1.logo ? `
                                        <img src="${this.currentExchange1.logo}" alt="${this.currentExchange1.name}" 
                                             class="token-icon-large" onerror="this.style.display='none'">
                                    ` : '<div class="token-placeholder"></div>'}
                                </div>
                                <span class="vs-text">vs</span>
                                <div class="token-logo-right">
                                    ${this.currentExchange2.logo ? `
                                        <img src="${this.currentExchange2.logo}" alt="${this.currentExchange2.name}" 
                                             class="token-icon-large" onerror="this.style.display='none'">
                                    ` : '<div class="token-placeholder"></div>'}
                                </div>
                            </div>
                            <h4 class="section-title">Perpetual Futures & Funding Rates</h4>
                            <p class="section-subtitle">Futures Trading and Funding Mechanics</p>
                        </div>
                    </div>
                    <div class="metrics-table">
                        <div class="table-row header-row">
                            <div class="table-cell">${this.currentExchange1.name}</div>
                            <div class="table-cell">Futures Metric</div>
                            <div class="table-cell">${this.currentExchange2.name}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value ${this.getFeeComparisonClass(this.currentExchange1.futures.taker, this.currentExchange2.futures.taker)}">
                                ${this.formatPercentage(this.currentExchange1.futures.taker)}
                            </div>
                            <div class="table-cell metric-cell">
                                Futures Taker Fee
                                <div class="metric-description">Fee for market orders on futures</div>
                            </div>
                            <div class="table-cell value-cell token2-value ${this.getFeeComparisonClass(this.currentExchange2.futures.taker, this.currentExchange1.futures.taker)}">
                                ${this.formatPercentage(this.currentExchange2.futures.taker)}
                            </div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value ${this.getFeeComparisonClass(this.currentExchange1.futures.maker, this.currentExchange2.futures.maker)}">
                                ${this.formatPercentage(this.currentExchange1.futures.maker)}
                            </div>
                            <div class="table-cell metric-cell">
                                Futures Maker Fee
                                <div class="metric-description">Fee for limit orders on futures</div>
                            </div>
                            <div class="table-cell value-cell token2-value ${this.getFeeComparisonClass(this.currentExchange2.futures.maker, this.currentExchange1.futures.maker)}">
                                ${this.formatPercentage(this.currentExchange2.futures.maker)}
                            </div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value">
                                ${this.currentExchange1.futures.funding_rate_interval}
                            </div>
                            <div class="table-cell metric-cell">
                                Funding Interval
                                <div class="metric-description">How often funding rates are exchanged</div>
                            </div>
                            <div class="table-cell value-cell token2-value">
                                ${this.currentExchange2.futures.funding_rate_interval}
                            </div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value">
                                ${this.currentExchange1.futures.typical_rate_range}
                            </div>
                            <div class="table-cell metric-cell">
                                Typical Funding Rate
                                <div class="metric-description">Most common funding rate range</div>
                            </div>
                            <div class="table-cell value-cell token2-value">
                                ${this.currentExchange2.futures.typical_rate_range}
                            </div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value warning-cell">
                                ${this.currentExchange1.futures.max_rate}
                            </div>
                            <div class="table-cell metric-cell">
                                Maximum Funding Rate
                                <div class="metric-description">Cap on funding rate payments</div>
                            </div>
                            <div class="table-cell value-cell token2-value warning-cell">
                                ${this.currentExchange2.futures.max_rate}
                            </div>
                        </div>
                        <div class="funding-rate-explanation">
                            <h5>Understanding Funding Rates</h5>
                            <p>Funding rates are periodic payments between long and short traders to keep the futures price aligned with the spot price.</p>
                            <ul>
                                <li><strong>Positive Rate:</strong> Longs pay shorts (more buyers than sellers)</li>
                                <li><strong>Negative Rate:</strong> Shorts pay longs (more sellers than buyers)</li>
                                <li><strong>You pay</strong> when the rate is against your position</li>
                                <li><strong>You receive</strong> when the rate is in favor of your position</li>
                            </ul>
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
                    <button class="download-btn download-futures-fees" title="Download Futures Fees">
                        <i class="fas fa-camera"></i>
                        Download Futures Fees
                    </button>
                </div>
            </div>

            <!-- Exchange Revenue & Profitability Section -->
            <div class="comparison-section" id="revenue-section">
                <div class="section-content">
                    <div class="section-token-header">
                        <div class="token-comparison-title">
                            <div class="token-pair-logos">
                                <div class="token-logo-left">
                                    ${this.currentExchange1.logo ? `
                                        <img src="${this.currentExchange1.logo}" alt="${this.currentExchange1.name}" 
                                             class="token-icon-large" onerror="this.style.display='none'">
                                    ` : '<div class="token-placeholder"></div>'}
                                </div>
                                <span class="vs-text">vs</span>
                                <div class="token-logo-right">
                                    ${this.currentExchange2.logo ? `
                                        <img src="${this.currentExchange2.logo}" alt="${this.currentExchange2.name}" 
                                             class="token-icon-large" onerror="this.style.display='none'">
                                    ` : '<div class="token-placeholder"></div>'}
                                </div>
                            </div>
                            <h4 class="section-title">Exchange Revenue & Profitability</h4>
                            <p class="section-subtitle">Fee Revenue from Trading Activities</p>
                        </div>
                    </div>
                    <div class="metrics-table">
                        <div class="table-row header-row">
                            <div class="table-cell">${this.currentExchange1.name}</div>
                            <div class="table-cell">Revenue Metric</div>
                            <div class="table-cell">${this.currentExchange2.name}</div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value ${this.getRevenueComparisonClass(this.currentExchange1.total_fee_revenue_24h, this.currentExchange2.total_fee_revenue_24h)}">
                                ${this.formatCurrency(this.currentExchange1.total_fee_revenue_24h)}
                            </div>
                            <div class="table-cell metric-cell">
                                24h Fee Revenue
                                <div class="metric-description">Total fees collected in last 24 hours</div>
                            </div>
                            <div class="table-cell value-cell token2-value ${this.getRevenueComparisonClass(this.currentExchange2.total_fee_revenue_24h, this.currentExchange1.total_fee_revenue_24h)}">
                                ${this.formatCurrency(this.currentExchange2.total_fee_revenue_24h)}
                            </div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value ${this.getRevenueComparisonClass(this.currentExchange1.estimated_annual_revenue, this.currentExchange2.estimated_annual_revenue)}">
                                ${this.formatCurrency(this.currentExchange1.estimated_annual_revenue)}
                            </div>
                            <div class="table-cell metric-cell">
                                Estimated Annual Revenue
                                <div class="metric-description">Projected yearly fee income</div>
                            </div>
                            <div class="table-cell value-cell token2-value ${this.getRevenueComparisonClass(this.currentExchange2.estimated_annual_revenue, this.currentExchange1.estimated_annual_revenue)}">
                                ${this.formatCurrency(this.currentExchange2.estimated_annual_revenue)}
                            </div>
                        </div>
                        <div class="table-row">
                            <div class="table-cell value-cell token1-value">
                                ${this.calculateEffectiveRate(this.currentExchange1).toFixed(4)}%
                            </div>
                            <div class="table-cell metric-cell">
                                Effective Fee Rate
                                <div class="metric-description">Average fee percentage across all trades</div>
                            </div>
                            <div class="table-cell value-cell token2-value">
                                ${this.calculateEffectiveRate(this.currentExchange2).toFixed(4)}%
                            </div>
                        </div>
                        <div class="profitability-insights">
                            <h5>Fee Structure Insights</h5>
                            <p>Exchanges generate revenue primarily from:</p>
                            <ul>
                                <li><strong>Trading Fees:</strong> Maker/taker fees on spot and futures</li>
                                <li><strong>Withdrawal Fees:</strong> Fixed fees for withdrawing assets</li>
                                <li><strong>Funding Rates:</strong> Net transfers between positions</li>
                                <li><strong>Other Services:</strong> Staking, lending, and custody fees</li>
                            </ul>
                            <p class="insight-note">Lower fees often attract higher volume traders, while higher fees may indicate premium services or lower liquidity requirements.</p>
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
                    <button class="download-btn download-revenue" title="Download Revenue Metrics">
                        <i class="fas fa-camera"></i>
                        Download Revenue Metrics
                    </button>
                </div>
            </div>
        `;

        // Add download event listeners
        const tradingFeesBtn = this.container.querySelector('.download-trading-fees');
        const futuresFeesBtn = this.container.querySelector('.download-futures-fees');
        const revenueBtn = this.container.querySelector('.download-revenue');

        if (tradingFeesBtn) {
            tradingFeesBtn.addEventListener('click', () => this.downloadSectionAsJPEG('trading-fees-section', 'trading-fees'));
        }
        if (futuresFeesBtn) {
            futuresFeesBtn.addEventListener('click', () => this.downloadSectionAsJPEG('futures-fees-section', 'futures-fees'));
        }
        if (revenueBtn) {
            revenueBtn.addEventListener('click', () => this.downloadSectionAsJPEG('revenue-section', 'revenue-metrics'));
        }
    }

    formatPercentage(value) {
        return value.toFixed(4) + '%';
    }

    formatCurrency(value) {
        if (value >= 1e9) {
            return '$' + (value / 1e9).toFixed(2) + 'B';
        } else if (value >= 1e6) {
            return '$' + (value / 1e6).toFixed(2) + 'M';
        } else if (value >= 1e3) {
            return '$' + (value / 1e3).toFixed(2) + 'K';
        }
        return '$' + value.toLocaleString();
    }

    getFeeComparisonClass(value1, value2) {
        if (value1 < value2) {
            return 'better-fee';
        } else if (value1 > value2) {
            return 'worse-fee';
        }
        return '';
    }

    getRevenueComparisonClass(value1, value2) {
        if (value1 > value2) {
            return 'higher-revenue';
        } else if (value1 < value2) {
            return 'lower-revenue';
        }
        return '';
    }

    calculateEffectiveRate(exchange) {
        // Simplified calculation - average of maker and taker fees
        return (exchange.spot.taker + exchange.spot.maker + exchange.futures.taker + exchange.futures.maker) / 4;
    }

    async downloadSectionAsJPEG(sectionId, sectionName) {
        if (this.isGenerating) return;
        
        try {
            this.isGenerating = true;
            
            const downloadBtn = this.container.querySelector(`.download-${sectionName.split('-')[0]}`);
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

            const roundedCanvas = this.createRoundedCanvas(canvas, 16);
            const jpegURL = roundedCanvas.toDataURL('image/jpeg', 0.95);
            const link = document.createElement('a');
            link.download = `${this.currentExchange1.name}-vs-${this.currentExchange2.name}-${sectionName}.jpg`;
            link.href = jpegURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Error generating JPEG:', error);
            alert('Failed to generate image.');
        } finally {
            const downloadBtn = this.container.querySelector(`.download-${sectionName.split('-')[0]}`);
            if (downloadBtn) {
                downloadBtn.innerHTML = '<i class="fas fa-camera"></i> Download ' + this.formatSectionName(sectionName);
                downloadBtn.disabled = false;
            }
            this.isGenerating = false;
        }
    }

    formatSectionName(sectionName) {
        return sectionName.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
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
        this.currentExchange1 = null;
        this.currentExchange2 = null;
    }
}

// Additional CSS styles for fee comparison
const feeComparisonStyles = `
<style>
    .fee-comparison-container {
        margin-top: 2rem;
    }

    .section-subtitle {
        text-align: center;
        color: #94a3b8;
        font-size: 0.9rem;
        margin-top: 0.5rem;
        margin-bottom: 1rem;
    }

    .metric-description {
        font-size: 0.8rem;
        color: #94a3b8;
        margin-top: 0.25rem;
        font-weight: normal;
    }

    .better-fee {
        background: linear-gradient(90deg, 
            rgba(16, 185, 129, 0.25), 
            rgba(16, 185, 129, 0.1)
        ) !important;
        color: #10b981 !important;
        border: 1px solid rgba(16, 185, 129, 0.3) !important;
    }

    .worse-fee {
        background: linear-gradient(90deg, 
            rgba(239, 68, 68, 0.25), 
            rgba(239, 68, 68, 0.1)
        ) !important;
        color: #ef4444 !important;
        border: 1px solid rgba(239, 68, 68, 0.3) !important;
    }

    .higher-revenue {
        background: linear-gradient(90deg, 
            rgba(16, 185, 129, 0.25), 
            rgba(16, 185, 129, 0.1)
        ) !important;
        color: #10b981 !important;
        border: 1px solid rgba(16, 185, 129, 0.3) !important;
    }

    .lower-revenue {
        background: linear-gradient(90deg, 
            rgba(239, 68, 68, 0.25), 
            rgba(239, 68, 68, 0.1)
        ) !important;
        color: #ef4444 !important;
        border: 1px solid rgba(239, 68, 68, 0.3) !important;
    }

    .info-cell {
        background: linear-gradient(90deg, 
            rgba(59, 130, 246, 0.1), 
            rgba(59, 130, 246, 0.05)
        ) !important;
        color: #bfdbfe !important;
        font-size: 0.85rem;
        text-align: left;
        justify-content: flex-start;
        padding-left: 1rem;
    }

    .warning-cell {
        background: linear-gradient(90deg, 
            rgba(245, 158, 11, 0.25), 
            rgba(245, 158, 11, 0.1)
        ) !important;
        color: #f59e0b !important;
        border: 1px solid rgba(245, 158, 11, 0.3) !important;
    }

    .funding-rate-explanation,
    .profitability-insights {
        margin-top: 1.5rem;
        padding: 1rem;
        background: linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.5));
        border-radius: 8px;
        border-left: 4px solid #3b82f6;
    }

    .funding-rate-explanation h5,
    .profitability-insights h5 {
        color: #bfdbfe;
        margin-bottom: 0.75rem;
        font-size: 1rem;
    }

    .funding-rate-explanation ul,
    .profitability-insights ul {
        margin: 0.75rem 0;
        padding-left: 1.5rem;
        color: #94a3b8;
    }

    .funding-rate-explanation li,
    .profitability-insights li {
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }

    .funding-rate-explanation p,
    .profitability-insights p {
        color: #94a3b8;
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .insight-note {
        font-style: italic;
        color: #64748b;
        font-size: 0.85rem;
        margin-top: 1rem;
        padding: 0.75rem;
        background: rgba(30, 41, 59, 0.3);
        border-radius: 6px;
    }

    .error-message {
        text-align: center;
        color: #ef4444;
        padding: 2rem;
        background: rgba(239, 68, 68, 0.1);
        border-radius: 8px;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }

    @media (max-width: 768px) {
        .info-cell {
            font-size: 0.8rem;
            padding: 0.75rem;
        }
        
        .funding-rate-explanation,
        .profitability-insights {
            padding: 0.75rem;
            font-size: 0.9rem;
        }
    }
</style>
`;

// Inject styles into document
document.head.insertAdjacentHTML('beforeend', feeComparisonStyles);