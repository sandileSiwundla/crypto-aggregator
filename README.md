# Crypto Aggregator - AssetView

A professional, academic-grade cryptocurrency research and analysis platform built with Next.js 15, TypeScript, and Tailwind CSS. Provides real-time crypto data, advanced analytics, and side-by-side token comparison tools.

## Features

### Token Analysis
- Real-time price data from CoinMarketCap API
- Comprehensive token metrics (Market Cap, Volume, Supply)
- Interactive price charts with historical data
- Performance tracking (1h, 24h, 7d, 30d changes)
- Tokenomics visualization with pie charts
- Supply metrics with circulation percentage

### Token Comparison
- Side-by-side comparison of any two cryptocurrencies
- Interactive comparison charts with dual-line visualization
- Toggle between price and percentage change views
- Configurable time ranges (7D, 14D, 30D, 90D)
- Detailed comparison tables with advantage highlighting
- Visual winner/loser indicators

### Market Data
- Top 100 cryptocurrencies ranking
- Sortable columns (Rank, Price, Market Cap, Volume, Change%)
- ZAR currency conversion for South African users
- Responsive tables with smooth interactions

### Search & Discovery
- Autocomplete search with suggestions
- Instant token lookup by name or symbol
- Quick navigation between tokens
- Smart fallback to CoinGecko API when needed

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **API**: CoinMarketCap API, CoinGecko API (fallback)
- **Deployment**: Vercel

## Installation

```bash
# Clone the repository
git clone https://github.com/sandileSiwundla/crypto-aggregator.git

# Navigate to project directory
cd crypto-aggregator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your CoinMarketCap API key to .env.local

# Run development server
npm run dev