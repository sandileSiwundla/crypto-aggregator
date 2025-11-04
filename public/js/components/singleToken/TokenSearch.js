class TokenSearch {
  constructor(onSearch) {
    this.onSearch = onSearch;
    this.container = document.getElementById('search-section');
    this.form = null;
    this.input = null;
    this.button = null;
    
    this.init();
  }

  init() {
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

    // Cache DOM elements
    this.form = document.getElementById('crypto-form');
    this.input = document.getElementById('crypto-name');
    this.button = this.form.querySelector('.search-btn');
  }

  attachEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Add interactive effects
    this.input.addEventListener('focus', () => {
      this.input.parentElement.style.transform = 'scale(1.02)';
    });

    this.input.addEventListener('blur', () => {
      this.input.parentElement.style.transform = 'scale(1)';
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const cryptoName = this.input.value.trim();
    
    if (!cryptoName) {
      this.showError('Please enter a cryptocurrency name');
      return;
    }

    this.onSearch(cryptoName);
  }

  showError(message) {
    // You can replace this with a nicer notification system
    alert(message);
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
      this.button.disabled = true;
    } else {
      this.button.innerHTML = '<i class="fas fa-chart-bar"></i> Analyze Data';
      this.button.disabled = false;
    }
  }

  // Optional: Method to clear the input
  clearInput() {
    this.input.value = '';
  }

  // Optional: Method to focus on the input
  focusInput() {
    this.input.focus();
  }
}