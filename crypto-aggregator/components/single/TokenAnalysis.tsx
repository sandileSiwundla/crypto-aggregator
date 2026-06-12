'use client';

import React, { useRef, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { toPng } from 'html-to-image';

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

interface TokenAnalysisProps {
  token: Token;
}

const ABC_BRANDING = {
  name: 'ABC Africa Blockchain Club',
  logo: '/ABC.png',
};

const PALETTE = ['#3b82f6', '#8b5cf6', '#10b981'];

export default function TokenAnalysis({ token }: TokenAnalysisProps) {
  const overviewRef = useRef<HTMLDivElement>(null);
  const supplyRef = useRef<HTMLDivElement>(null);
  const performanceRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const usd = token.quote?.USD;
  const price = usd?.price ?? 0;
  const marketCap = usd?.market_cap ?? 0;
  const fullyDilutedMCap = usd?.fully_diluted_market_cap ?? 0;
  const volume24h = usd?.volume_24h ?? 0;
  const volumeRatio = marketCap > 0 ? ((volume24h / marketCap) * 100).toFixed(2) : '0.00';

  const supplyData = [
    { name: 'Circulating', value: token.circulating_supply || 0, color: PALETTE[0] },
    {
      name: 'Non-Circulating',
      value: Math.max(0, (token.total_supply || 0) - (token.circulating_supply || 0)),
      color: PALETTE[1],
    },
    {
      name: 'Unissued',
      value: Math.max(0, (token.max_supply || 0) - (token.total_supply || 0)),
      color: PALETTE[2],
    },
  ].filter((item) => item.value > 0);

  const performanceData = [
    { period: '1h', change: usd?.percent_change_1h ?? 0 },
    { period: '24h', change: usd?.percent_change_24h ?? 0 },
    { period: '7d', change: usd?.percent_change_7d ?? 0 },
    { period: '30d', change: usd?.percent_change_30d ?? 0 },
  ];

  // Market cap vs volume comparison data
  const marketData = [
    { label: 'Market Cap', value: marketCap },
    { label: 'Fully Diluted', value: fullyDilutedMCap },
    { label: '24h Volume', value: volume24h },
  ].filter((d) => d.value > 0);

  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  const formatSupply = (supply: number): string => {
    if (supply >= 1e12) return (supply / 1e12).toFixed(2) + 'T';
    if (supply >= 1e9) return (supply / 1e9).toFixed(2) + 'B';
    if (supply >= 1e6) return (supply / 1e6).toFixed(2) + 'M';
    if (supply >= 1e3) return (supply / 1e3).toFixed(2) + 'K';
    return supply.toLocaleString();
  };

  const formatChange = (change?: number): string => {
    if (change === undefined || change === null) return 'N/A';
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  const changeColor = (change?: number) =>
    change === undefined || change === null
      ? 'text-slate-400'
      : change >= 0
      ? 'text-emerald-400'
      : 'text-red-400';

  const circulatingPct =
    token.max_supply && token.circulating_supply
      ? ((token.circulating_supply / token.max_supply) * 100).toFixed(1)
      : null;

  const downloadAsImage = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current || downloading) return;
    setDownloading(filename);
    try {
      const dataUrl = await toPng(ref.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#0f172a',
      });
      const link = document.createElement('a');
      link.download = `${token.symbol}-${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  };

  const MetricRow = ({
    label,
    value,
    change,
  }: {
    label: string;
    value: string;
    change?: number;
  }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-700/50 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-white text-sm font-semibold">{value}</span>
        {change !== undefined && change !== null && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${changeColor(change)} ${
              change >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}
          >
            {formatChange(change)}
          </span>
        )}
      </div>
    </div>
  );

  const CardHeader = ({
    title,
    downloadKey,
    ref: cardRef,
  }: {
    title: string;
    downloadKey: string;
    ref: React.RefObject<HTMLDivElement>;
  }) => (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {token.logo ? (
          <img src={token.logo} alt={token.name} className="w-9 h-9 rounded-lg object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
        )}
        <div>
          <p className="text-white font-semibold leading-tight">{title}</p>
          <p className="text-slate-500 text-xs">{token.name} · {token.symbol}</p>
        </div>
      </div>
      <button
        onClick={() => downloadAsImage(cardRef, downloadKey)}
        disabled={!!downloading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium transition-colors"
      >
        {downloading === downloadKey ? (
          <span className="w-3.5 h-3.5 border-2 border-slate-400/40 border-t-slate-300 rounded-full animate-spin inline-block" />
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
        Export
      </button>
    </div>
  );

  const Branding = () => (
    <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-700/40">
      <img
        src={ABC_BRANDING.logo}
        alt="ABC"
        className="h-5 w-auto opacity-60"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
      <span className="text-slate-500 text-xs">ABC Africa Blockchain Club</span>
    </div>
  );

  // Custom tooltip for performance bar chart
  interface TooltipPayloadItem {
    value?: number;
    payload?: { period?: string; label?: string };
  }

  const PerformanceTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) => {
    if (!active || !payload?.length) return null;
    const val: number = payload[0].value ?? 0;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm shadow-xl">
        <p className="text-slate-400">{payload[0].payload?.period ?? 'N/A'}</p>
        <p className={`font-semibold ${val >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatChange(val)}
        </p>
      </div>
    );
  };

  // Custom tooltip for market data bar chart
  const MarketTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm shadow-xl">
        <p className="text-slate-400">{payload[0].payload?.label ?? 'N/A'}</p>
        <p className="text-white font-semibold">${formatNumber(payload[0].value ?? 0)}</p>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* ── Token Overview ───────────────────────────────────────── */}
      <div
        ref={overviewRef}
        className="rounded-2xl border border-slate-700/60 bg-slate-900 p-5"
      >
        <CardHeader title="Token Overview" downloadKey="overview" ref={overviewRef} />

        {/* Price hero */}
        <div className="flex items-end gap-3 mb-5">
          {token.logo ? (
            <img src={token.logo} alt={token.name} className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shrink-0" />
          )}
          <div>
            <div className="text-3xl font-bold text-white tracking-tight">
              ${formatNumber(price)}
            </div>
            <div className={`text-sm font-semibold mt-0.5 ${changeColor(usd?.percent_change_24h)}`}>
              {formatChange(usd?.percent_change_24h)}{' '}
              <span className="text-slate-500 font-normal">24h</span>
            </div>
          </div>
          {token.cmc_rank && (
            <span className="ml-auto self-start text-xs font-semibold px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              #{token.cmc_rank}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: metrics */}
          <div>
            <MetricRow label="Market Cap" value={`$${formatNumber(marketCap)}`} />
            <MetricRow label="Fully Diluted MCap" value={`$${formatNumber(fullyDilutedMCap)}`} />
            <MetricRow label="24h Volume" value={`$${formatNumber(volume24h)}`} />
            <MetricRow label="Volume / MCap" value={`${volumeRatio}%`} />
            <MetricRow label="Platform" value={token.platform?.name || 'Native'} />
          </div>

          {/* Right: market cap vs volume bar chart */}
          <div>
            <p className="text-slate-500 text-xs mb-2">Market size comparison</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={marketData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => formatNumber(v)}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={<MarketTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {marketData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Branding />
      </div>

      {/* ── Supply Metrics ───────────────────────────────────────── */}
      <div
        ref={supplyRef}
        className="rounded-2xl border border-slate-700/60 bg-slate-900 p-5"
      >
        <CardHeader title="Supply Metrics" downloadKey="supply" ref={supplyRef} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <MetricRow
              label="Circulating Supply"
              value={formatSupply(token.circulating_supply || 0)}
            />
            <MetricRow
              label="Total Supply"
              value={formatSupply(token.total_supply || 0)}
            />
            <MetricRow
              label="Max Supply"
              value={token.max_supply ? formatSupply(token.max_supply) : '∞ Unlimited'}
            />
            {circulatingPct && (
              <MetricRow label="% Circulating" value={`${circulatingPct}%`} />
            )}

            {/* Progress bar for circulating % */}
            {circulatingPct && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Circulating</span>
                  <span>{circulatingPct}% of max</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${Math.min(100, parseFloat(circulatingPct))}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Donut chart with custom legend */}
          <div className="flex flex-col items-center">
            {supplyData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={supplyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {supplyData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => formatSupply(v)}
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#94a3b8' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom legend — avoids label overlap */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-1">
                  {supplyData.map((entry) => {
                    const total = supplyData.reduce((s, d) => s + d.value, 0);
                    const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
                    return (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-sm inline-block"
                          style={{ background: entry.color }}
                        />
                        <span className="text-slate-400 text-xs">
                          {entry.name}{' '}
                          <span className="text-slate-300 font-medium">{pct}%</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm mt-8">No supply data available</p>
            )}
          </div>
        </div>

        <Branding />
      </div>

      {/* ── Performance Metrics ──────────────────────────────────── */}
      <div
        ref={performanceRef}
        className="rounded-2xl border border-slate-700/60 bg-slate-900 p-5"
      >
        <CardHeader title="Performance Metrics" downloadKey="performance" ref={performanceRef} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <MetricRow
              label="1 Hour"
              value={formatChange(usd?.percent_change_1h)}
              change={usd?.percent_change_1h}
            />
            <MetricRow
              label="24 Hours"
              value={formatChange(usd?.percent_change_24h)}
              change={usd?.percent_change_24h}
            />
            <MetricRow
              label="7 Days"
              value={formatChange(usd?.percent_change_7d)}
              change={usd?.percent_change_7d}
            />
            <MetricRow
              label="30 Days"
              value={formatChange(usd?.percent_change_30d)}
              change={usd?.percent_change_30d}
            />
          </div>

          {/* Vertical bar chart — positive green, negative red */}
          <div>
            <p className="text-slate-500 text-xs mb-2">Price change by period</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={performanceData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
                <Tooltip
                  content={<PerformanceTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="change" radius={[3, 3, 3, 3]}>
                  {performanceData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.change >= 0 ? '#10b981' : '#ef4444'}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Branding />
      </div>
    </div>
  );
}