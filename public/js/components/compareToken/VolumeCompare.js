export class VolumeCompare {
    constructor() {
        this.chart = null;
    }

    render(token1, token2, period = 30) {
        const container = document.getElementById('volume-comparison');
        if (!container) return;

        container.innerHTML = this.getHTML(token1, token2);
        this.renderChart(token1, token2, period);
        this.renderVolumeTable(token1, token2);
        this.addDownloadFunctionality(token1, token2);
    }

    getHTML(token1, token2) {
        return `
            <div class="section-header">
                <h2><i class="fas fa-chart-bar"></i> Volume Comparison</h2>
                <p>Trading volume analysis and comparison</p>
            </div>
            
            <div class="volume-controls">
                <div class="abc-branding-volume">
                    <div class="abc-info-volume">
                        <div class="powered-by">ANALYTICS BY</div>
                        <div class="abc-name-volume">ABC Research</div>
                        <div class="abc-tagline-volume">Volume Analysis Suite</div>
                    </div>
                </div>
                <button class="download-volume-btn" id="download-volume-btn">
                    <i class="fas fa-download"></i>
                    Download Volume Report
                </button>
            </div>

            <div class="volume-content">
                <div class="volume-chart-container">
                    <div class="chart-container">
                        <canvas id="volume-chart"></canvas>
                    </div>
                </div>
                
                <div class="volume-metrics-grid">
                    <div class="volume-card">
                        <h4><i class="fas fa-exchange-alt"></i> Volume Metrics</h4>
                        <div class="volume-metrics">
                            <div class="volume-metric ${this.getVolumeAdvantageClass(token1.volume24h, token2.volume24h)}">
                                <span>24h Volume</span>
                                <span>${this.formatVolume(token1.volume24h)} vs ${this.formatVolume(token2.volume24h)}</span>
                            </div>
                            <div class="volume-metric ${this.getVolumeChangeAdvantageClass(token1.volumeChange24h, token2.volumeChange24h)}">
                                <span>24h Volume Change</span>
                                <span>${this.formatPercentage(token1.volumeChange24h)} vs ${this.formatPercentage(token2.volumeChange24h)}</span>
                            </div>
                            <div class="volume-metric">
                                <span>Volume Ratio</span>
                                <span>${this.calculateVolumeRatio(token1.volume24h, token2.volume24h)}</span>
                            </div>
                            <div class="volume-metric ${this.getMarketDepthClass(token1.marketCap, token1.volume24h, token2.marketCap, token2.volume24h)}">
                                <span>Market Depth</span>
                                <span>${this.calculateMarketDepth(token1.marketCap, token1.volume24h)} vs ${this.calculateMarketDepth(token2.marketCap, token2.volume24h)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="volume-insights-card">
                        <h4><i class="fas fa-lightbulb"></i> Volume Insights</h4>
                        <div class="insights-content">
                            ${this.generateVolumeInsights(token1, token2)}
                        </div>
                    </div>
                </div>
            </div>

            <div class="volume-table-section">
                <div class="section-header">
                    <h3><i class="fas fa-table"></i> Detailed Volume Analysis</h3>
                </div>
                <div class="table-container">
                    <table id="volume-details-table">
                        <thead>
                            <tr>
                                <th>Volume Metric</th>
                                <th>${token1.name} (${token1.symbol})</th>
                                <th>${token2.name} (${token2.symbol})</th>
                                <th>Comparison</th>
                                <th>Insight</th>
                            </tr>
                        </thead>
                        <tbody id="volume-details-body">
                            ${this.generateVolumeTableRows(token1, token2)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderChart(token1, token2, period) {
        const ctx = document.getElementById('volume-chart');
        if (!ctx) return;

        if (this.chart) {
            this.chart.destroy();
        }

        // Generate sample volume data (replace with real API data)
        const volumeData = this.generateVolumeData(period);
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: volumeData.labels,
                datasets: [
                    {
                        label: `${token1.name} Volume`,
                        data: volumeData.token1Volumes,
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: `${token2.name} Volume`,
                        data: volumeData.token2Volumes,
                        backgroundColor: 'rgba(139, 92, 246, 0.7)',
                        borderColor: 'rgb(139, 92, 246)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        type: 'logarithmic',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Trading Volume (USD)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: $${this.formatVolume(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderVolumeTable(token1, token2) {
        // Table is already rendered in HTML, this method is for updates
    }

    generateVolumeData(period) {
        const labels = [];
        const token1Volumes = [];
        const token2Volumes = [];
        
        const baseVolume1 = 50000000; // $50M base
        const baseVolume2 = 30000000; // $30M base
        
        for (let i = period; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString());
            
            // Generate realistic volume data with some randomness
            const volatility1 = 0.3 + Math.random() * 0.4;
            const volatility2 = 0.2 + Math.random() * 0.5;
            
            token1Volumes.push(baseVolume1 * (0.7 + Math.random() * 0.6) * volatility1);
            token2Volumes.push(baseVolume2 * (0.8 + Math.random() * 0.4) * volatility2);
        }
        
        return { labels, token1Volumes, token2Volumes };
    }

    generateVolumeTableRows(token1, token2) {
        const rows = [
            {
                metric: '24h Trading Volume',
                value1: this.formatVolume(token1.volume24h),
                value2: this.formatVolume(token2.volume24h),
                comparison: this.compareValues(token1.volume24h, token2.volume24h),
                insight: this.getVolumeInsight(token1.volume24h, token2.volume24h)
            },
            {
                metric: 'Volume Change (24h)',
                value1: this.formatPercentage(token1.volumeChange24h),
                value2: this.formatPercentage(token2.volumeChange24h),
                comparison: this.comparePercentage(token1.volumeChange24h, token2.volumeChange24h),
                insight: this.getVolumeChangeInsight(token1.volumeChange24h, token2.volumeChange24h)
            },
            {
                metric: 'Volume/Market Cap Ratio',
                value1: this.calculateVolumeRatio(token1.volume24h, token1.marketCap),
                value2: this.calculateVolumeRatio(token2.volume24h, token2.marketCap),
                comparison: this.compareRatios(
                    token1.volume24h / token1.marketCap,
                    token2.volume24h / token2.marketCap
                ),
                insight: this.getVolumeRatioInsight(
                    token1.volume24h / token1.marketCap,
                    token2.volume24h / token2.marketCap
                )
            },
            {
                metric: 'Average Daily Volume',
                value1: this.formatVolume(token1.volume24h * 0.8), // Simulated
                value2: this.formatVolume(token2.volume24h * 1.2), // Simulated
                comparison: 'Stable vs Variable',
                insight: 'Compares consistency in trading volume'
            }
        ];

        return rows.map(row => `
            <tr>
                <td class="metric-name-cell">${row.metric}</td>
                <td class="token-value-cell">${row.value1}</td>
                <td class="token-value-cell">${row.value2}</td>
                <td class="comparison-cell">${row.comparison}</td>
                <td class="insight-cell">${row.insight}</td>
            </tr>
        `).join('');
    }

    generateVolumeInsights(token1, token2) {
        const insights = [];
        const volumeRatio = token1.volume24h / token2.volume24h;
        
        if (volumeRatio > 2) {
            insights.push(`${token1.name} has significantly higher trading volume than ${token2.name}`);
        } else if (volumeRatio < 0.5) {
            insights.push(`${token2.name} dominates in trading volume compared to ${token1.name}`);
        } else {
            insights.push(`Both tokens show comparable trading volume levels`);
        }

        if (token1.volumeChange24h > 20 && token2.volumeChange24h > 20) {
            insights.push(`Both tokens experiencing high volume growth`);
        } else if (token1.volumeChange24h < -10 || token2.volumeChange24h < -10) {
            insights.push(`One or both tokens showing declining volume`);
        }

        const liquidity1 = token1.volume24h / token1.marketCap;
        const liquidity2 = token2.volume24h / token2.marketCap;
        
        if (liquidity1 > liquidity2 * 1.5) {
            insights.push(`${token1.name} shows better liquidity relative to market cap`);
        } else if (liquidity2 > liquidity1 * 1.5) {
            insights.push(`${token2.name} has superior liquidity efficiency`);
        }

        return insights.map(insight => `
            <div class="insight-item">
                <i class="fas fa-chart-line"></i>
                <span>${insight}</span>
            </div>
        `).join('');
    }

    // Utility methods
    formatVolume(volume) {
        if (volume >= 1e9) {
            return '$' + (volume / 1e9).toFixed(2) + 'B';
        } else if (volume >= 1e6) {
            return '$' + (volume / 1e6).toFixed(2) + 'M';
        } else if (volume >= 1e3) {
            return '$' + (volume / 1e3).toFixed(2) + 'K';
        }
        return '$' + volume.toFixed(2);
    }

    formatPercentage(percentage) {
        return percentage > 0 ? `+${percentage.toFixed(2)}%` : `${percentage.toFixed(2)}%`;
    }

    calculateVolumeRatio(volume1, volume2) {
        const ratio = volume1 / volume2;
        return ratio.toFixed(2) + 'x';
    }

    calculateMarketDepth(marketCap, volume) {
        const ratio = (volume / marketCap) * 100;
        return ratio.toFixed(2) + '%';
    }

    getVolumeAdvantageClass(vol1, vol2) {
        return vol1 > vol2 ? 'advantage-win' : 'advantage-lose';
    }

    getVolumeChangeAdvantageClass(change1, change2) {
        return change1 > change2 ? 'advantage-win' : 'advantage-lose';
    }

    getMarketDepthClass(mcap1, vol1, mcap2, vol2) {
        const depth1 = vol1 / mcap1;
        const depth2 = vol2 / mcap2;
        return depth1 > depth2 ? 'advantage-win' : 'advantage-lose';
    }

    compareValues(val1, val2) {
        const diff = ((val1 - val2) / val2) * 100;
        return diff > 0 ? `+${diff.toFixed(1)}% higher` : `${diff.toFixed(1)}% lower`;
    }

    comparePercentage(pct1, pct2) {
        const diff = pct1 - pct2;
        return diff > 0 ? `+${diff.toFixed(1)}% better` : `${diff.toFixed(1)}% worse`;
    }

    compareRatios(ratio1, ratio2) {
        const diff = ((ratio1 - ratio2) / ratio2) * 100;
        return diff > 0 ? `+${diff.toFixed(1)}% higher` : `${diff.toFixed(1)}% lower`;
    }

    getVolumeInsight(vol1, vol2) {
        const ratio = vol1 / vol2;
        if (ratio > 3) return 'Significantly more liquid';
        if (ratio > 1.5) return 'More actively traded';
        if (ratio > 0.67) return 'Similar liquidity';
        return 'Less liquid';
    }

    getVolumeChangeInsight(change1, change2) {
        if (change1 > 20 && change2 > 20) return 'Both growing strongly';
        if (change1 > change2 + 10) return 'Growing faster';
        if (change2 > change1 + 10) return 'Growth lagging';
        return 'Similar growth patterns';
    }

    getVolumeRatioInsight(ratio1, ratio2) {
        if (ratio1 > ratio2 * 1.5) return 'Better liquidity efficiency';
        if (ratio2 > ratio1 * 1.5) return 'Lower liquidity efficiency';
        return 'Comparable liquidity profiles';
    }

    addDownloadFunctionality(token1, token2) {
        const downloadBtn = document.getElementById('download-volume-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadVolumeReport(token1, token2);
            });
        }
    }

    downloadVolumeReport(token1, token2) {
        // In a real implementation, this would generate a PDF or CSV report
        const reportData = {
            title: `Volume Comparison Report: ${token1.name} vs ${token2.name}`,
            date: new Date().toLocaleDateString(),
            metrics: {
                volume24h: {
                    token1: token1.volume24h,
                    token2: token2.volume24h
                },
                volumeChange: {
                    token1: token1.volumeChange24h,
                    token2: token2.volumeChange24h
                }
            }
        };
        
        console.log('Volume report download triggered:', reportData);
        alert(`Volume comparison report for ${token1.name} vs ${token2.name} would be downloaded in a real implementation.`);
    }

    updatePeriod(period) {
        if (this.chart && window.cryptoCompare) {
            const { token1, token2 } = window.cryptoCompare.getCurrentComparison();
            if (token1 && token2) {
                this.renderChart(token1, token2, period);
            }
        }
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}