
"use client";

import React, { useState, useMemo } from "react";
import { formatChange, getChangeClass } from "../tokenUtils";
import type { Token } from "./Tokenoverviewcard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CryptoTableProps {
  coins: Token[];
  usdToZar?: number;
  onRowClick?: (coin: Token) => void;
}

type SortKey = "cmc_rank" | "price" | "market_cap" | "volume_24h" | "percent_change_24h";
type SortDir = "asc" | "desc";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtCompact(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function getValue(coin: Token, key: SortKey): number {
  switch (key) {
    case "cmc_rank": return coin.cmc_rank ?? Infinity;
    case "price": return coin.quote?.USD?.price ?? 0;
    case "market_cap": return coin.quote?.USD?.market_cap ?? 0;
    case "volume_24h": return coin.quote?.USD?.volume_24h ?? 0;
    case "percent_change_24h": return coin.quote?.USD?.percent_change_24h ?? 0;
  }
}

// ─── Column header ────────────────────────────────────────────────────────────

function Th({
  label,
  sortKey,
  active,
  dir,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  dir: SortDir;
  onClick: (k: SortKey) => void;
}) {
  return (
    <th
      onClick={() => onClick(sortKey)}
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 cursor-pointer select-none hover:text-blue-300 transition whitespace-nowrap"
    >
      {label}
      <span className="ml-1 opacity-60">
        {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </th>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CryptoTable({ coins, usdToZar, onRowClick }: CryptoTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("cmc_rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    return [...coins].sort((a, b) => {
      const va = getValue(a, sortKey);
      const vb = getValue(b, sortKey);
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [coins, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  if (coins.length === 0) {
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-slate-900 p-8 text-center text-slate-500 text-sm">
        No coins to display yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl shadow-black/40 overflow-hidden mb-5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-blue-900/60 to-slate-800 border-b border-blue-900/40">
            <tr>
              <Th label="Rank" sortKey="cmc_rank" active={sortKey === "cmc_rank"} dir={sortDir} onClick={handleSort} />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Coin</th>
              <Th label="Price (USD)" sortKey="price" active={sortKey === "price"} dir={sortDir} onClick={handleSort} />
              {usdToZar && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Price (ZAR)</th>
              )}
              <Th label="24h %" sortKey="percent_change_24h" active={sortKey === "percent_change_24h"} dir={sortDir} onClick={handleSort} />
              <Th label="Market Cap" sortKey="market_cap" active={sortKey === "market_cap"} dir={sortDir} onClick={handleSort} />
              <Th label="24h Volume" sortKey="volume_24h" active={sortKey === "volume_24h"} dir={sortDir} onClick={handleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sorted.map((coin) => {
              const usd = coin.quote?.USD;
              const price = usd?.price ?? 0;
              const zarPrice = usdToZar ? price * usdToZar : null;
              const change = usd?.percent_change_24h;
              const changeClass = getChangeClass(change);

              return (
                <tr
                  key={coin.symbol}
                  onClick={() => onRowClick?.(coin)}
                  className={`transition-colors hover:bg-blue-900/10 ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {/* Rank */}
                  <td className="px-4 py-3.5">
                    <span className="inline-block bg-indigo-900/50 text-indigo-300 text-xs font-semibold px-2 py-1 rounded-md min-w-[40px] text-center">
                      #{coin.cmc_rank ?? "—"}
                    </span>
                  </td>

                  {/* Coin name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {coin.logo && (
                        <img
                          src={coin.logo}
                          alt={coin.name}
                          className="w-7 h-7 rounded-full flex-shrink-0"
                          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                        />
                      )}
                      <div>
                        <div className="text-white font-semibold leading-tight">{coin.name}</div>
                        <div className="text-slate-500 text-xs">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>

                  {/* Price USD */}
                  <td className="px-4 py-3.5 text-blue-200 font-semibold">
                    ${fmt(price, price < 1 ? 6 : 2)}
                  </td>

                  {/* Price ZAR */}
                  {usdToZar && (
                    <td className="px-4 py-3.5 text-slate-300">
                      {zarPrice != null ? `R ${fmt(zarPrice, zarPrice < 1 ? 4 : 2)}` : "—"}
                    </td>
                  )}

                  {/* 24h change */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-1 rounded-md ${
                        changeClass === "positive"
                          ? "bg-emerald-900/30 text-emerald-300"
                          : changeClass === "negative"
                          ? "bg-red-900/30 text-red-300"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {formatChange(change)}
                    </span>
                  </td>

                  {/* Market Cap */}
                  <td className="px-4 py-3.5 text-slate-300">
                    {fmtCompact(usd?.market_cap ?? 0)}
                  </td>

                  {/* Volume */}
                  <td className="px-4 py-3.5 text-slate-300">
                    {fmtCompact(usd?.volume_24h ?? 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}