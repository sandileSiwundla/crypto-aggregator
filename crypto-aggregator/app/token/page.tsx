'use client';

import { useState } from 'react';
import TokenChart from '@/components/single/TokenChart';
import TokenDetails from '@/components/single/TokenDetails';
import TokenTable from '@/components/single/TokenTable';
import TokenAnalysis from '@/components/single/TokenAnalysis';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function TokenPage() {
  const [cryptoName, setCryptoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cryptoName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/single/${encodeURIComponent(cryptoName)}`);
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            CryptoResearch Analytics
          </h1>
          <p className="text-gray-600">
            Academic-grade cryptocurrency analysis for research purposes
          </p>
        </header>

        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={cryptoName}
              onChange={(e) => setCryptoName(e.target.value)}
              placeholder="e.g., Bitcoin, BTC, Ethereum, ETH..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Analyze
            </button>
          </form>
        </div>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        
        {data && (
          <div className="space-y-8">
            <TokenAnalysis data={data} />
            <TokenDetails data={data} />
            <TokenChart cryptoName={cryptoName} />
            <TokenTable data={data} />
          </div>
        )}
      </div>
    </div>
  );
}