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

const CHART = {
  rule: "#e0dcd4",
  axis: "#5a6472",
  tick: "#8a92a0",
  accent: "#34567a",
  accentSoft: "#e8eef4",
  paper: "#faf9f6",
  font: "JetBrains Mono, SF Mono, Menlo, monospace",
};

function buildChartData(quotes: PricePoint[]): ChartDataPoint[] {
  return quotes.map((q) => ({
    date: new Date(q.timestamp).toLocaleDateString("en-ZA", {
      month: "short",
      day: "numeric",
    }),
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
    <div className="border border-rule bg-paper px-4 py-3 text-sm">
      <p className="label-caps mb-1">{label}</p>
      <p className="font-mono text-ink text-base tabular-nums">
        $
        {payload[0].value?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })}
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

export default function PriceChart({
  cryptoName,
  symbol = "TOKEN",
  height = 280,
  days = 30,
}: PriceChartProps) {
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
        const response = await fetch(
          `/api/single/${cryptoName}/priceData?days=${days}`
        );
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        setQuotes(data.quotes || []);
        setUsingMockData(data.usingMockData || false);

        if (data.quotes.length === 0) {
          setError("No price data available");
        }
      } catch (err) {
        console.error("Failed to fetch price data:", err);
        setError("Failed to load price data");
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

  const shell = "border border-rule bg-paper mb-10";

  if (loading) {
    return (
      <div className={shell}>
        <div className="px-6 py-3 border-b border-rule">
          <div className="label-caps">{symbol} · Price History</div>
        </div>
        <div className="flex items-center justify-center h-[280px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-5 h-5 border border-rule border-t-ink rounded-full animate-spin" />
            <div className="label-caps">Loading chart</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <div className={shell}>
        <div className="px-6 py-3 border-b border-rule">
          <div className="label-caps">{symbol} · Price History</div>
        </div>
        <div className="flex items-center justify-center h-[280px]">
          <div className="text-center">
            <div className="label-caps text-warning mb-2">Unavailable</div>
            <p className="font-body text-slate-academic text-sm">
              {error || "No data available"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const minPrice = Math.min(...chartData.map((d) => d.price)) * 0.98;
  const maxPrice = Math.max(...chartData.map((d) => d.price)) * 1.02;

  return (
    <div className={shell}>
      <div className="flex items-baseline justify-between px-6 py-3 border-b border-rule">
        <div className="label-caps">
          {symbol} · Price History · Last {days} Days
        </div>
        {usingMockData && (
          <span className="label-caps text-warning">Estimated Data</span>
        )}
      </div>

      <div className="px-4 py-5">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={CHART.accent}
                  stopOpacity={0.14}
                />
                <stop
                  offset="95%"
                  stopColor={CHART.accent}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={CHART.rule}
              strokeDasharray="0"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: CHART.tick, fontSize: 11, fontFamily: CHART.font }}
              tickLine={false}
              axisLine={{ stroke: CHART.rule }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fill: CHART.tick, fontSize: 11, fontFamily: CHART.font }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
              }
              width={78}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: CHART.rule, strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={CHART.accent}
              strokeWidth={1.5}
              fill="url(#priceGrad)"
              dot={false}
              activeDot={{
                r: 4,
                fill: CHART.accent,
                stroke: CHART.paper,
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}