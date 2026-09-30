'use client';

import React, { useRef, useState, RefObject } from 'react';
import { toPng } from 'html-to-image';

interface TokenQuote {
  price: number;
  percent_change_7d?: number;
  percent_change_30d?: number;
  percent_change_60d?: number;
  percent_change_90d?: number;
  market_cap?: number;
  fully_diluted_market_cap?: number;
  volume_24h?: number;
}

interface Token {
  id: number;
  name: string;
  symbol: string;
  slug?: string;
  logo?: string;
  cmc_rank?: number | null;
  num_market_pairs?: number;
  date_added?: string;
  circulating_supply?: number;
  total_supply?: number;
  max_supply?: number | null;
  infinite_supply?: boolean;
  platform?: { name: string } | null;
  quote?: { USD?: TokenQuote };
}

interface TokenAnalysisProps {
  token: Token;
}

interface MetricRowProps {
  label: string;
  value: string;
  change?: number;
  hint?: string;
}

interface CardHeaderProps {
  title: string;
  downloadKey: string;
  token: Token;
  downloading: string | null;
  onDownload: (ref: RefObject<HTMLDivElement | null>, key: string) => void;
  cardRef: RefObject<HTMLDivElement | null>;
}

const ABC_BRANDING = { name: 'Africa Blockchain Club', logo: '/ABC.png' };

/* ---------- formatters ---------- */

const compact = (num: number): string => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

/** Compact USD. Missing or zero is "N/A", never a misleading $0. */
const fmtUSD = (v?: number | null): string => (v && v > 0 ? `$${compact(v)}` : 'N/A');

/** Unit price: full precision for sub-dollar tokens. */
const fmtPrice = (p?: number | null): string => {
  if (p === undefined || p === null || !isFinite(p) || p <= 0) return 'N/A';
  if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  if (p >= 0.01) return `$${p.toFixed(4)}`;
  return `$${p.toPrecision(3)}`;
};

const fmtSupply = (v?: number | null): string => (v && v > 0 ? compact(v) : 'N/A');

const fmtChange = (c?: number | null): string =>
  c === undefined || c === null ? 'N/A' : `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`;

const changeColor = (c?: number | null) =>
  c === undefined || c === null ? 'text-slate-400' : c >= 0 ? 'text-emerald-400' : 'text-red-400';

const fmtListed = (iso?: string): string => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'N/A';
  const now = new Date();
  const months = Math.max(
    0,
    (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
  );
  return `${d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} · ${months} mo`;
};

/** Price at the start of a period, implied by the percent change to now. */
const impliedStartPrice = (price: number, changePct?: number): number | undefined =>
  price > 0 && changePct !== undefined && changePct !== null && changePct > -100
    ? price / (1 + changePct / 100)
    : undefined;

/* ---------- small components ---------- */

const MetricRow: React.FC<MetricRowProps> = ({ label, value, change, hint }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-700/50 last:border-0">
    <div>
      <span className="text-slate-400 text-sm">{label}</span>
      {hint && <p className="text-slate-600 text-[11px] leading-tight">{hint}</p>}
    </div>
    <div className="flex items-center gap-2">
      <span className="text-white text-sm font-semibold">{value}</span>
      {change !== undefined && change !== null && (
        <span
          className={`text-xs font-semibold px-1.5 py-0.5 rounded ${changeColor(change)} ${
            change >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
          }`}
        >
          {fmtChange(change)}
        </span>
      )}
    </div>
  </div>
);

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  downloadKey,
  token,
  downloading,
  onDownload,
  cardRef,
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
        <p className="text-slate-500 text-xs">
          {token.name} · {token.symbol}
        </p>
      </div>
    </div>
    <button
      onClick={() => onDownload(cardRef, downloadKey)}
      disabled={!!downloading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium transition-colors"
    >
      {downloading === downloadKey ? (
        <span className="w-3.5 h-3.5 border-2 border-slate-400/40 border-t-slate-300 rounded-full animate-spin inline-block" />
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      )}
      Export
    </button>
  </div>
);

const Branding: React.FC = () => (
  <div className="flex items-center mt-4 pt-3 border-t border-slate-700/40">
    <img
      src={ABC_BRANDING.logo}
      alt="ABC"
      className="h-12 w-auto opacity-60"
      onError={(e) => (e.currentTarget.style.display = 'none')}
    />
    <span className="-ml-5 mt-5 text-slate-500 text-xs">
    {ABC_BRANDING.name}
  </span>
  </div>
);

/* ---------- main ---------- */

