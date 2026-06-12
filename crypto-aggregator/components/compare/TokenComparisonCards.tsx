'use client';

import React from 'react';
import { formatNumber, formatChange, getChangeClass } from '@/utils/tokenUtils';

interface TokenQuote {
  price: number;
  percent_change_24h?: number;
  market_cap?: number;
  volume_24h?: number;
}

interface Token {
  name: string;
  symbol: string;
  logo?: string;
  cmc_rank?: number;
  quote?: { USD?: TokenQuote };
}

interface TokenComparisonCardsProps {
  token1: Token;
  token2: Token;
  usdToZar?: number;
}

function TokenCard({ token, rank, gradient, usdToZar }: { token: Token; rank: number; gradient: string; usdToZar?: number }) {
  const usd = token.quote?.USD;
  const price = usd?.price ?? 0;
  const zarPrice = usdToZar ? price * usdToZar : null;
  const change = usd?.percent_change_24h;
  const changeClass = getChangeClass(change);

  return (
    <div className={`relative rounded-2xl border border-blue-500/20 bg-gradient-to-br ${gradient} p-6 shadow-xl shadow-black/40 transition-all hover:-translate-y-1`}>
      {/* Rank badge */}
      <div className="absolute top-4 right-4">
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
          #{rank}
        </span>
      </div>

      {/* Token header */}
      <div className="flex items-center gap-4 mb-4">
        {token.logo ? (
          <img src={token.logo} alt={token.name} className="w-16 h-16 rounded-2xl shadow-lg shadow-blue-500/20" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-800 to-blue-500" />
        )}
        <div>
          <h3 className="text-white text-xl font-bold">{token.name}</h3>
          <p className="text-slate-400 text-sm">{token.symbol}</p>
        </div>
      </div>

      {/* Price info */}
      <div className="space-y-2">
        <div>
          <p className="text-slate-400 text-xs mb-1">Current Price</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-blue-300 text-2xl font-bold">
              ${formatNumber(price)}
            </span>
            <span className={`text-sm font-semibold px-2 py-0.5 rounded ${
              changeClass === 'positive' ? 'text-emerald-300 bg-emerald-900/30' : 
              changeClass === 'negative' ? 'text-red-300 bg-red-900/30' : 'text-slate-400'
            }`}>
              {formatChange(change)}
            </span>
          </div>
          {zarPrice && (
            <p className="text-slate-400 text-xs mt-1">
              R {formatNumber(zarPrice)} ZAR
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <p className="text-slate-400 text-xs">Market Cap</p>
            <p className="text-white font-semibold text-sm">${formatNumber(usd?.market_cap ?? 0)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">24h Volume</p>
            <p className="text-white font-semibold text-sm">${formatNumber(usd?.volume_24h ?? 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TokenComparisonCards({ token1, token2, usdToZar }: TokenComparisonCardsProps) {
  // Determine which token has higher market cap for highlighting
  const marketCap1 = token1.quote?.USD?.market_cap ?? 0;
  const marketCap2 = token2.quote?.USD?.market_cap ?? 0;
  
  const token1Gradient = marketCap1 > marketCap2 
    ? 'from-emerald-900/30 to-slate-800 border-emerald-500/30' 
    : 'from-slate-900 to-slate-800';
  const token2Gradient = marketCap2 > marketCap1 
    ? 'from-emerald-900/30 to-slate-800 border-emerald-500/30' 
    : 'from-slate-900 to-slate-800';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
      <TokenCard 
        token={token1} 
        rank={token1.cmc_rank || 0} 
        gradient={token1Gradient}
        usdToZar={usdToZar}
      />
      <TokenCard 
        token={token2} 
        rank={token2.cmc_rank || 0} 
        gradient={token2Gradient}
        usdToZar={usdToZar}
      />
    </div>
  );
}