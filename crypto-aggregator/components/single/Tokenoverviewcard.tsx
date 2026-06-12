
import React from "react";
import { formatNumber, formatChange, getChangeClass, calculateVolumeRatio, formatSupply } from "../tokenUtils";

export interface TokenQuote {
  price?: number;
  percent_change_1h?: number;
  percent_change_24h?: number;
  percent_change_7d?: number;
  percent_change_30d?: number;
  market_cap?: number;
  fully_diluted_market_cap?: number;
  volume_24h?: number;
}

export interface Token {
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

interface MetricRowProps {
  label: string;
  value: string;
  valueClass?: string;
}

function MetricRow({ label, value, valueClass = "" }: MetricRowProps) {
  return (
    <div className="flex border-b border-blue-900/30 last:border-0">
      <div className="flex-1 px-4 py-3 text-sm font-medium text-slate-300 bg-slate-800/60">
        {label}
      </div>
      <div
        className={`flex-1 px-4 py-3 text-sm font-semibold text-center ${
          valueClass === "positive"
            ? "text-emerald-300 bg-emerald-900/20"
            : valueClass === "negative"
            ? "text-red-300 bg-red-900/20"
            : "text-blue-200 bg-blue-900/10"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

interface SectionWrapperProps {
  children: React.ReactNode;
  title: string;
  token: Token;
  iconSize?: "lg" | "md";
  rightSlot?: React.ReactNode;
}

function SectionWrapper({ children, title, token, iconSize = "md", rightSlot }: SectionWrapperProps) {
  const imgClass = iconSize === "lg" ? "w-16 h-16 rounded-xl" : "w-10 h-10 rounded-lg";
  return (
    <div className="relative rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl shadow-black/40 mb-5 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-blue-500/20 hover:border-blue-500/40">
      {/* top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
      <div className="p-5">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-900/30">
          <div className="flex items-center gap-3">
            {token.logo ? (
              <img
                src={token.logo}
                alt={token.name}
                className={`${imgClass} shadow-lg shadow-blue-500/20`}
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            ) : (
              <div className={`${imgClass} bg-gradient-to-br from-blue-800 to-blue-500 border-2 border-blue-400/30`} />
            )}
            <div>
              <h4 className="text-white font-semibold text-base leading-tight">{title}</h4>
              {iconSize === "lg" && (
                <span className="text-slate-400 text-xs font-medium">{token.symbol}</span>
              )}
            </div>
          </div>
          {rightSlot}
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden border border-blue-900/30">
          <div className="flex bg-gradient-to-r from-blue-800 to-blue-600 font-semibold text-white text-xs uppercase tracking-wide">
            <div className="flex-1 px-4 py-2.5">Metric</div>
            <div className="flex-1 px-4 py-2.5 text-center">Value</div>
          </div>
          {children}
        </div>

        {/* Watermark */}
        <div className="flex justify-end mt-3 opacity-60">
          <span className="text-blue-300 text-xs font-medium">Powered by ABC Africa Blockchain Club</span>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

export function TokenOverview({ token }: { token: Token }) {
  const usd = token.quote?.USD;
  const price = usd?.price ?? 0;
  const change24h = usd?.percent_change_24h;

  return (
    <SectionWrapper
      title={token.name}
      token={token}
      iconSize="lg"
      rightSlot={
        <div className="text-right">
          <div className="text-blue-300 text-xl font-bold">${formatNumber(price)}</div>
          <div
            className={`text-sm font-semibold px-2 py-0.5 rounded ${
              (change24h ?? 0) >= 0
                ? "text-emerald-300 bg-emerald-900/30"
                : "text-red-300 bg-red-900/30"
            }`}
          >
            {formatChange(change24h)}
          </div>
        </div>
      }
    >
      <MetricRow label="Market Cap Rank" value={`#${token.cmc_rank ?? "N/A"}`} />
      <MetricRow label="Market Cap" value={`$${formatNumber(usd?.market_cap ?? 0)}`} />
      <MetricRow label="Fully Diluted MCap" value={`$${formatNumber(usd?.fully_diluted_market_cap ?? 0)}`} />
      <MetricRow label="24h Volume" value={`$${formatNumber(usd?.volume_24h ?? 0)}`} />
      <MetricRow label="Volume / MCap" value={`${calculateVolumeRatio(token)}%`} />
    </SectionWrapper>
  );
}

export function SupplyMetrics({ token }: { token: Token }) {
  const circulatingPct =
    token.max_supply && token.circulating_supply
      ? ((token.circulating_supply / token.max_supply) * 100).toFixed(2) + "%"
      : "N/A";

  return (
    <SectionWrapper title="Supply Metrics" token={token}>
      <MetricRow
        label="Circulating Supply"
        value={token.circulating_supply ? formatSupply(token.circulating_supply) : "N/A"}
      />
      <MetricRow
        label="Total Supply"
        value={token.total_supply ? formatSupply(token.total_supply) : "N/A"}
      />
      <MetricRow
        label="Max Supply"
        value={token.max_supply ? formatSupply(token.max_supply) : "Infinite"}
      />
      <MetricRow label="Circulating %" value={circulatingPct} />
    </SectionWrapper>
  );
}

export function PerformanceMetrics({ token }: { token: Token }) {
  const usd = token.quote?.USD;
  const periods: { label: string; key: keyof TokenQuote }[] = [
    { label: "1 Hour", key: "percent_change_1h" },
    { label: "24 Hours", key: "percent_change_24h" },
    { label: "7 Days", key: "percent_change_7d" },
    { label: "30 Days", key: "percent_change_30d" },
  ];

  return (
    <SectionWrapper title="Performance" token={token}>
      {periods.map(({ label, key }) => {
        const val = usd?.[key] as number | undefined;
        return (
          <MetricRow
            key={label}
            label={label}
            value={formatChange(val)}
            valueClass={getChangeClass(val)}
          />
        );
      })}
      <MetricRow label="Platform" value={token.platform?.name ?? "Native"} />
    </SectionWrapper>
  );
}

// ─── Main composed component ──────────────────────────────────────────────────

interface TokenAnalysisProps {
  token: Token;
}

export default function TokenAnalysis({ token }: TokenAnalysisProps) {
  return (
    <div className="space-y-0 font-sans">
      <TokenOverview token={token} />
      <SupplyMetrics token={token} />
      <PerformanceMetrics token={token} />
    </div>
  );
}