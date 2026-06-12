'use client';

import { useState } from 'react';
import CryptoDetail, { CryptoDetailLoading, CryptoDetailError } from '@/components/CryptoDetail';
import CryptoTable from '@/components/CryptoTable';
import PriceChart from '@/components/PriceChart';
import TokenomicsChart from '@/components/TokenomicsChart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

// Type definitions based on your components
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

interface PricePoint {
  timestamp: string;
  quote?: { USD?: { price?: number } };
}

export default function TokenPage() {
  const [cryptoName, setCryptoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [historicalData, setHistoricalData] = useState<PricePoint[] | null>(null);
  const [allCoins, setAllCoins] = useState<Token[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cryptoName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch single token data
      const res = await fetch(`/api/single/${encodeURIComponent(cryptoName)}`);
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error);
      setData(result);

      // Fetch historical data for chart
      try {
        const historicalRes = await fetch(`/api/single/${encodeURIComponent(cryptoName)}/historical`);
        const historicalResult = await historicalRes.json();
        if (historicalResult.quotes?.length) {
          setHistoricalData(historicalResult.quotes);
        }
      } catch (histErr) {
        console.warn('Historical data not available, using mock data');
      }

      // Fetch top coins for the table (optional)
      const listingsRes = await fetch('/api/cryptocurrency/listings/latest?limit=10');
      if (listingsRes.ok) {
        const listings = await listingsRes.json();
        setAllCoins(listings.data || []);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (token: Token) => {
    setCryptoName(token.name);
    handleSubmit(new Event('submit') as any);
  };

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
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <>
            <CryptoDetailError message={error} />
            <ErrorMessage message={error} onRetry={() => window.location.reload()} />
          </>
        )}

        {/* Data Display */}
        {data && !loading && (
          <div className="space-y-6">

            {/* Crypto Detail - more detailed view with description and links */}
            <CryptoDetail coin={data.coin} usdToZar={data.usdToZar || undefined} />

            {/* Price Chart */}
            <PriceChart 
              quotes={historicalData || undefined}
              symbol={data.coin.symbol}
              mock={!historicalData}
              height={320}
            />

            {/* Tokenomics Chart */}
            <TokenomicsChart />

            {/* Top Cryptocurrencies Table */}
            <div className="mt-6">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-blue-400">📊</span> Top Cryptocurrencies
              </h3>
              <CryptoTable 
                coins={allCoins.length > 0 ? allCoins : [data.coin]} 
                usdToZar={data.usdToZar || undefined}
                onRowClick={handleRowClick}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}