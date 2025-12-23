"use client";


let chart = null;
let categories = [];
let walletData = new Map();

export function initializeTokenomics() {
    renderForm();
    attachEventListeners();
}

export function destroyTokenomicsChart() {
    if (chart) {
        chart.destroy();
        chart = null;
    }
    categories = [];
    walletData.clear();
}

function renderForm() {
    const container = document.getElementById('tokenomics-section');
    if (!container) return;

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

function attachEventListeners() {
    const addBtn = document.getElementById('add-category');
    const generateBtn = document.getElementById('generate-chart');
    const resetBtn = document.getElementById('reset-categories');

    if (addBtn) addBtn.addEventListener('click', addCategory);
    if (generateBtn) generateBtn.addEventListener('click', generateChart);
    if (resetBtn) resetBtn.addEventListener('click', resetCategories);
    
    const categoryInput = document.getElementById('category-name');
    if (categoryInput) {
        categoryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addCategory();
        });
    }
}

function addCategory() {
    const categoryNameInput = document.getElementById('category-name');
    const walletAddressInput = document.getElementById('wallet-address');

    if (!categoryNameInput || !walletAddressInput) return;

    const categoryName = categoryNameInput.value.trim();
    const walletAddress = walletAddressInput.value.trim();

    if (!categoryName || !walletAddress) {
        showError('Please enter both category name and wallet address');
        return;
    }

    if (!isValidEthereumAddress(walletAddress)) {
        showError('Please enter a valid Ethereum wallet address (0x...)');
        return;
    }

    // Add to categories
    categories.push({
        name: categoryName,
        walletAddress: walletAddress,
        percentage: 0,
        balance: 0
    });

    updateCategoriesList();
    clearForm();
}

function updateCategoriesList() {
    const list = document.getElementById('categories-list');
    if (!list) return;

    list.innerHTML = categories.map((category, index) => `
        <div class="category-item" data-index="${index}">
            <div class="category-info">
                <span class="category-name">${category.name}</span>
                <span class="wallet-address">${shortenAddress(category.walletAddress)}</span>
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
            removeCategory(index);
        });
    });
}

function removeCategory(index) {
    categories.splice(index, 1);
    updateCategoriesList();
}

async function generateChart() {
    if (categories.length === 0) {
        showError('Please add at least one category');
        return;
    }

    try {
        showLoading();
        
        // Fetch token balances
        await fetchWalletBalances();
        
        // Calculate percentages
        calculatePercentages();
        
        // Render the chart
        renderChart();
        
        // Show summary
        showSummary();
        
    } catch (error) {
        console.error('Error generating tokenomics chart:', error);
        showError('Failed to generate chart: ' + error.message);
    }
}

async function fetchWalletBalances() {
    for (let category of categories) {
        try {
            const balance = await mockFetchWalletBalance(category.walletAddress);
            category.balance = balance;
            category.percentage = 0;
        } catch (error) {
            console.error(`Error fetching balance for ${category.name}:`, error);
            category.balance = 0;
        }
    }
}

async function mockFetchWalletBalance(walletAddress) {
    // Mock implementation - replace with real API call
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockBalance = Math.random() * 10000000 + 1000000;
            resolve(Math.floor(mockBalance));
        }, 500);
    });
}

function calculatePercentages() {
    const totalBalance = categories.reduce((sum, category) => sum + category.balance, 0);
    
    categories.forEach(category => {
        category.percentage = totalBalance > 0 ? 
            ((category.balance / totalBalance) * 100) : 0;
    });

    // Sort by percentage (descending)
    categories.sort((a, b) => b.percentage - a.percentage);
    
    updateCategoriesList();
}

function renderChart() {
    const ctx = document.getElementById('tokenomics-chart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }

    const labels = categories.map(cat => cat.name);
    const data = categories.map(cat => cat.percentage);
    const backgroundColors = generateColors(categories.length);

    chart = new Chart(ctx, {
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
                            const category = categories[context.dataIndex];
                            return [
                                `${label}: ${value.toFixed(2)}%`,
                                `Balance: ${category.balance.toLocaleString()} tokens`,
                                `Wallet: ${shortenAddress(category.walletAddress)}`
                            ];
                        }
                    },
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#07203aff',
                    bodyColor: '#12519eff',
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

function generateColors(count) {
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

function showSummary() {
    const summary = document.getElementById('tokenomics-summary');
    if (!summary) return;

    const totalBalance = categories.reduce((sum, cat) => sum + cat.balance, 0);
    
    summary.innerHTML = `
        <h3>Token Distribution Summary</h3>
        <div class="summary-stats">
            <div class="stat">
                <span class="stat-label">Total Categories</span>
                <span class="stat-value">${categories.length}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Total Supply Tracked</span>
                <span class="stat-value">${totalBalance.toLocaleString()}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Largest Allocation</span>
                <span class="stat-value">${categories[0]?.name || 'N/A'}</span>
            </div>
        </div>
        
        <div class="distribution-details">
            <h4>Detailed Breakdown</h4>
            ${categories.map(category => `
                <div class="distribution-item">
                    <div class="dist-info">
                        <span class="dist-name">${category.name}</span>
                        <span class="dist-wallet">${shortenAddress(category.walletAddress)}</span>
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

// Utility functions
function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function shortenAddress(address, chars = 6) {
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

function clearForm() {
    const categoryName = document.getElementById('category-name');
    const walletAddress = document.getElementById('wallet-address');
    
    if (categoryName) categoryName.value = '';
    if (walletAddress) walletAddress.value = '';
    if (categoryName) categoryName.focus();
}

function resetCategories() {
    categories = [];
    walletData.clear();
    if (chart) {
        chart.destroy();
        chart = null;
    }
    updateCategoriesList();
    const summary = document.getElementById('tokenomics-summary');
    if (summary) summary.classList.add('hidden');
    clearForm();
}

function showLoading() {
    const generateBtn = document.getElementById('generate-chart');
    if (!generateBtn) return;

    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching Data...';
    generateBtn.disabled = true;

    setTimeout(() => {
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
    }, 1000);
}

function showError(message) {
    alert(message);
}