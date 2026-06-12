'use client';

import { useState, useEffect, useCallback } from 'react';

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

  const fetchSuggestions = useCallback(async (query: string): Promise<CryptoSuggestion[]> => {
    if (query.length < 2) return [];
    try {
      const res = await fetch(`/api/cryptocurrency/listings/latest?limit=10`);
      const data = await res.json();
      if (data.data) {
        return (data.data as Partial<CryptoSuggestion>[])
          .filter((coin) =>
            (coin.name ?? '').toLowerCase().includes(query.toLowerCase()) ||
            (coin.symbol ?? '').toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5) as CryptoSuggestion[];
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  const handleTokenInput = async (field: 'token1' | 'token2', value: string) => {
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

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Token 1 Input */}
        <div className="relative">
          <label className="block text-slate-300 text-sm font-medium mb-2">First Cryptocurrency</label>
          <input
            type="text"
            value={token1}
            onChange={(e) => handleTokenInput('token1', e.target.value)}
            onFocus={() => setShowSuggestions1(true)}
            placeholder="e.g., Bitcoin, BTC, Ethereum..."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            disabled={loading}
          />
          {showSuggestions1 && suggestions1.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
              {suggestions1.map((coin) => (
                <div
                  key={coin.id}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={() => {
                    setToken1(coin.name);
                    setShowSuggestions1(false);
                  }}
                >
                  {coin.logo && (
                    <img src={coin.logo} alt={coin.name} className="w-6 h-6 rounded-full" />
                  )}
                  <div>
                    <div className="text-white font-medium">{coin.name}</div>
                    <div className="text-slate-400 text-xs">{coin.symbol}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Token 2 Input */}
        <div className="relative">
          <label className="block text-slate-300 text-sm font-medium mb-2">Second Cryptocurrency</label>
          <input
            type="text"
            value={token2}
            onChange={(e) => handleTokenInput('token2', e.target.value)}
            onFocus={() => setShowSuggestions2(true)}
            placeholder="e.g., Solana, SOL, Cardano..."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            disabled={loading}
          />
          {showSuggestions2 && suggestions2.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
              {suggestions2.map((coin) => (
                <div
                  key={coin.id}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={() => {
                    setToken2(coin.name);
                    setShowSuggestions2(false);
                  }}
                >
                  {coin.logo && (
                    <img src={coin.logo} alt={coin.name} className="w-6 h-6 rounded-full" />
                  )}
                  <div>
                    <div className="text-white font-medium">{coin.name}</div>
                    <div className="text-slate-400 text-xs">{coin.symbol}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !token1 || !token2}
        className="mt-4 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
      >
        {loading ? 'Comparing...' : 'Compare Assets'}
      </button>
    </form>
  );
}