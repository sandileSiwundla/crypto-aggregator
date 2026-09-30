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

const fmtUSD = (v?: number | null): string => (v && v > 0 ? `$${compact(v)}` : 'N/A');

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

const changeTone = (c?: number | null) =>
  c === undefined || c === null
    ? 'text-slate-academic'
    : c >= 0
    ? 'text-positive'
    : 'text-negative';

const changeBg = (c?: number | null) =>
  c === undefined || c === null
    ? ''
    : c >= 0
    ? 'bg-positive-bg'
    : 'bg-negative-bg';

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

const impliedStartPrice = (price: number, changePct?: number): number | undefined =>
  price > 0 && changePct !== undefined && changePct !== null && changePct > -100
    ? price / (1 + changePct / 100)
    : undefined;

/* ---------- small components ---------- */

const MetricRow: React.FC<MetricRowProps> = ({ label, value, change, hint }) => (
  <div className="flex items-center justify-between py-3 border-b border-rule last:border-0">
    <div>
      <span className="font-body text-sm text-slate-academic">{label}</span>
      {hint && (
        <p className="font-body text-[11px] leading-tight text-slate-academic-dim mt-0.5">
          {hint}
        </p>
      )}
    </div>
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm text-ink tabular-nums">{value}</span>
      {change !== undefined && change !== null && (
        <span
          className={`font-mono text-xs tabular-nums px-1.5 py-0.5 ${changeTone(
            change
          )} ${changeBg(change)}`}
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
  <div className="flex items-center justify-between mb-5 pb-4 border-b border-rule">
    <div>
      <div className="label-caps mb-1">
        {token.name} · {token.symbol}
      </div>
      <h3 className="font-display text-lg text-ink">{title}</h3>
    </div>
    <button
      onClick={() => onDownload(cardRef, downloadKey)}
      disabled={!!downloading}
      className="label-caps border-b border-rule hover:border-accent hover:text-accent pb-0.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-transparent cursor-pointer"
    >
      {downloading === downloadKey ? 'Exporting…' : 'Export ↗'}
    </button>
  </div>
);

const Branding: React.FC = () => (
  <div className="flex items-center mt-5 pt-4 border-t border-rule gap-3">
    <img
      src={ABC_BRANDING.logo}
      alt="ABC"
      className="h-9 w-auto opacity-50"
      onError={(e) => (e.currentTarget.style.display = 'none')}
    />
    <span className="label-caps">{ABC_BRANDING.name}</span>
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

  const volumeRatio =
    marketCap > 0 ? ((volume24h / marketCap) * 100).toFixed(2) + '%' : 'N/A';
  const fdvMultiple = marketCap > 0 && fdv > 0 ? fdv / marketCap : null;
  const notYetCirculating = marketCap > 0 && fdv > marketCap ? fdv - marketCap : 0;

  const pctOfTotal = circ > 0 && total > 0 ? (circ / total) * 100 : null;
  const pctOfMax = circ > 0 && max > 0 ? (circ / max) * 100 : null;
  const nonCirculating = total > circ && circ > 0 ? total - circ : 0;

  const periods: Array<{ period: string; long: string; change?: number }> = [
    { period: '7d', long: '7 days', change: usd?.percent_change_7d },
    { period: '30d', long: '30 days', change: usd?.percent_change_30d },
    { period: '60d', long: '60 days', change: usd?.percent_change_60d },
    { period: '90d', long: '90 days', change: usd?.percent_change_90d },
  ].filter((p) => p.change !== undefined && p.change !== null);

  const downloadAsImage = async (
    ref: RefObject<HTMLDivElement | null>,
    filename: string
  ) => {
    if (!ref.current || downloading) return;
    setDownloading(filename);
    try {
      const dataUrl = await toPng(ref.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#faf9f6',
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

  const cardClass = 'border border-rule bg-paper p-6';

  return (
    <div className="space-y-6">
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

        <div className="flex items-end gap-3 mb-5 pb-5 border-b border-rule">
          <div className="font-mono text-3xl text-ink tabular-nums tracking-tight">
            {fmtPrice(price)}
          </div>
          {token.cmc_rank && (
            <span className="ml-auto self-start label-caps border border-rule px-2 py-1">
              Rank #{token.cmc_rank}
            </span>
          )}
        </div>

        <MetricRow label="Market Cap" value={fmtUSD(marketCap)} />
        <MetricRow label="Fully Diluted Valuation" value={fmtUSD(fdv)} />
        <MetricRow
          label="FDV / Market Cap"
          value={fdvMultiple ? `${fdvMultiple.toFixed(2)}×` : 'N/A'}
        />
        <MetricRow label="Volume / Market Cap" value={volumeRatio} />
        <MetricRow
          label="Platform"
          value={token.platform?.name || 'Native'}
        />

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
          value={
            max > 0
              ? fmtSupply(max)
              : token.infinite_supply
              ? '∞ Unlimited'
              : 'Not set'
          }
        />
        <MetricRow
          label="Circulating / Total"
          value={pctOfTotal !== null ? `${pctOfTotal.toFixed(1)}%` : 'N/A'}
        />
        <MetricRow
          label="Circulating / Max"
          value={pctOfMax !== null ? `${pctOfMax.toFixed(1)}%` : 'N/A'}
        />

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

        <p className="label-caps mb-4">
          Implied price at start of period · Change to now
        </p>

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
          <p className="font-body text-sm text-slate-academic py-3">
            No performance data available
          </p>
        )}

        <Branding />
      </div>
    </div>
  );
}