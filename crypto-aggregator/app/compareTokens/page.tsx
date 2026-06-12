'use client';

import { useState, useCallback } from 'react';
import CompareForm from '@/components/compare/CompareForm';
import CompareChart from '@/components/CompareChart';
import CompareTable from '@/components/CompareTable';
import TokenComparisonCards from '@/components/TokenComparisonCards';
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

interface PricePoint {
  timestamp: string | number;
  quote?: { USD?: { price?: number } };
}

export default function ComparePage() {
  const [token1, setToken1] = useState<Token | null>(null);
  const [token2, setToken2] = useState<Token | null>(null);
  const [token1History, setToken1History] = useState<PricePoint[]>([]);
  const [token2History, setToken2History] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usdToZar, setUsdToZar] = useState<number | null>(null);

  const fetchTokenData = useCallback(async (name: string) => {
    const res = await fetch(`/api/single/${encodeURIComponent(name)}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch data');
    return result;
  }, []);

  const fetchHistoricalData = useCallback(async (name: string, days: number = 30) => {
    try {
      const res = await fetch(`/api/single/${encodeURIComponent(name)}/priceData?days=${days}`);
      if (!res.ok) return [];
      const result = await res.json();
      return result.quotes || [];
    } catch {
      return [];
    }
  }, []);

  const handleCompare = async (tokenName1: string, tokenName2: string, days: number = 30) => {
    if (!tokenName1.trim() || !tokenName2.trim()) {
      setError('Please enter both cryptocurrency names');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch both tokens and their historical data in parallel
      const [data1, data2, history1, history2] = await Promise.all([
        fetchTokenData(tokenName1),
        fetchTokenData(tokenName2),
        fetchHistoricalData(tokenName1, days),
        fetchHistoricalData(tokenName2, days),
      ]);

      setToken1(data1.coin);
      setToken2(data2.coin);
      setToken1History(history1);
      setToken2History(history2);
      setUsdToZar(data1.usdToZar || data2.usdToZar || null);
    } catch (err: any) {
      console.error('Comparison error:', err);
      setError(err.message || 'Failed to fetch comparison data');
      setToken1(null);
      setToken2(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = async (days: number) => {
    if (!token1 || !token2) return;

    setLoading(true);
    try {
      const [history1, history2] = await Promise.all([
        fetchHistoricalData(token1.name, days),
        fetchHistoricalData(token2.name, days),
      ]);
      setToken1History(history1);
      setToken2History(history2);
    } catch (err) {
      console.error('Failed to update historical data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setToken1(null);
    setToken2(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">⚖️</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Crypto Asset Comparator
            </h1>
          </div>
          <p className="text-slate-400">
            Side-by-side analysis of any two cryptocurrencies
          </p>
        </header>

        {/* Compare Form */}
        <CompareForm onCompare={handleCompare} loading={loading} />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorMessage message={error} onRetry={handleRetry} />
        )}

        {/* Comparison Results */}
        {token1 && token2 && !loading && (
          <div className="space-y-6">
            {/* Token Comparison Cards */}
            <TokenComparisonCards token1={token1} token2={token2} usdToZar={usdToZar || undefined} />

            {/* Price Comparison Chart */}
            <CompareChart
              token1={token1}
              token2={token2}
              token1History={token1History}
              token2History={token2History}
              onPeriodChange={handlePeriodChange}
            />

            {/* Detailed Comparison Table */}
            <CompareTable token1={token1} token2={token2} usdToZar={usdToZar || undefined} />
          </div>
        )}

        {/* Empty State */}
        {!token1 && !token2 && !loading && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl text-white font-semibold mb-2">Compare Any Two Cryptocurrencies</h3>
            <p className="text-slate-400">
              Enter two token names or symbols above to start your analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}