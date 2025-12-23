"use client";


export class TokenSearch {
    constructor(onCompare) {
        this.onCompare = onCompare;
        this.form = document.getElementById('compare-form');
        this.token1Input = document.getElementById('token1-input');
        this.token2Input = document.getElementById('token2-input');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const token1 = this.token1Input.value.trim();
            const token2 = this.token2Input.value.trim();
            this.onCompare(token1, token2);
        });

        // Add input event listeners for suggestions
        this.token1Input.addEventListener('input', this.handleTokenInput.bind(this, 'token1'));
        this.token2Input.addEventListener('input', this.handleTokenInput.bind(this, 'token2'));
        
        // Close suggestions when clicking outside
        document.addEventListener('click', this.closeAllSuggestions.bind(this));
    }

    async handleTokenInput(tokenField, e) {
        const input = e.target;
        const query = input.value.trim();
        
        if (query.length < 2) {
            this.hideSuggestions(tokenField);
            return;
        }
        
        const suggestions = await this.getTokenSuggestions(query);
        this.showSuggestions(tokenField, suggestions);
    }

    async getTokenSuggestions(query) {
        // Mock suggestions - replace with actual API call
        const popularTokens = [
            { name: 'Bitcoin', symbol: 'BTC', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png' },
            { name: 'Ethereum', symbol: 'ETH', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
            { name: 'Binance Coin', symbol: 'BNB', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' },
            { name: 'Cardano', symbol: 'ADA', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png' },
            { name: 'Solana', symbol: 'SOL', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png' }
        ];
        
        const queryLower = query.toLowerCase();
        return popularTokens.filter(token => 
            token.name.toLowerCase().includes(queryLower) || 
            token.symbol.toLowerCase().includes(queryLower)
        );
    }

    showSuggestions(tokenField, suggestions) {
        const suggestionsEl = document.getElementById(`${tokenField}-suggestions`);
        
        if (suggestions.length === 0) {
            suggestionsEl.style.display = 'none';
            return;
        }
        
        suggestionsEl.innerHTML = suggestions.map(token => `
            <div class="suggestion-item" data-name="${token.name}" data-symbol="${token.symbol}">
                ${token.logo ? `<img src="${token.logo}" alt="${token.name}" class="suggestion-logo">` : ''}
                <span class="suggestion-name">${token.name}</span>
                <span class="suggestion-symbol">${token.symbol}</span>
            </div>
        `).join('');
        
        suggestionsEl.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const input = document.getElementById(`${tokenField}-input`);
                input.value = item.dataset.name;
                this.hideSuggestions(tokenField);
            });
        });
        
        suggestionsEl.style.display = 'block';
    }

    hideSuggestions(tokenField) {
        const suggestionsEl = document.getElementById(`${tokenField}-suggestions`);
        suggestionsEl.style.display = 'none';
    }

    closeAllSuggestions(e) {
        if (!e.target.closest('.token-input-group')) {
            this.hideSuggestions('token1');
            this.hideSuggestions('token2');
        }
    }
}