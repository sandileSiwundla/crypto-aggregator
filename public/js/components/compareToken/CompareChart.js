export class CompareChart {
    constructor() {
        this.chart = null;
        this.ctx = document.getElementById('comparison-chart').getContext('2d');
    }

    render(token1Data, token2Data) {
        if (this.chart) {
            this.chart.destroy();
        }

        const labels = this.generateDateLabels(30);
        const token1Prices = this.generateMockPriceData(token1Data.coin.quote?.USD?.price || 100, 30);
        const token2Prices = this.generateMockPriceData(token2Data.coin.quote?.USD?.price || 100, 30);
        
        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: token1Data.coin.name,
                        data: token1Prices,
                        borderColor: 'rgb(37, 99, 235)',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 3,
                        tension: 0.1,
                        fill: false
                    },
                    {
                        label: token2Data.coin.name,
                        data: token2Prices,
                        borderColor: 'rgb(124, 58, 237)',
                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                        borderWidth: 3,
                        tension: 0.1,
                        fill: false
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
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(229, 231, 235, 0.5)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(229, 231, 235, 0.5)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    generateDateLabels(days) {
        const labels = [];
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString());
        }
        return labels;
    }

    generateMockPriceData(basePrice, days) {
        const data = [basePrice];
        let currentPrice = basePrice;
        
        for (let i = 1; i <= days; i++) {
            const change = (Math.random() - 0.5) * 0.1;
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