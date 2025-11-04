class TokenChart {
  constructor() {
    this.chart = null;
    this.ctx = document.getElementById('historical-chart').getContext('2d');
  }

  renderChart(quotes) {
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = quotes.map(q => new Date(q.timestamp).toLocaleDateString());
    const data = quotes.map(q => q.quote?.USD?.price || 0);

    this.chart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Price (USD)',
          data,
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderWidth: 3,
          tension: 0.1,
          fill: true,
          pointBackgroundColor: 'rgb(37, 99, 235)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1f2937',
            bodyColor: '#1f2937',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(229, 231, 235, 0.5)'
            },
            ticks: {
              color: '#6b7280'
            }
          },
          y: {
            grid: {
              color: 'rgba(229, 231, 235, 0.5)'
            },
            ticks: {
              color: '#6b7280',
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  createMockChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = [];
    const data = [];
    
    // Create realistic mock data
    let basePrice = 100 + Math.random() * 100;
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString());
      
      const change = (Math.random() - 0.5) * 20;
      basePrice = Math.max(50, basePrice + change);
      data.push(basePrice);
    }

    this.chart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Price (USD) - Sample Data',
          data,
          borderColor: 'rgb(124, 58, 237)',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          borderWidth: 3,
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}