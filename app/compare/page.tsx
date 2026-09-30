'use client';

import { useState, useCallback } from 'react';
import CompareForm from '@/components/compare/CompareForm';
import CompareChart from '@/components/compare/CompareChart';
import CompareTable from '@/components/compare/CompareTable';
import TokenComparisonCards from '@/components/compare/TokenComparisonCards';
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
    } catch (err: unknown) {
      console.error('Comparison error:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch comparison data';
      setError(message);
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
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Masthead */}
        <header className="border-b border-rule pb-6 mb-10">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div>
              <div className="label-caps mb-2">AssetView · § II</div>
              <h1 className="text-3xl font-display">Comparative Analysis</h1>
            </div>
            <p className="hidden md:block label-caps">
              Side-by-side · Two assets
            </p>
          </div>
        </header>

        {/* Compare Form */}
        <CompareForm onCompare={handleCompare} loading={loading} />

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <ErrorMessage message={error} onRetry={handleRetry} />
        )}

        {/* Results */}
        {token1 && token2 && !loading && (
          <div className="space-y-10">
            <TokenComparisonCards
              token1={token1}
              token2={token2}
              usdToZar={usdToZar || undefined}
            />

            <CompareChart
              token1={token1}
              token2={token2}
              token1History={token1History}
              token2History={token2History}
              onPeriodChange={handlePeriodChange}
            />

            <CompareTable
              token1={token1}
              token2={token2}
              usdToZar={usdToZar || undefined}
            />
          </div>
        )}

        {/* Empty state */}
        {!token1 && !token2 && !loading && !error && (
          <div className="py-24 text-center border-t border-rule">
            <div className="label-caps mb-4">Awaiting query</div>
            <p className="font-display text-xl text-ink-dim max-w-lg mx-auto leading-relaxed">
              Enter two token names or symbols above to begin
              your comparative analysis.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}