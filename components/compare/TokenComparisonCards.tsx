'use client';

import React from 'react';
import {
  formatNumber,
  formatChange,
  getChangeClass,
} from '@/lib/tokenUtils';

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

function TokenCard({
  token,
  rank,
  isLeader,
  usdToZar,
  side,
}: {
  token: Token;
  rank: number;
  isLeader: boolean;
  usdToZar?: number;
  side: 'A' | 'B';
}) {
  const usd = token.quote?.USD;
  const price = usd?.price ?? 0;
  const zarPrice = usdToZar ? price * usdToZar : null;
  const change = usd?.percent_change_24h;
  const changeClass = getChangeClass(change);

  const changeTone =
    changeClass === 'positive'
      ? 'text-positive'
      : changeClass === 'negative'
      ? 'text-negative'
      : 'text-slate-academic';

  const changeBg =
    changeClass === 'positive'
      ? 'bg-positive-bg'
      : changeClass === 'negative'
      ? 'bg-negative-bg'
      : '';

  return (
    <article className="border border-rule bg-paper">
      {/* Side marker bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-rule">
        <div className="label-caps">Asset {side}</div>
        <div className="flex items-center gap-3">
          {isLeader && (
            <span className="label-caps text-accent">
              Larger Mkt Cap
            </span>
          )}
          <span className="label-caps">Rank #{rank}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          {token.logo ? (
            <img
              src={token.logo}
              alt={token.name}
              className="w-14 h-14 object-contain border border-rule bg-paper-alt p-1"
            />
          ) : (
            <div className="w-14 h-14 border border-rule bg-paper-alt" />
          )}
          <div className="min-w-0">
            <h3 className="font-display text-2xl text-ink leading-tight truncate">
              {token.name}
            </h3>
            <p className="font-mono text-xs text-slate-academic tracking-wider mt-0.5">
              {token.symbol}
            </p>
          </div>
        </div>

        <div className="pb-4 mb-4 border-b border-rule">
          <div className="label-caps mb-2">Current Price</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-mono text-3xl text-ink tabular-nums tracking-tight">
              ${formatNumber(price)}
            </span>
            <span
              className={`font-mono text-xs tabular-nums px-1.5 py-0.5 ${changeTone} ${changeBg}`}
            >
              {formatChange(change)}
            </span>
          </div>
          {zarPrice && (
            <p className="font-mono text-xs text-slate-academic mt-1.5">
              ≈ R {formatNumber(zarPrice)} ZAR
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="label-caps mb-1">Market Cap</div>
            <p className="font-mono text-sm text-ink tabular-nums">
              ${formatNumber(usd?.market_cap ?? 0)}
            </p>
          </div>
          <div>
            <div className="label-caps mb-1">24h Volume</div>
            <p className="font-mono text-sm text-ink tabular-nums">
              ${formatNumber(usd?.volume_24h ?? 0)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function TokenComparisonCards({
  token1,
  token2,
  usdToZar,
}: TokenComparisonCardsProps) {
  const marketCap1 = token1.quote?.USD?.market_cap ?? 0;
  const marketCap2 = token2.quote?.USD?.market_cap ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <TokenCard
        token={token1}
        rank={token1.cmc_rank || 0}
        isLeader={marketCap1 > marketCap2}
        usdToZar={usdToZar}
        side="A"
      />
      <TokenCard
        token={token2}
        rank={token2.cmc_rank || 0}
        isLeader={marketCap2 > marketCap1}
        usdToZar={usdToZar}
        side="B"
      />
    </div>
  );
}