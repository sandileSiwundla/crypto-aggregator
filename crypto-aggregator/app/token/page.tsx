'use client';

import { useState, useCallback } from 'react';
import CryptoDetail, { CryptoDetailLoading, CryptoDetailError } from '@/components/CryptoDetail';
import CryptoTable from '@/components/CryptoTable';
import PriceChart from '@/components/PriceChart';
import TokenomicsChart from '@/components/TokenomicsChart';
import TokenAnalysis from '@/components/TokenAnalysis';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface TokenQuote {
  price: number;
  percent_change_1h?: number;
  percent_change_24h?: number;
  percent_change_7d?: number;
  percent_change_30d?: number;
  market_cap?: number;
  fully_diluted_market_cap?: number;
  volume_24h?: number;
}

interface Token {
  id: number;
  name: string;
  symbol: string;
  logo?: string;
  cmc_rank?: number;
  circulating_supply?: number;
  total_supply?: number;
  max_supply?: number;
  platform?: { name: string };
  quote?: { USD?: TokenQuote };
  description?: string;
  urls?: {
    website?: string[];
    technical_doc?: string[];
    source_code?: string[];
  };
}

interface ApiResponse {
  coin: Token;
  usdToZar: number | null;
}

export default function TokenPage() {
  const [cryptoName, setCryptoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [allCoins, setAllCoins] = useState<Token[]>([]);
  
  // Remove historicalData state since PriceChart will handle its own data fetching
  // const [historicalData, setHistoricalData] = useState<PricePoint[] | null>(null);

  const fetchTokenData = useCallback(async (name: string) => {
    const res = await fetch(`/api/single/${encodeURIComponent(name)}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch data');
    return result;
  }, []);

  const fetchTopCoins = useCallback(async () => {
    try {
      const res = await fetch('/api/cryptocurrency/listings/latest?limit=10');
      if (!res.ok) return [];
      const listings = await res.json();
      return listings.data || [];
    } catch {
      return [];
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cryptoName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Only fetch token data and top coins, PriceChart will fetch its own historical data
      const [tokenData, topCoins] = await Promise.all([
        fetchTokenData(cryptoName),
        fetchTopCoins()
      ]);

      setData(tokenData);
      setAllCoins(topCoins);
      
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch cryptocurrency data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = useCallback((token: Token) => {
    setCryptoName(token.name);
    // Use setTimeout to ensure state is updated before submitting
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(fakeEvent);
    }, 0);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setCryptoName('');
    setData(null);
    setAllCoins([]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🔬</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CryptoResearch Analytics
            </h1>
          </div>
          <p className="text-slate-400">
            Academic-grade cryptocurrency analysis for research purposes
          </p>
        </header>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={cryptoName}
              onChange={(e) => setCryptoName(e.target.value)}
              placeholder="e.g., Bitcoin, BTC, Ethereum, ETH..."
              className="flex-1 px-5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-5">
            <CryptoDetailLoading />
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="space-y-5">
            <CryptoDetailError message={error} />
            <ErrorMessage message={error} onRetry={handleRetry} />
          </div>
        )}

        {/* Data Display */}
        {data?.coin && !loading && (
          <div className="space-y-6">
            {/* Token Analysis - Overview, Supply Metrics, Performance */}
            <TokenAnalysis token={data.coin} />

            {/* Crypto Detail - Description and links */}
            <CryptoDetail coin={data.coin} usdToZar={data.usdToZar || undefined} />

            {/* Price Chart - Now handles its own data fetching */}
            <PriceChart 
              cryptoName={cryptoName}  // Pass the crypto name for API calls
              symbol={data.coin.symbol}  // Display symbol
              height={320}  // Chart height in pixels
              days={30}  // Show last 30 days (can be 7, 14, 30, 90)
            />

            {/* Tokenomics Chart - Interactive pie chart */}
            <TokenomicsChart />

            {/* Top Cryptocurrencies Table */}
            {allCoins.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-blue-400">📊</span> Top Cryptocurrencies
                </h3>
                <CryptoTable 
                  coins={allCoins} 
                  usdToZar={data.usdToZar || undefined}
                  onRowClick={handleRowClick}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty State - No data and not loading */}
        {!data && !loading && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl text-white font-semibold mb-2">Search for a Cryptocurrency</h3>
            <p className="text-slate-400">
              Enter a token name or symbol above to start your research
            </p>
          </div>
        )}
      </div>
    </div>
  );
}