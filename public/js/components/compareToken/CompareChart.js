export class CompareChart {
    constructor() {
        this.chart = null;
        this.ctx = document.getElementById('comparison-chart').getContext('2d');
        this.currentPeriod = 30; // Default period
        this.currentToken1 = null;
        this.currentToken2 = null;
    }

    render(token1Data, token2Data, period = 30) {
        if (this.chart) {
            this.chart.destroy();
        }

        this.currentPeriod = period;
        this.currentToken1 = token1Data;
        this.currentToken2 = token2Data;

        const labels = this.generateDateLabels(period);
        const token1Prices = this.generateMockPriceData(token1Data.coin.quote?.USD?.price || 100, period);
        const token2Prices = this.generateMockPriceData(token2Data.coin.quote?.USD?.price || 100, period);
        
        // Convert to percentage change from starting price
        const token1Percentage = this.calculatePercentageChange(token1Prices);
        const token2Percentage = this.calculatePercentageChange(token2Prices);
        
        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: `${token1Data.coin.name}`,
                        data: token1Percentage,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: false,
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 1,
                        pointRadius: 1.5,
                        pointHoverRadius: 3,
                        pointHitRadius: 4
                    },
                    {
                        label: `${token2Data.coin.name}`,
                        data: token2Percentage,
                        borderColor: 'rgb(139, 92, 246)',
                        backgroundColor: 'rgba(139, 92, 246, 0.05)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: false,
                        pointBackgroundColor: 'rgb(139, 92, 246)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 1,
                        pointRadius: 1.5,
                        pointHoverRadius: 3,
                        pointHitRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            boxWidth: 6,
                            padding: 15,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#cbd5e1',
                        bodyColor: '#e2e8f0',
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                        borderWidth: 1,
                        padding: 8,
                        cornerRadius: 6,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (context.parsed.y !== null) {
                                    const value = context.parsed.y;
                                    const sign = value >= 0 ? '+' : '';
                                    label += `: ${sign}${value.toFixed(2)}%`;
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 10
                            },
                            maxTicksLimit: period <= 30 ? 8 : 6
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 10
                            },
                            callback: function(value) {
                                const sign = value >= 0 ? '+' : '';
                                return `${sign}${value}%`;
                            },
                            padding: 8
                        },
                        beginAtZero: true
                    }
                },
                elements: {
                    line: {
                        tension: 0.3
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    }
                }
            }
        });
    }

    // Update period without changing tokens
    updatePeriod(period) {
        if (this.currentToken1 && this.currentToken2) {
            this.render(this.currentToken1, this.currentToken2, period);
        }
    }

    calculatePercentageChange(prices) {
        if (!prices.length) return [];
        const basePrice = prices[0];
        return prices.map(price => ((price - basePrice) / basePrice) * 100);
    }

    generateDateLabels(days) {
        const labels = [];
        const now = new Date();
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            let label;
            if (days <= 7) {
                // For 7 days, show day names
                label = date.toLocaleDateString('en-US', { weekday: 'short' });
            } else if (days <= 30) {
                // For short periods, show day and month
                label = date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
            } else if (days <= 90) {
                // For medium periods, show month and day
                label = date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
            } else {
                // For long periods, show month only
                label = date.toLocaleDateString('en-US', { 
                    month: 'short'
                });
            }
            
            labels.push(label);
        }
        return labels;
    }

    generateMockPriceData(basePrice, days) {
        const data = [basePrice];
        let currentPrice = basePrice;
        
        // Adjust volatility based on period
        const baseVolatility = 0.03; // Reduced volatility for cleaner lines
        const volatility = baseVolatility * Math.sqrt(days / 30);
        
        for (let i = 1; i <= days; i++) {
            // More realistic but smoother price movements
            const change = (Math.random() - 0.45) * volatility; // Slightly biased to be more realistic
            currentPrice = Math.max(0.1, currentPrice * (1 + change));
            data.push(currentPrice);
        }
        
        return data;
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}