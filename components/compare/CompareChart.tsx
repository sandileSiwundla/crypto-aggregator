'use client';

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
  Legend,
  LegendPayload,
} from 'recharts';

interface PricePoint {
  timestamp: string | number;
  quote?: { USD?: { price?: number } };
}

interface Token {
  name: string;
  symbol: string;
  logo?: string;
}

interface CompareChartProps {
  token1: Token;
  token2: Token;
  token1History: PricePoint[];
  token2History: PricePoint[];
  onPeriodChange?: (days: number) => void;
}

interface ChartDataPoint {
  date: string;
  token1Price: number;
  token2Price: number;
  token1Percentage: number;
  token2Percentage: number;
}

interface TooltipPayloadEntry {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
  payload: ChartDataPoint;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: TooltipPayloadEntry[];
  label?: string;
}

const timeRanges = [
  { label: '7D', days: 7 },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

/* Editorial palette — accent blue vs olive */
const SERIES_A = '#34567a'; // accent
const SERIES_B = '#8a6d1f'; // warning / olive

const CHART = {
  rule: '#e0dcd4',
  tick: '#8a92a0',
  paper: '#faf9f6',
  font: 'JetBrains Mono, SF Mono, Menlo, monospace',
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border border-rule bg-paper px-4 py-3 text-sm">
      <p className="label-caps mb-2">{label}</p>
      {payload.map((entry, index) => {
        const percentageKey = entry.dataKey
          ? (`${entry.dataKey}Percentage` as keyof ChartDataPoint)
          : undefined;
        const percentageValue = percentageKey
          ? (entry.payload[percentageKey] as number | undefined)
          : undefined;

        return (
          <div
            key={index}
            className="flex items-center gap-3 mb-1 last:mb-0"
          >
            <span
              className="w-2.5 h-2.5 flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-body text-xs text-slate-academic">
              {entry.name}
            </span>
            <span className="font-mono text-ink text-sm tabular-nums ml-auto">
              $
              {entry.value?.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}
            </span>
            {percentageValue !== undefined && (
              <span
                className={`font-mono text-xs tabular-nums ${
                  percentageValue >= 0 ? 'text-positive' : 'text-negative'
                }`}
              >
                {percentageValue >= 0 ? '+' : ''}
                {percentageValue.toFixed(2)}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CompareChart({
  token1,
  token2,
  token1History,
  token2History,
  onPeriodChange,
}: CompareChartProps) {
  const [viewMode, setViewMode] = useState<'price' | 'percentage'>('price');
  const [activeDays, setActiveDays] = useState(30);

  const chartData = useMemo(() => {
    if (!token1History.length || !token2History.length) return [];

    const maxLength = Math.min(token1History.length, token2History.length);
    const aligned: ChartDataPoint[] = [];

    for (let i = 0; i < maxLength; i++) {
      const t1 = token1History[i];
      const t2 = token2History[i];
      const t1Price = t1.quote?.USD?.price ?? 0;
      const t2Price = t2.quote?.USD?.price ?? 0;

      aligned.push({
        date: new Date(t1.timestamp).toLocaleDateString('en-ZA', {
          month: 'short',
          day: 'numeric',
        }),
        token1Price: t1Price,
        token2Price: t2Price,
        token1Percentage: 0,
        token2Percentage: 0,
      });
    }

    if (aligned.length > 0 && viewMode === 'percentage') {
      const base1 = aligned[0].token1Price;
      const base2 = aligned[0].token2Price;

      aligned.forEach((point) => {
        point.token1Percentage = ((point.token1Price - base1) / base1) * 100;
        point.token2Percentage = ((point.token2Price - base2) / base2) * 100;
      });
    }

    return aligned;
  }, [token1History, token2History, viewMode]);

  const handlePeriodClick = (days: number) => {
    setActiveDays(days);
    onPeriodChange?.(days);
  };

  const shell = 'border border-rule bg-paper mb-10';

  if (!token1History.length || !token2History.length) {
    return (
      <div className={shell}>
        <div className="px-6 py-3 border-b border-rule">
          <div className="label-caps">Comparative Price History</div>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="label-caps text-warning mb-2">Unavailable</div>
            <p className="font-body text-slate-academic text-sm">
              Historical data not available for comparison.
            </p>
            <p className="font-body text-slate-academic-dim text-xs mt-1">
              Try a different time range.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      {/* Header */}
      <div className="px-6 py-3 border-b border-rule flex flex-wrap items-center justify-between gap-4">
        <div className="label-caps">Comparative Price History</div>

        <div className="flex items-center gap-6 flex-wrap">
          {/* View mode toggle */}
          <div className="flex items-center gap-3">
            <span className="label-caps">View</span>
            <div className="flex gap-px bg-rule border border-rule">
              {(['price', 'percentage'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`font-ui text-[11px] tracking-[0.14em] uppercase px-3 py-1.5 transition-colors cursor-pointer ${
                    viewMode === mode
                      ? 'bg-ink text-paper'
                      : 'bg-paper text-slate-academic hover:text-ink'
                  }`}
                >
                  {mode === 'price' ? 'Price' : '% Change'}
                </button>
              ))}
            </div>
          </div>

          {/* Time range */}
          <div className="flex items-center gap-3">
            <span className="label-caps">Period</span>
            <div className="flex gap-px bg-rule border border-rule">
              {timeRanges.map((range) => (
                <button
                  key={range.days}
                  onClick={() => handlePeriodClick(range.days)}
                  className={`font-ui text-[11px] tracking-[0.14em] uppercase px-3 py-1.5 transition-colors cursor-pointer ${
                    activeDays === range.days
                      ? 'bg-ink text-paper'
                      : 'bg-paper text-slate-academic hover:text-ink'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 py-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              stroke={CHART.rule}
              strokeDasharray="0"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{
                fill: CHART.tick,
                fontSize: 11,
                fontFamily: CHART.font,
              }}
              tickLine={false}
              axisLine={{ stroke: CHART.rule }}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{
                fill: CHART.tick,
                fontSize: 11,
                fontFamily: CHART.font,
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                viewMode === 'percentage'
                  ? `${v.toFixed(0)}%`
                  : `$${v.toLocaleString()}`
              }
              width={viewMode === 'percentage' ? 56 : 78}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: CHART.rule, strokeWidth: 1 }}
            />

            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              iconType="square"
              iconSize={9}
              formatter={(value, _entry: LegendPayload | undefined) => (
                <span
                  style={{
                    color: '#5a6472',
                    fontSize: 12,
                    fontFamily: 'Charter, Iowan Old Style, Georgia, serif',
                  }}
                >
                  {value}
                </span>
              )}
            />

            <Line
              type="monotone"
              dataKey={
                viewMode === 'price' ? 'token1Price' : 'token1Percentage'
              }
              name={`${token1.symbol} · ${token1.name}`}
              stroke={SERIES_A}
              strokeWidth={1.5}
              dot={false}
              activeDot={{
                r: 4,
                fill: SERIES_A,
                stroke: CHART.paper,
                strokeWidth: 2,
              }}
            />

            <Line
              type="monotone"
              dataKey={
                viewMode === 'price' ? 'token2Price' : 'token2Percentage'
              }
              name={`${token2.symbol} · ${token2.name}`}
              stroke={SERIES_B}
              strokeWidth={1.5}
              dot={false}
              activeDot={{
                r: 4,
                fill: SERIES_B,
                stroke: CHART.paper,
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footnote */}
      <div className="px-6 py-3 border-t border-rule">
        <p className="label-caps text-center">
          {viewMode === 'price'
            ? 'Actual USD prices over time'
            : 'Percentage change normalized to period start'}
        </p>
      </div>
    </div>
  );
}