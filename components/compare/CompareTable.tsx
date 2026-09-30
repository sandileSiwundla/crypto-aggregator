'use client';

import React from 'react';
import {
  formatNumber,
  formatChange,
  getChangeClass,
  calculateVolumeRatio,
  formatSupply,
} from '@/lib/tokenUtils';

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

export default function CompareTable({
  token1,
  token2,
  usdToZar,
}: CompareTableProps) {
  const usd1 = token1.quote?.USD;
  const usd2 = token2.quote?.USD;

  const calculateAdvantage = (
    value1: number | undefined,
    value2: number | undefined,
    metric: string
  ): 'token1' | 'token2' | 'draw' => {
    if (value1 === undefined || value2 === undefined) return 'draw';

    if (metric.includes('Rank')) {
      return value1 < value2 ? 'token1' : value1 > value2 ? 'token2' : 'draw';
    }

    if (metric.includes('Change')) {
      return value1 > value2 ? 'token1' : value1 < value2 ? 'token2' : 'draw';
    }

    return value1 > value2 ? 'token1' : value1 < value2 ? 'token2' : 'draw';
  };

  const metrics: MetricRow[] = [
    {
      metric: 'Market Cap Rank',
      token1Value: `#${token1.cmc_rank || 'N/A'}`,
      token2Value: `#${token2.cmc_rank || 'N/A'}`,
      advantage: calculateAdvantage(
        token1.cmc_rank,
        token2.cmc_rank,
        'Rank'
      ),
    },
    {
      metric: 'Price (USD)',
      token1Value: `$${formatNumber(usd1?.price || 0)}`,
      token2Value: `$${formatNumber(usd2?.price || 0)}`,
      advantage: calculateAdvantage(usd1?.price, usd2?.price, 'Price'),
      format: 'price',
    },
    ...(usdToZar
      ? [
          {
            metric: 'Price (ZAR)',
            token1Value: `R ${formatNumber(
              (usd1?.price || 0) * usdToZar
            )}`,
            token2Value: `R ${formatNumber(
              (usd2?.price || 0) * usdToZar
            )}`,
            advantage: calculateAdvantage(
              usd1?.price,
              usd2?.price,
              'Price'
            ),
          },
        ]
      : []),
    {
      metric: 'Market Cap',
      token1Value: `$${formatNumber(usd1?.market_cap || 0)}`,
      token2Value: `$${formatNumber(usd2?.market_cap || 0)}`,
      advantage: calculateAdvantage(
        usd1?.market_cap,
        usd2?.market_cap,
        'Market Cap'
      ),
      format: 'metric',
    },
    {
      metric: '24h Volume',
      token1Value: `$${formatNumber(usd1?.volume_24h || 0)}`,
      token2Value: `$${formatNumber(usd2?.volume_24h || 0)}`,
      advantage: calculateAdvantage(
        usd1?.volume_24h,
        usd2?.volume_24h,
        'Volume'
      ),
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
      advantage: calculateAdvantage(
        usd1?.percent_change_24h,
        usd2?.percent_change_24h,
        'Change'
      ),
      format: 'change',
    },
    {
      metric: '7d Change',
      token1Value: formatChange(usd1?.percent_change_7d),
      token2Value: formatChange(usd2?.percent_change_7d),
      advantage: calculateAdvantage(
        usd1?.percent_change_7d,
        usd2?.percent_change_7d,
        'Change'
      ),
      format: 'change',
    },
    {
      metric: '30d Change',
      token1Value: formatChange(usd1?.percent_change_30d),
      token2Value: formatChange(usd2?.percent_change_30d),
      advantage: calculateAdvantage(
        usd1?.percent_change_30d,
        usd2?.percent_change_30d,
        'Change'
      ),
      format: 'change',
    },
    {
      metric: 'Circulating Supply',
      token1Value: token1.circulating_supply
        ? formatSupply(token1.circulating_supply)
        : 'N/A',
      token2Value: token2.circulating_supply
        ? formatSupply(token2.circulating_supply)
        : 'N/A',
      advantage: calculateAdvantage(
        token1.circulating_supply,
        token2.circulating_supply,
        'Supply'
      ),
      format: 'supply',
    },
    {
      metric: 'Total Supply',
      token1Value: token1.total_supply
        ? formatSupply(token1.total_supply)
        : 'N/A',
      token2Value: token2.total_supply
        ? formatSupply(token2.total_supply)
        : 'N/A',
    },
    {
      metric: 'Max Supply',
      token1Value: token1.max_supply
        ? formatSupply(token1.max_supply)
        : 'Infinite',
      token2Value: token2.max_supply
        ? formatSupply(token2.max_supply)
        : 'Infinite',
    },
    {
      metric: 'Platform',
      token1Value: token1.platform?.name || 'Native',
      token2Value: token2.platform?.name || 'Native',
    },
  ];

  const getChangeTone = (value: string) => {
    if (value.includes('+')) return 'text-positive';
    if (value.includes('-')) return 'text-negative';
    return 'text-ink';
  };

  /**
   * Advantage styling: subtle, editorial.
   * - Winning cell: soft accent text (no glow)
   * - Losing cell: default ink
   * - Draw: default ink
   */
  const getCellTone = (
    advantage: 'token1' | 'token2' | 'draw' | undefined,
    side: 'token1' | 'token2'
  ) => {
    if (!advantage || advantage === 'draw') return 'text-ink';
    if (advantage === side) return 'text-accent';
    return 'text-slate-academic';
  };

  return (
    <div className="border border-rule bg-paper">
      {/* Table header */}
      <div className="grid grid-cols-3 border-b border-rule-heavy">
        {/* Token 1 */}
        <div className="p-4 border-r border-rule">
          <div className="flex items-center gap-3">
            {token1.logo && (
              <img
                src={token1.logo}
                alt={token1.name}
                className="w-8 h-8 object-contain"
              />
            )}
            <div className="min-w-0">
              <div className="font-display text-ink truncate">
                {token1.name}
              </div>
              <div className="font-mono text-[11px] text-slate-academic tracking-wider">
                {token1.symbol}
              </div>
            </div>
          </div>
        </div>

        {/* Metric label */}
        <div className="p-4 flex items-center justify-center border-r border-rule">
          <span className="label-caps">Metric</span>
        </div>

        {/* Token 2 */}
        <div className="p-4">
          <div className="flex items-center gap-3 justify-end text-right">
            <div className="min-w-0">
              <div className="font-display text-ink truncate">
                {token2.name}
              </div>
              <div className="font-mono text-[11px] text-slate-academic tracking-wider">
                {token2.symbol}
              </div>
            </div>
            {token2.logo && (
              <img
                src={token2.logo}
                alt={token2.name}
                className="w-8 h-8 object-contain"
              />
            )}
          </div>
        </div>
      </div>

      {/* Table body */}
      <div>
        {metrics.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-3 border-b border-rule last:border-b-0 hover:bg-paper-alt transition-colors"
          >
            {/* Token 1 value */}
            <div className="p-4 border-r border-rule">
              <span
                className={`font-mono text-sm tabular-nums ${
                  item.format === 'change'
                    ? getChangeTone(item.token1Value)
                    : getCellTone(item.advantage, 'token1')
                }`}
              >
                {item.token1Value}
              </span>
            </div>

            {/* Metric name */}
            <div className="p-4 flex items-center justify-center border-r border-rule">
              <span className="font-body text-xs text-slate-academic text-center">
                {item.metric}
              </span>
            </div>

            {/* Token 2 value */}
            <div className="p-4 text-right">
              <span
                className={`font-mono text-sm tabular-nums ${
                  item.format === 'change'
                    ? getChangeTone(item.token2Value)
                    : getCellTone(item.advantage, 'token2')
                }`}
              >
                {item.token2Value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="px-6 py-3 border-t border-rule">
        <p className="label-caps text-center">
          Accent indicates advantageous value · Data from CoinMarketCap
        </p>
      </div>
    </div>
  );
}