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
                        label: `${token1Data.coin.name} (%)`,
                        data: token1Percentage,
                        borderColor: 'rgb(37, 99, 235)',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 3,
                        tension: 0.2,
                        fill: false,
                        pointBackgroundColor: 'rgb(37, 99, 235)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    },
                    {
                        label: `${token2Data.coin.name} (%)`,
                        data: token2Percentage,
                        borderColor: 'rgb(124, 58, 237)',
                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                        borderWidth: 3,
                        tension: 0.2,
                        fill: false,
                        pointBackgroundColor: 'rgb(124, 58, 237)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label = label.replace(' (%)', '');
                                }
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
                            color: 'rgba(229, 231, 235, 0.5)'
                        },
                        ticks: {
                            maxTicksLimit: period <= 30 ? 10 : 8
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(229, 231, 235, 0.5)'
                        },
                        ticks: {
                            callback: function(value) {
                                const sign = value >= 0 ? '+' : '';
                                return `${sign}${value}%`;
                            }
                        },
                        beginAtZero: true
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
            if (days <= 30) {
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
                // For long periods, show month only or month/year
                label = date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: days > 180 ? 'numeric' : undefined
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
        const baseVolatility = 0.05;
        const volatility = baseVolatility * Math.sqrt(days / 30); // Scale volatility with period
        
        for (let i = 1; i <= days; i++) {
            // More realistic price movements with period-adjusted volatility
            const highVolatility = Math.random() < 0.1; // 10% chance of high volatility
            const currentVolatility = highVolatility ? volatility * 3 : volatility;
            const change = (Math.random() - 0.5) * currentVolatility;
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