export default function TokenAnalysis({ token }: TokenAnalysisProps) {
  const overviewRef = useRef<HTMLDivElement>(null);
  const supplyRef = useRef<HTMLDivElement>(null);
  const performanceRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const usd = token.quote?.USD;
  const price = usd?.price ?? 0;
  const marketCap = usd?.market_cap ?? 0;
  const fdv = usd?.fully_diluted_market_cap ?? 0;
  const volume24h = usd?.volume_24h ?? 0;

  const circ = token.circulating_supply ?? 0;
  const total = token.total_supply ?? 0;
  const max = token.max_supply ?? 0;

  // Valuation / dilution
  const volumeRatio = marketCap > 0 ? ((volume24h / marketCap) * 100).toFixed(2) + '%' : 'N/A';
  const fdvMultiple = marketCap > 0 && fdv > 0 ? fdv / marketCap : null;
  const notYetCirculating = marketCap > 0 && fdv > marketCap ? fdv - marketCap : 0;

  // Supply
  const pctOfTotal = circ > 0 && total > 0 ? (circ / total) * 100 : null;
  const pctOfMax = circ > 0 && max > 0 ? (circ / max) * 100 : null;
  const nonCirculating = total > circ && circ > 0 ? total - circ : 0;



  // Performance (1h and 24h intentionally excluded)
  const periods: Array<{ period: string; long: string; change?: number }> = [
    { period: '7d', long: '7 days', change: usd?.percent_change_7d },
    { period: '30d', long: '30 days', change: usd?.percent_change_30d },
    { period: '60d', long: '60 days', change: usd?.percent_change_60d },
    { period: '90d', long: '90 days', change: usd?.percent_change_90d },
  ].filter((p) => p.change !== undefined && p.change !== null);

  const downloadAsImage = async (ref: RefObject<HTMLDivElement | null>, filename: string) => {
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

  const cardClass = 'rounded-2xl border border-slate-700/60 bg-slate-900 p-5';

  return (
    <div className="space-y-5">
      {/* ───────── Overview ───────── */}
      <div ref={overviewRef} className={cardClass}>
        <CardHeader
          title="Token Overview"
          downloadKey="overview"
          token={token}
          downloading={downloading}
          onDownload={downloadAsImage}
          cardRef={overviewRef}
        />

        <div className="flex items-end gap-3 mb-4">
          <div className="text-3xl font-bold text-white tracking-tight">{fmtPrice(price)}</div>
          {token.cmc_rank && (
            <span className="ml-auto self-start text-xs font-semibold px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Rank #{token.cmc_rank}
            </span>
          )}
        </div>

        <MetricRow label="Market Cap" value={fmtUSD(marketCap)}/>
        <MetricRow label="Fully Diluted Valuation" value={fmtUSD(fdv)}/>
        <MetricRow
          label="FDV / Market Cap"
          value={fdvMultiple ? `${fdvMultiple.toFixed(2)}×` : 'N/A'}
        
        />
        <MetricRow label="Volume / Market Cap" value={volumeRatio} />

        <MetricRow label="Platform" value={token.platform?.name || 'Native'} />

        <Branding />
      </div>

      {/* ───────── Supply & Allocation ───────── */}
      <div ref={supplyRef} className={cardClass}>
        <CardHeader
          title="Supply & Allocation"
          downloadKey="supply"
          token={token}
          downloading={downloading}
          onDownload={downloadAsImage}
          cardRef={supplyRef}
        />

        <MetricRow label="Circulating Supply" value={fmtSupply(circ)} />
        <MetricRow
          label="Non-circulating"
          value={nonCirculating > 0 ? fmtSupply(nonCirculating) : 'N/A'}
          hint="Total minus circulating"
        />
        <MetricRow label="Total Supply" value={fmtSupply(total)} />
        <MetricRow
          label="Max Supply"
          value={max > 0 ? fmtSupply(max) : token.infinite_supply ? '∞ Unlimited' : 'Not set'}
        />
        <MetricRow label="Circulating / Total" value={pctOfTotal !== null ? `${pctOfTotal.toFixed(1)}%` : 'N/A'} />
        <MetricRow label="Circulating / Max" value={pctOfMax !== null ? `${pctOfMax.toFixed(1)}%` : 'N/A'} />


        <Branding />
      </div>

      {/* ───────── Performance ───────── */}
      <div ref={performanceRef} className={cardClass}>
        <CardHeader
          title="Performance Metrics"
          downloadKey="performance"
          token={token}
          downloading={downloading}
          onDownload={downloadAsImage}
          cardRef={performanceRef}
        />

        <p className="text-slate-500 text-xs mb-1">Implied price at start of period, and change to now</p>
        {periods.length > 0 ? (
          periods.map((p) => (
            <MetricRow
              key={p.period}
              label={`${p.long} ago`}
              value={fmtPrice(impliedStartPrice(price, p.change))}
              change={p.change}
            />
          ))
        ) : (
          <p className="text-slate-500 text-sm py-3">No performance data available</p>
        )}

        <Branding />
      </div>
    </div>
  );
}