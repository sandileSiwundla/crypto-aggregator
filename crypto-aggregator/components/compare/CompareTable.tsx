'use client';

import React from 'react';
import { formatNumber, formatChange, getChangeClass, calculateVolumeRatio, formatSupply } from '@/lib/tokenUtils';

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
}

interface CompareTableProps {
  token1: Token;
  token2: Token;
  usdToZar?: number;
}

interface MetricRow {
  metric: string;
  token1Value: string;
  token2Value: string;
  advantage?: 'token1' | 'token2' | 'draw';
  format?: 'price' | 'change' | 'supply' | 'metric';
}

export default function CompareTable({ token1, token2, usdToZar }: CompareTableProps) {
  const usd1 = token1.quote?.USD;
  const usd2 = token2.quote?.USD;

  const calculateAdvantage = (value1: number | undefined, value2: number | undefined, metric: string): 'token1' | 'token2' | 'draw' => {
    if (value1 === undefined || value2 === undefined) return 'draw';
    
    // For rank, lower is better
    if (metric.includes('Rank')) {
      return value1 < value2 ? 'token1' : value1 > value2 ? 'token2' : 'draw';
    }
    
    // For change percentages, higher is better (can be negative or positive)
    if (metric.includes('Change')) {
      return value1 > value2 ? 'token1' : value1 < value2 ? 'token2' : 'draw';
    }
    
    // For all other metrics, higher is better
    return value1 > value2 ? 'token1' : value1 < value2 ? 'token2' : 'draw';
  };

  const getAdvantageStyle = (advantage: 'token1' | 'token2' | 'draw', side: 'token1' | 'token2') => {
    if (advantage === 'draw') return 'bg-blue-900/20 border-blue-500/30';
    if ((advantage === 'token1' && side === 'token1') || (advantage === 'token2' && side === 'token2')) {
      return 'bg-emerald-900/30 border-emerald-500/30 ring-1 ring-emerald-500/20';
    }
    return 'bg-red-900/20 border-red-500/20';
  };

  const metrics: MetricRow[] = [
    {
      metric: 'Market Cap Rank',
      token1Value: `#${token1.cmc_rank || 'N/A'}`,
      token2Value: `#${token2.cmc_rank || 'N/A'}`,
      advantage: calculateAdvantage(token1.cmc_rank, token2.cmc_rank, 'Rank'),
    },
    {
      metric: 'Price (USD)',
      token1Value: `$${formatNumber(usd1?.price || 0)}`,
      token2Value: `$${formatNumber(usd2?.price || 0)}`,
      advantage: calculateAdvantage(usd1?.price, usd2?.price, 'Price'),
      format: 'price',
    },
    ...(usdToZar ? [{
      metric: 'Price (ZAR)',
      token1Value: `R ${formatNumber((usd1?.price || 0) * usdToZar)}`,
      token2Value: `R ${formatNumber((usd2?.price || 0) * usdToZar)}`,
      advantage: calculateAdvantage(usd1?.price, usd2?.price, 'Price'),
    }] : []),
    {
      metric: 'Market Cap',
      token1Value: `$${formatNumber(usd1?.market_cap || 0)}`,
      token2Value: `$${formatNumber(usd2?.market_cap || 0)}`,
      advantage: calculateAdvantage(usd1?.market_cap, usd2?.market_cap, 'Market Cap'),
      format: 'metric',
    },
    {
      metric: '24h Volume',
      token1Value: `$${formatNumber(usd1?.volume_24h || 0)}`,
      token2Value: `$${formatNumber(usd2?.volume_24h || 0)}`,
      advantage: calculateAdvantage(usd1?.volume_24h, usd2?.volume_24h, 'Volume'),
      format: 'metric',
    },
    {
      metric: 'Volume / MCap',
      token1Value: `${calculateVolumeRatio(token1)}%`,
      token2Value: `${calculateVolumeRatio(token2)}%`,
      advantage: calculateAdvantage(
        parseFloat(calculateVolumeRatio(token1)),
        parseFloat(calculateVolumeRatio(token2)),
        'Ratio'
      ),
    },
    {
      metric: '24h Change',
      token1Value: formatChange(usd1?.percent_change_24h),
      token2Value: formatChange(usd2?.percent_change_24h),
      advantage: calculateAdvantage(usd1?.percent_change_24h, usd2?.percent_change_24h, 'Change'),
      format: 'change',
    },
    {
      metric: '7d Change',
      token1Value: formatChange(usd1?.percent_change_7d),
      token2Value: formatChange(usd2?.percent_change_7d),
      advantage: calculateAdvantage(usd1?.percent_change_7d, usd2?.percent_change_7d, 'Change'),
      format: 'change',
    },
    {
      metric: '30d Change',
      token1Value: formatChange(usd1?.percent_change_30d),
      token2Value: formatChange(usd2?.percent_change_30d),
      advantage: calculateAdvantage(usd1?.percent_change_30d, usd2?.percent_change_30d, 'Change'),
      format: 'change',
    },
    {
      metric: 'Circulating Supply',
      token1Value: token1.circulating_supply ? formatSupply(token1.circulating_supply) : 'N/A',
      token2Value: token2.circulating_supply ? formatSupply(token2.circulating_supply) : 'N/A',
      advantage: calculateAdvantage(token1.circulating_supply, token2.circulating_supply, 'Supply'),
      format: 'supply',
    },
    {
      metric: 'Total Supply',
      token1Value: token1.total_supply ? formatSupply(token1.total_supply) : 'N/A',
      token2Value: token2.total_supply ? formatSupply(token2.total_supply) : 'N/A',
    },
    {
      metric: 'Max Supply',
      token1Value: token1.max_supply ? formatSupply(token1.max_supply) : 'Infinite',
      token2Value: token2.max_supply ? formatSupply(token2.max_supply) : 'Infinite',
    },
    {
      metric: 'Platform',
      token1Value: token1.platform?.name || 'Native',
      token2Value: token2.platform?.name || 'Native',
    },
  ];

  const getChangeColor = (value: string) => {
    if (value.includes('+')) return 'text-emerald-400';
    if (value.includes('-')) return 'text-red-400';
    return 'text-slate-300';
  };

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl shadow-black/40 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-3 bg-gradient-to-r from-blue-900/60 to-purple-900/60 border-b border-blue-500/30">
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-3">
            {token1.logo && (
              <img src={token1.logo} alt={token1.name} className="w-8 h-8 rounded-full" />
            )}
            <div>
              <div className="text-white font-bold">{token1.name}</div>
              <div className="text-slate-400 text-xs">{token1.symbol}</div>
            </div>
          </div>
        </div>
        <div className="p-4 text-center text-slate-400 font-semibold text-sm border-x border-blue-500/30">
          Metric
        </div>
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-3">
            {token2.logo && (
              <img src={token2.logo} alt={token2.name} className="w-8 h-8 rounded-full" />
            )}
            <div>
              <div className="text-white font-bold">{token2.name}</div>
              <div className="text-slate-400 text-xs">{token2.symbol}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-slate-700/50">
        {metrics.map((item, idx) => (
          <div key={idx} className="grid grid-cols-3 hover:bg-slate-800/50 transition-colors">
            {/* Token 1 Value */}
            <div className={`p-4 text-center border-r border-slate-700/50 ${getAdvantageStyle(item.advantage || 'draw', 'token1')}`}>
              <span className={`font-semibold ${item.format === 'change' ? getChangeColor(item.token1Value) : 'text-blue-200'}`}>
                {item.token1Value}
              </span>
            </div>
            
            {/* Metric Name */}
            <div className="p-4 text-center text-slate-400 text-sm font-medium border-r border-slate-700/50">
              {item.metric}
            </div>
            
            {/* Token 2 Value */}
            <div className={`p-4 text-center ${getAdvantageStyle(item.advantage || 'draw', 'token2')}`}>
              <span className={`font-semibold ${item.format === 'change' ? getChangeColor(item.token2Value) : 'text-purple-200'}`}>
                {item.token2Value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 text-center border-t border-slate-700/50 bg-slate-900/50">
        <p className="text-slate-500 text-xs">
          🏆 Green indicates advantage &nbsp;|&nbsp; 
          📊 Data from CoinMarketCap &nbsp;|&nbsp;
          🔄 Values update in real-time
        </p>
      </div>
    </div>
  );
}