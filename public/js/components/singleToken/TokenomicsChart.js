export class TokenomicsChart {
    constructor() {
        this.chart = null;
        this.ctx = document.getElementById('tokenomics-chart').getContext('2d');
        this.categories = [];
        this.walletData = new Map();
    }

    async initialize() {
        this.renderForm();
        this.attachEventListeners();
    }

    renderForm() {
        const container = document.getElementById('tokenomics-section');
        container.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-pie-chart"></i> Token Distribution</h2>
                <p>Visualize token allocation using wallet addresses</p>
            </div>
            
            <div class="tokenomics-controls">
                <div class="category-management">
                    <h3>Add Distribution Categories</h3>
                    <div class="category-form">
                        <div class="input-group">
                            <input type="text" id="category-name" placeholder="Category (e.g., Team, Investors, Treasury)" class="category-input">
                            <input type="text" id="wallet-address" placeholder="Wallet Address (0x...)" class="address-input">
                            <button type="button" id="add-category" class="add-btn">
                                <i class="fas fa-plus"></i> Add
                            </button>
                        </div>
                    </div>
                    
                    <div class="categories-list" id="categories-list">
                        <!-- Categories will be added here -->
                    </div>
                </div>

                <div class="chart-controls">
                    <button type="button" id="generate-chart" class="generate-btn">
                        <i class="fas fa-chart-pie"></i> Generate Tokenomics Chart
                    </button>
                    <button type="button" id="reset-categories" class="reset-btn">
                        <i class="fas fa-redo"></i> Reset
                    </button>
                </div>
            </div>

            <div class="chart-container">
                <canvas id="tokenomics-chart"></canvas>
            </div>

            <div class="tokenomics-summary hidden" id="tokenomics-summary">
                <!-- Summary will be populated here -->
            </div>
        `;
    }

    attachEventListeners() {
        document.getElementById('add-category').addEventListener('click', () => this.addCategory());
        document.getElementById('generate-chart').addEventListener('click', () => this.generateChart());
        document.getElementById('reset-categories').addEventListener('click', () => this.resetCategories());
        
        // Allow Enter key to add categories
        document.getElementById('category-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCategory();
        });
    }

    addCategory() {
        const categoryName = document.getElementById('category-name').value.trim();
        const walletAddress = document.getElementById('wallet-address').value.trim();

        if (!categoryName || !walletAddress) {
            this.showError('Please enter both category name and wallet address');
            return;
        }

        if (!this.isValidEthereumAddress(walletAddress)) {
            this.showError('Please enter a valid Ethereum wallet address (0x...)');
            return;
        }

        // Add to categories
        this.categories.push({
            name: categoryName,
            walletAddress: walletAddress,
            percentage: 0, // Will be calculated after fetching data
            balance: 0
        });

        this.updateCategoriesList();
        this.clearForm();
    }

    updateCategoriesList() {
        const list = document.getElementById('categories-list');
        list.innerHTML = this.categories.map((category, index) => `
            <div class="category-item" data-index="${index}">
                <div class="category-info">
                    <span class="category-name">${category.name}</span>
                    <span class="wallet-address">${this.shortenAddress(category.walletAddress)}</span>
                </div>
                <div class="category-actions">
                    <span class="category-percentage">${category.percentage}%</span>
                    <button type="button" class="remove-btn" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add remove event listeners
        list.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-btn').dataset.index);
                this.removeCategory(index);
            });
        });
    }

    removeCategory(index) {
        this.categories.splice(index, 1);
        this.updateCategoriesList();
    }

    async generateChart() {
        if (this.categories.length === 0) {
            this.showError('Please add at least one category');
            return;
        }

        try {
            this.showLoading();
            
            // Fetch token balances from DexScreener
            await this.fetchWalletBalances();
            
            // Calculate percentages
            this.calculatePercentages();
            
            // Render the chart
            this.renderChart();
            
            // Show summary
            this.showSummary();
            
        } catch (error) {
            console.error('Error generating tokenomics chart:', error);
            this.showError('Failed to generate chart: ' + error.message);
        }
    }

    async fetchWalletBalances() {
        // Note: DexScreener API doesn't directly provide wallet balances
        // We'll use a mock implementation for demonstration
        // In production, you'd need to use a wallet balance API or blockchain explorer
        
        for (let category of this.categories) {
            try {
                // Mock API call - replace with actual DexScreener or blockchain API
                const balance = await this.mockFetchWalletBalance(category.walletAddress);
                category.balance = balance;
                category.percentage = 0; // Reset, will calculate after all fetched
            } catch (error) {
                console.error(`Error fetching balance for ${category.name}:`, error);
                category.balance = 0;
            }
        }
    }

    async mockFetchWalletBalance(walletAddress) {
        // Mock implementation - replace with real API call
        // This simulates fetching token balance from DexScreener or blockchain
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate realistic mock balance based on address
                const mockBalance = Math.random() * 10000000 + 1000000;
                resolve(Math.floor(mockBalance));
            }, 500);
        });
    }

    calculatePercentages() {
        const totalBalance = this.categories.reduce((sum, category) => sum + category.balance, 0);
        
        this.categories.forEach(category => {
            category.percentage = totalBalance > 0 ? 
                ((category.balance / totalBalance) * 100) : 0;
        });

        // Sort by percentage (descending)
        this.categories.sort((a, b) => b.percentage - a.percentage);
        
        this.updateCategoriesList();
    }

    renderChart() {
        if (this.chart) {
            this.chart.destroy();
        }

        const labels = this.categories.map(cat => cat.name);
        const data = this.categories.map(cat => cat.percentage);
        const backgroundColors = this.generateColors(this.categories.length);

        this.chart = new Chart(this.ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: '#1e293b',
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#f8fafc',
                            font: {
                                size: 12,
                                family: 'Inter'
                            },
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const category = this.categories[context.dataIndex];
                                return [
                                    `${label}: ${value.toFixed(2)}%`,
                                    `Balance: ${category.balance.toLocaleString()} tokens`,
                                    `Wallet: ${this.shortenAddress(category.walletAddress)}`
                                ];
                            }
                        },
                        backgroundColor: 'rg(30, 41, 59, 0.95)',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: '#475569',
                        borderWidth: 1
                    }
                },
                cutout: '60%',
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    generateColors(count) {
        const baseColors = [
            '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
            '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#ec4899',
            '#14b8a6', '#84cc16', '#eab308', '#a855f7', '#f43f5e'
        ];
        
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    }

    showSummary() {
        const summary = document.getElementById('tokenomics-summary');
        const totalBalance = this.categories.reduce((sum, cat) => sum + cat.balance, 0);
        
        summary.innerHTML = `
            <h3>Token Distribution Summary</h3>
            <div class="summary-stats">
                <div class="stat">
                    <span class="stat-label">Total Categories</span>
                    <span class="stat-value">${this.categories.length}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Total Supply Tracked</span>
                    <span class="stat-value">${totalBalance.toLocaleString()}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Largest Allocation</span>
                    <span class="stat-value">${this.categories[0]?.name || 'N/A'}</span>
                </div>
            </div>
            
            <div class="distribution-details">
                <h4>Detailed Breakdown</h4>
                ${this.categories.map(category => `
                    <div class="distribution-item">
                        <div class="dist-info">
                            <span class="dist-name">${category.name}</span>
                            <span class="dist-wallet">${this.shortenAddress(category.walletAddress)}</span>
                        </div>
                        <div class="dist-numbers">
                            <span class="dist-percentage">${category.percentage.toFixed(2)}%</span>
                            <span class="dist-balance">${category.balance.toLocaleString()} tokens</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        summary.classList.remove('hidden');
    }

    // Utility methods
    isValidEthereumAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    shortenAddress(address, chars = 6) {
        return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
    }

    clearForm() {
        document.getElementById('category-name').value = '';
        document.getElementById('wallet-address').value = '';
        document.getElementById('category-name').focus();
    }

    resetCategories() {
        this.categories = [];
        this.walletData.clear();
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        this.updateCategoriesList();
        document.getElementById('tokenomics-summary').classList.add('hidden');
        this.clearForm();
    }

    showLoading() {
        // You can implement a loading state here
        const generateBtn = document.getElementById('generate-chart');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching Data...';
        generateBtn.disabled = true;

        setTimeout(() => {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }, 1000);
    }

    showError(message) {
        // Simple error display - you can enhance this with a proper notification system
        alert(message);
    }
}