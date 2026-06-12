
"use client";

import React, { useMemo } from "react";
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

function buildMockData(): ChartDataPoint[] {
  let base = 100 + Math.random() * 100;
  return Array.from({ length: 31 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    base = Math.max(50, base + (Math.random() - 0.5) * 20);
    return {
      date: date.toLocaleDateString("en-ZA", { month: "short", day: "numeric" }),
      price: parseFloat(base.toFixed(4)),
    };
  });
}

// Custom tooltip card
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
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
  quotes?: PricePoint[];
  /** Symbol shown in the axis and heading */
  symbol?: string;
  /** If true, uses randomly generated mock data */
  mock?: boolean;
  height?: number;
}

export default function PriceChart({ quotes, symbol = "TOKEN", mock = false, height = 280 }: PriceChartProps) {
  const data = useMemo(
    () => (mock || !quotes?.length ? buildMockData() : buildChartData(quotes)),
    [quotes, mock]
  );

  const minPrice = Math.min(...data.map((d) => d.price)) * 0.98;
  const maxPrice = Math.max(...data.map((d) => d.price)) * 1.02;

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl shadow-black/40 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-semibold text-base">{symbol} Price History</h4>
        {mock && (
          <span className="text-xs text-amber-400/80 border border-amber-400/20 px-2 py-0.5 rounded-full">
            Sample data
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
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