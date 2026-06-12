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
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { toPng } from 'html-to-image';

// Types
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
  name: "ABC Africa Blockchain Club",
  logo: "/ABC.png",
  website: "https://abc-africa-blockchain.org",
  tagline: "Empowering Africa's Blockchain Future"
};

const PALETTE = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

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

  // Supply chart data
  const supplyData = [
    { name: 'Circulating', value: token.circulating_supply || 0, color: '#3b82f6' },
    { name: 'Total', value: token.total_supply || 0, color: '#8b5cf6' },
    { name: 'Max', value: token.max_supply || 0, color: '#10b981' },
  ].filter(item => item.value > 0);

  // Performance data for bar chart
  const performanceData = [
    { period: '1 Hour', change: usd?.percent_change_1h || 0 },
    { period: '24 Hours', change: usd?.percent_change_24h || 0 },
    { period: '7 Days', change: usd?.percent_change_7d || 0 },
    { period: '30 Days', change: usd?.percent_change_30d || 0 },
  ];

  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  const formatSupply = (supply: number): string => {
    if (supply >= 1e9) return (supply / 1e9).toFixed(2) + 'B';
    if (supply >= 1e6) return (supply / 1e6).toFixed(2) + 'M';
    if (supply >= 1e3) return (supply / 1e3).toFixed(2) + 'K';
    return supply.toLocaleString();
  };

  const formatChange = (change?: number): string => {
    if (change === undefined || change === null) return 'N/A';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeClass = (change?: number): string => {
    if (change === undefined || change === null) return '';
    return change >= 0 ? 'text-emerald-400' : 'text-red-400';
  };

  const getChangeBgClass = (change?: number): string => {
    if (change === undefined || change === null) return '';
    return change >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20';
  };

  const circulatingPercentage = token.max_supply && token.circulating_supply
    ? ((token.circulating_supply / token.max_supply) * 100).toFixed(2)
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
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setDownloading(null);
    }
  };

  const MetricRow = ({ label, value, change }: { label: string; value: string; change?: number }) => (
    <div className="flex items-center justify-between py-3 border-b border-blue-900/30 last:border-0">
      <span className="text-slate-300 text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-white font-semibold">{value}</span>
        {change !== undefined && change !== null && (
          <span className={`text-sm font-semibold px-2 py-0.5 rounded ${getChangeBgClass(change)} ${getChangeClass(change)}`}>
            {formatChange(change)}
          </span>
        )}
      </div>
    </div>
  );

  const SectionHeader = ({ title, token: t, onDownload }: { title: string; token: Token; onDownload: () => void }) => (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-900/30">
      <div className="flex items-center gap-3">
        {t.logo ? (
          <img src={t.logo} alt={t.name} className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
        )}
        <div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <span className="text-slate-400 text-xs">{t.symbol}</span>
        </div>
      </div>
      <button
        onClick={onDownload}
        disabled={!!downloading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2"
      >
        {downloading === title.toLowerCase().replace(' ', '-') ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
        Download
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Token Overview Section */}
      <div ref={overviewRef} className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl overflow-hidden">
        <div className="p-5">
          <SectionHeader title="Token Overview" token={token} onDownload={() => downloadAsImage(overviewRef, 'overview')} />
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                {token.logo ? (
                  <img src={token.logo} alt={token.name} className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600" />
                )}
                <div>
                  <div className="text-3xl font-bold text-white">${formatNumber(price)}</div>
                  <div className={`text-sm font-semibold ${getChangeClass(usd?.percent_change_24h)}`}>
                    {formatChange(usd?.percent_change_24h)}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <MetricRow label="Market Cap Rank" value={`#${token.cmc_rank || 'N/A'}`} />
                <MetricRow label="Market Cap" value={`$${formatNumber(marketCap)}`} />
                <MetricRow label="Fully Diluted MCap" value={`$${formatNumber(fullyDilutedMCap)}`} />
                <MetricRow label="24h Volume" value={`$${formatNumber(volume24h)}`} />
                <MetricRow label="Volume / MCap Ratio" value={`${volumeRatio}%`} />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'Market Cap', value: marketCap },
                    { name: 'Volume', value: volume24h },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip formatter={(v: number) => formatNumber(v)} />
                    <Area type="monotone" dataKey="value" fill="#3b82f6" stroke="#60a5fa" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-3 opacity-70">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">Powered by</span>
              <img src={ABC_BRANDING.logo} alt="ABC" className="h-6 w-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          </div>
        </div>
      </div>

      {/* Supply Metrics Section */}
      <div ref={supplyRef} className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl overflow-hidden">
        <div className="p-5">
          <SectionHeader title="Supply Metrics" token={token} onDownload={() => downloadAsImage(supplyRef, 'supply')} />
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-1">
              <MetricRow label="Circulating Supply" value={formatSupply(token.circulating_supply || 0)} />
              <MetricRow label="Total Supply" value={formatSupply(token.total_supply || 0)} />
              <MetricRow label="Max Supply" value={token.max_supply ? formatSupply(token.max_supply) : 'Infinite'} />
              {circulatingPercentage && <MetricRow label="Circulating %" value={`${circulatingPercentage}%`} />}
            </div>
            
            <div className="flex-1 h-48">
              {supplyData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={supplyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {supplyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatSupply(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-3 opacity-70">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">Powered by</span>
              <img src={ABC_BRANDING.logo} alt="ABC" className="h-6 w-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Section */}
      <div ref={performanceRef} className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl overflow-hidden">
        <div className="p-5">
          <SectionHeader title="Performance Metrics" token={token} onDownload={() => downloadAsImage(performanceRef, 'performance')} />
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-1">
              <MetricRow label="Platform" value={token.platform?.name || 'Native'} />
              <MetricRow label="1 Hour" value={formatChange(usd?.percent_change_1h)} change={usd?.percent_change_1h} />
              <MetricRow label="24 Hours" value={formatChange(usd?.percent_change_24h)} change={usd?.percent_change_24h} />
              <MetricRow label="7 Days" value={formatChange(usd?.percent_change_7d)} change={usd?.percent_change_7d} />
              <MetricRow label="30 Days" value={formatChange(usd?.percent_change_30d)} change={usd?.percent_change_30d} />
            </div>
            
            <div className="flex-1 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" tickFormatter={(v) => `${v}%`} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="period" stroke="#94a3b8" />
                  <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
                  <Bar dataKey="change" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="flex justify-end mt-3 opacity-70">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">Powered by</span>
              <img src={ABC_BRANDING.logo} alt="ABC" className="h-6 w-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}