

"use client";

import React from "react";
import { formatChange, getChangeClass } from "./tokenUtils";
import type { Token } from "./Tokenoverviewcard";

interface CoinWithMeta extends Token {
  description?: string;
  urls?: {
    website?: string[];
    technical_doc?: string[];
    source_code?: string[];
  };
}

interface LinkButtonProps {
  href: string;
  icon: string;
  label: string;
}

function LinkButton({ href, icon, label }: LinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 border border-blue-700/40 bg-blue-900/20 hover:bg-blue-800/40 px-3 py-1.5 rounded-lg transition"
    >
      <span>{icon}</span> {label}
    </a>
  );
}

interface CryptoDetailProps {
  coin: CoinWithMeta;
  usdToZar?: number;
}

export default function CryptoDetail({ coin, usdToZar }: CryptoDetailProps) {
  const usd = coin.quote?.USD;
  const price = usd?.price ?? 0;
  const zarPrice = usdToZar ? price * usdToZar : null;
  const change = usd?.percent_change_24h;
  const changeClass = getChangeClass(change);

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl shadow-black/40 mb-5">
      {/* Header row */}
      <div className="flex items-center gap-4 mb-4">
        {coin.logo && (
          <img
            src={coin.logo}
            alt={coin.name}
            className="w-14 h-14 rounded-xl shadow-lg shadow-blue-500/20"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="text-white text-xl font-bold">{coin.name}</h2>
            <span className="text-slate-400 text-sm font-medium">({coin.symbol})</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-blue-300 text-lg font-bold">
              ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </span>
            <span
              className={`text-sm font-semibold px-2 py-0.5 rounded ${
                changeClass === "positive"
                  ? "text-emerald-300 bg-emerald-900/30"
                  : changeClass === "negative"
                  ? "text-red-300 bg-red-900/30"
                  : "text-slate-400"
              }`}
            >
              {(change ?? 0) >= 0 ? "↗" : "↘"} {formatChange(change)}
            </span>
          </div>
          {zarPrice != null && (
            <p className="text-slate-400 text-xs mt-0.5">
              R {zarPrice.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ZAR
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {coin.description && (
        <div className="mb-4">
          <h3 className="text-slate-300 text-xs font-semibold uppercase tracking-wide mb-2">About</h3>
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-4">
            {coin.description.substring(0, 400)}
            {coin.description.length > 400 ? "…" : ""}
          </p>
        </div>
      )}

      {/* Links */}
      {coin.urls && (
        <div className="flex flex-wrap gap-2">
          {coin.urls.website?.[0] && (
            <LinkButton href={coin.urls.website[0]} icon="🌐" label="Website" />
          )}
          {coin.urls.technical_doc?.[0] && (
            <LinkButton href={coin.urls.technical_doc[0]} icon="📄" label="Whitepaper" />
          )}
          {coin.urls.source_code?.[0] && (
            <LinkButton href={coin.urls.source_code[0]} icon="⌨️" label="Source Code" />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Loading / error states ───────────────────────────────────────────────────

export function CryptoDetailLoading() {
  return (
    <div className="rounded-2xl border border-blue-500/20 bg-slate-900 p-8 flex flex-col items-center gap-3 mb-5">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">Analysing cryptocurrency data…</p>
    </div>
  );
}

export function CryptoDetailError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-8 flex flex-col items-center gap-3 mb-5">
      <span className="text-3xl">⚠️</span>
      <p className="text-red-400 text-sm text-center">{message}</p>
    </div>
  );
}