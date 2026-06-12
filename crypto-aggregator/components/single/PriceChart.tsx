// app/components/PriceChart.tsx (updated version)
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from "recharts";

export interface PricePoint {
  timestamp: string | number;
  quote?: { USD?: { price?: number } };
}

interface ChartDataPoint {
  date: string;
  price: number;
}

function buildChartData(quotes: PricePoint[]): ChartDataPoint[] {
  return quotes.map((q) => ({
    date: new Date(q.timestamp).toLocaleDateString("en-ZA", { month: "short", day: "numeric" }),
    price: q.quote?.USD?.price ?? 0,
  }));
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: Array<{ value?: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-blue-700/40 bg-slate-900/95 px-4 py-3 shadow-2xl text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-blue-300 font-bold text-base">
        ${payload[0].value?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
      </p>
    </div>
  );
}

interface PriceChartProps {
  cryptoName?: string;
  symbol?: string;
  height?: number;
  days?: number;
}

export default function PriceChart({ cryptoName, symbol = "TOKEN", height = 280, days = 30 }: PriceChartProps) {
  const [quotes, setQuotes] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    async function fetchPriceData() {
      if (!cryptoName) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/single/${cryptoName}/priceData?days=${days}`);
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setQuotes(data.quotes || []);
        setUsingMockData(data.usingMockData || false);
        
        if (data.quotes.length === 0) {
          setError('No price data available');
        }
      } catch (err) {
        console.error('Failed to fetch price data:', err);
        setError('Failed to load price data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPriceData();
  }, [cryptoName, days]);

  const chartData = useMemo(() => {
    if (quotes.length === 0) return [];
    return buildChartData(quotes);
  }, [quotes]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl shadow-black/40 mb-5">
        <div className="flex items-center justify-center h-[280px]">
          <div className="text-slate-400">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl shadow-black/40 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold text-base">{symbol} Price History</h4>
        </div>
        <div className="flex items-center justify-center h-[280px]">
          <div className="text-amber-400 text-center">
            <p>Unable to load price data</p>
            <p className="text-sm text-slate-400 mt-2">{error || 'No data available'}</p>
          </div>
        </div>
      </div>
    );
  }

  const minPrice = Math.min(...chartData.map((d) => d.price)) * 0.98;
  const maxPrice = Math.max(...chartData.map((d) => d.price)) * 1.02;

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl shadow-black/40 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-semibold text-base">{symbol} Price History (Last {days} days)</h4>
        {usingMockData && (
          <span className="text-xs text-amber-400/80 border border-amber-400/20 px-2 py-0.5 rounded-full">
            Estimated Data
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e3a5f" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
            width={72}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#priceGrad)"
            dot={false}
            activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}