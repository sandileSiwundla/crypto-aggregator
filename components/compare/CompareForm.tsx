'use client';

import { useState, useCallback } from 'react';

interface CompareFormProps {
  onCompare: (token1: string, token2: string, days?: number) => void;
  loading: boolean;
}

type CryptoSuggestion = {
  id: number;
  name: string;
  symbol: string;
  logo?: string;
};

export default function CompareForm({ onCompare, loading }: CompareFormProps) {
  const [token1, setToken1] = useState('');
  const [token2, setToken2] = useState('');
  const [suggestions1, setSuggestions1] = useState<CryptoSuggestion[]>([]);
  const [suggestions2, setSuggestions2] = useState<CryptoSuggestion[]>([]);
  const [showSuggestions1, setShowSuggestions1] = useState(false);
  const [showSuggestions2, setShowSuggestions2] = useState(false);

  const fetchSuggestions = useCallback(
    async (query: string): Promise<CryptoSuggestion[]> => {
      if (query.length < 2) return [];
      try {
        const res = await fetch(
          `/api/cryptocurrency/listings/latest?limit=10`
        );
        const data = await res.json();
        if (data.data) {
          return (data.data as Partial<CryptoSuggestion>[])
            .filter(
              (coin) =>
                (coin.name ?? '').toLowerCase().includes(query.toLowerCase()) ||
                (coin.symbol ?? '')
                  .toLowerCase()
                  .includes(query.toLowerCase())
            )
            .slice(0, 5) as CryptoSuggestion[];
        }
        return [];
      } catch {
        return [];
      }
    },
    []
  );

  const handleTokenInput = async (
    field: 'token1' | 'token2',
    value: string
  ) => {
    if (field === 'token1') {
      setToken1(value);
      const suggestions = await fetchSuggestions(value);
      setSuggestions1(suggestions);
      setShowSuggestions1(true);
    } else {
      setToken2(value);
      const suggestions = await fetchSuggestions(value);
      setSuggestions2(suggestions);
      setShowSuggestions2(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCompare(token1, token2);
  };

  const renderSuggestions = (
    suggestions: CryptoSuggestion[],
    onPick: (name: string) => void
  ) => (
    <div className="absolute z-10 w-full mt-1 bg-paper border border-rule">
      {suggestions.map((coin) => (
        <div
          key={coin.id}
          className="flex items-center gap-3 px-4 py-3 hover:bg-paper-alt cursor-pointer transition-colors border-b border-rule last:border-0"
          onClick={() => onPick(coin.name)}
        >
          {coin.logo && (
            <img
              src={coin.logo}
              alt={coin.name}
              className="w-6 h-6 object-contain"
            />
          )}
          <div className="min-w-0">
            <div className="font-body text-ink truncate">{coin.name}</div>
            <div className="font-mono text-[11px] text-slate-academic tracking-wider">
              {coin.symbol}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Token 1 */}
        <div className="relative">
          <label className="label-caps block mb-2">Asset A</label>
          <input
            type="text"
            value={token1}
            onChange={(e) => handleTokenInput('token1', e.target.value)}
            onFocus={() => setShowSuggestions1(true)}
            placeholder="Bitcoin, BTC, Ethereum…"
            className="input-academic"
            disabled={loading}
          />
          {showSuggestions1 &&
            suggestions1.length > 0 &&
            renderSuggestions(suggestions1, (name) => {
              setToken1(name);
              setShowSuggestions1(false);
            })}
        </div>

        {/* Token 2 */}
        <div className="relative">
          <label className="label-caps block mb-2">Asset B</label>
          <input
            type="text"
            value={token2}
            onChange={(e) => handleTokenInput('token2', e.target.value)}
            onFocus={() => setShowSuggestions2(true)}
            placeholder="Solana, SOL, Cardano…"
            className="input-academic"
            disabled={loading}
          />
          {showSuggestions2 &&
            suggestions2.length > 0 &&
            renderSuggestions(suggestions2, (name) => {
              setToken2(name);
              setShowSuggestions2(false);
            })}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={loading || !token1 || !token2}
          className="btn-academic-primary"
        >
          {loading ? 'Comparing…' : 'Compare Assets'}
        </button>
      </div>
    </form>
  );
}