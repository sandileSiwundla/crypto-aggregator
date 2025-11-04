class TokenSearch {
  constructor(onSearch) {
    this.onSearch = onSearch;
    this.container = document.getElementById('search-section');
    this.render();
    this.attachEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="section-header">
        <h2><i class="fas fa-search"></i> Research Query</h2>
        <p>Enter any cryptocurrency name or symbol</p>
      </div>
      <form id="crypto-form" class="search-form">
        <div class="input-group">
          <input type="text" id="crypto-name" placeholder="e.g., Bitcoin, BTC, Ethereum, ETH..." autocomplete="off">
          <button type="submit" class="search-btn">
            <i class="fas fa-chart-bar"></i>
            Analyze Data
          </button>
        </div>
      </form>
    `;
  }

  attachEvents() {
    const form = document.getElementById('crypto-form');
    const input = document.getElementById('crypto-name');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const cryptoName = input.value.trim();
      
      if (!cryptoName) {
        this.showError('Please enter a cryptocurrency name');
        return;
      }

      this.onSearch(cryptoName);
    });

    // Add interactive effects
    input.addEventListener('focus', () => {
      input.parentElement.style.transform = 'scale(1.02)';
    });

    input.addEventListener('blur', () => {
      input.parentElement.style.transform = 'scale(1)';
    });
  }

  showError(message) {
    alert(message); // You can replace this with a nicer notification
  }

  setLoading(isLoading) {
    const button = this.container.querySelector('.search-btn');
    if (isLoading) {
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
      button.disabled = true;
    } else {
      button.innerHTML = '<i class="fas fa-chart-bar"></i> Analyze Data';
      button.disabled = false;
    }
  }
}