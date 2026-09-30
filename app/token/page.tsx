'use client';

import { useState, useCallback } from 'react';
import CryptoDetail, { CryptoDetailLoading, CryptoDetailError } from '@/components/single/CryptoDetail';
import PriceChart from '@/components/single/PriceChart';
import TokenAnalysis from '@/components/single/TokenAnalysis';
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

  const fetchTokenData = useCallback(async (name: string) => {
    const res = await fetch(`/api/single/${encodeURIComponent(name)}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch data');
    return result;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cryptoName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const tokenData = await fetchTokenData(cryptoName);
      setData(tokenData);
    } catch (err: unknown) {
      console.error('Fetch error:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch cryptocurrency data';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = useCallback(() => {
    setError(null);
    setCryptoName('');
    setData(null);
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Masthead */}
        <header className="border-b border-rule pb-6 mb-10">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div>
              <div className="label-caps mb-2">AssetView · § I</div>
              <h1 className="text-3xl font-display">Token Analysis</h1>
            </div>
            <p className="hidden md:block label-caps">
              Research · Not investment advice
            </p>
          </div>
        </header>

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex gap-4 items-end mb-12 max-w-2xl">
          <div className="flex-1">
            <label className="label-caps block mb-2">
              Enter token name or symbol
            </label>
            <input
              type="text"
              value={cryptoName}
              onChange={(e) => setCryptoName(e.target.value)}
              placeholder="Bitcoin, BTC, Ethereum…"
              className="input-academic"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !cryptoName.trim()}
            className="btn-academic-primary mb-px"
          >
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="space-y-6">
            <CryptoDetailLoading />
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="space-y-6">
            <CryptoDetailError message={error} />
            <ErrorMessage message={error} onRetry={handleRetry} />
          </div>
        )}

        {/* Results */}
        {data?.coin && !loading && (
          <article className="space-y-10">
            <CryptoDetail coin={data.coin} usdToZar={data.usdToZar || undefined} />

            <TokenAnalysis token={data.coin} />

            <PriceChart
              cryptoName={cryptoName}
              symbol={data.coin.symbol}
              height={320}
              days={30}
            />
          </article>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <div className="py-24 text-center border-t border-rule">
            <div className="label-caps mb-4">Awaiting query</div>
            <p className="font-display text-xl text-ink-dim max-w-md mx-auto leading-relaxed">
              Enter a token above to begin your analysis.
              Results will include price history, supply,
              and fundamental metrics.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}