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

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-sm px-4 py-3 shadow-2xl text-sm">
      <p className="text-slate-400 mb-2 text-xs">{label}</p>
      {payload.map((entry: TooltipPayloadEntry, index: number) => {
        const percentageKey = entry.dataKey ? `${entry.dataKey}Percentage` as keyof ChartDataPoint : undefined;
        const percentageValue = percentageKey ? entry.payload[percentageKey] as number | undefined : undefined;

        return (
          <div key={index} className="flex items-center gap-3 mb-1 last:mb-0">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300 text-xs">{entry.name}:</span>
            <span className="text-white font-semibold text-sm">
              ${entry.value?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </span>
            {percentageValue !== undefined && (
              <span className={`text-xs font-medium ${
                percentageValue >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                ({percentageValue >= 0 ? '+' : ''}
                {percentageValue.toFixed(2)}%)
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
  onPeriodChange 
}: CompareChartProps) {
  const [viewMode, setViewMode] = useState<'price' | 'percentage'>('price');
  const [activeDays, setActiveDays] = useState(30);

  const chartData = useMemo(() => {
    if (!token1History.length || !token2History.length) return [];

    // Determine the min length and align data by date
    const maxLength = Math.min(token1History.length, token2History.length);
    const aligned: ChartDataPoint[] = [];

    for (let i = 0; i < maxLength; i++) {
      const t1 = token1History[i];
      const t2 = token2History[i];
      const t1Price = t1.quote?.USD?.price ?? 0;
      const t2Price = t2.quote?.USD?.price ?? 0;
      
      aligned.push({
        date: new Date(t1.timestamp).toLocaleDateString("en-ZA", { 
          month: 'short', 
          day: 'numeric' 
        }),
        token1Price: t1Price,
        token2Price: t2Price,
        token1Percentage: 0,
        token2Percentage: 0,
      });
    }

    // Calculate percentage change from first value
    if (aligned.length > 0 && viewMode === 'percentage') {
      const base1 = aligned[0].token1Price;
      const base2 = aligned[0].token2Price;
      
      aligned.forEach(point => {
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

  if (!token1History.length || !token2History.length) {
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl shadow-black/40">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-slate-400 text-center">
            <p>Historical data not available for comparison</p>
            <p className="text-sm mt-2">Try a different time range</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl shadow-black/40">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold text-lg">Price Comparison</h3>
          {/* View toggle */}
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('price')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === 'price'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Price
            </button>
            <button
              onClick={() => setViewMode('percentage')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === 'percentage'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              % Change
            </button>
          </div>
        </div>

        {/* Time range selector */}
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.days}
              onClick={() => handlePeriodClick(range.days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeDays === range.days
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorToken1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="colorToken2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
          
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => viewMode === 'percentage' ? `${v.toFixed(0)}%` : `$${v.toLocaleString()}`}
            width={viewMode === 'percentage' ? 50 : 70}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend
            wrapperStyle={{ paddingTop: 16 }}
            formatter={(value, entry: LegendPayload | undefined) => (
              <span className="text-slate-300 text-sm font-medium">{value}</span>
            )}
          />
          
          <Line
            type="monotone"
            dataKey={viewMode === 'price' ? 'token1Price' : 'token1Percentage'}
            name={`${token1.symbol} (${token1.name})`}
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            fill="url(#colorToken1)"
          />
          
          <Line
            type="monotone"
            dataKey={viewMode === 'price' ? 'token2Price' : 'token2Percentage'}
            name={`${token2.symbol} (${token2.name})`}
            stroke="#8b5cf6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
            fill="url(#colorToken2)"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend explanation */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 text-center">
        <p className="text-slate-500 text-xs">
          {viewMode === 'price' 
            ? 'Comparing actual USD prices over time' 
            : 'Comparing percentage change from starting point (normalized view)'}
        </p>
      </div>
    </div>
  );
}