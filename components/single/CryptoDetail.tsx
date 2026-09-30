'use client';

import React from "react";
import { formatChange, getChangeClass } from "@/lib/tokenUtils";
import type { Token } from "@/lib/tokenUtils";

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
  label: string;
}

function LinkButton({ href, label }: LinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="label-caps border-b border-rule hover:border-accent hover:text-accent no-underline pb-0.5 transition-colors"
    >
      {label} ↗
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

  const priceStr = price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  });

  const zarStr = zarPrice
    ? zarPrice.toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;

  const changeTone =
    changeClass === "positive"
      ? "text-positive"
      : changeClass === "negative"
      ? "text-negative"
      : "text-slate-academic";

  return (
    <section className="border border-rule bg-paper mb-10">
      {/* Top rule bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-rule">
        <div className="label-caps">
          {coin.platform?.name ? `Platform · ${coin.platform.name}` : "Native Chain"}
        </div>
        <div className="label-caps">{coin.symbol?.toUpperCase()}</div>
      </div>

      {/* Masthead */}
      <div className="px-6 md:px-8 py-8">
        <div className="flex items-start gap-5">
          {coin.logo && (
            <img
              src={coin.logo}
              alt={coin.name}
              className="w-14 h-14 border border-rule object-contain bg-paper-alt"
              onError={(e) =>
                ((e.target as HTMLImageElement).style.display = "none")
              }
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap mb-3">
              <h2 className="text-3xl font-display text-ink leading-none">
                {coin.name}
              </h2>
              <span className="font-mono text-sm text-slate-academic">
                {coin.symbol}
              </span>
            </div>

            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="font-mono text-3xl text-ink tabular-nums tracking-tight">
                ${priceStr}
              </span>
              <span className={`font-mono text-sm tabular-nums ${changeTone}`}>
                {change !== undefined && change !== null && change >= 0 ? "↗" : "↘"}{" "}
                {formatChange(change)}
              </span>
            </div>

            {zarStr && (
              <p className="font-mono text-xs text-slate-academic mt-2">
                ≈ R {zarStr} ZAR
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {coin.description && (
        <div className="px-6 md:px-8 pb-8 border-t border-rule pt-6">
          <div className="label-caps mb-3">Abstract</div>
          <p className="font-body text-slate-academic leading-relaxed line-clamp-4">
            {coin.description.substring(0, 400)}
            {coin.description.length > 400 ? "…" : ""}
          </p>
        </div>
      )}

      {/* Links */}
      {coin.urls && (
        <div className="px-6 md:px-8 py-5 border-t border-rule flex flex-wrap gap-6">
          {coin.urls.website?.[0] && (
            <LinkButton href={coin.urls.website[0]} label="Website" />
          )}
          {coin.urls.technical_doc?.[0] && (
            <LinkButton href={coin.urls.technical_doc[0]} label="Whitepaper" />
          )}
          {coin.urls.source_code?.[0] && (
            <LinkButton href={coin.urls.source_code[0]} label="Source" />
          )}
        </div>
      )}
    </section>
  );
}

// ─── Loading / error states ───────────────────────────────────────────────────

export function CryptoDetailLoading() {
  return (
    <div className="border border-rule bg-paper-alt p-8 mb-10">
      <div className="label-caps mb-3">Fetching</div>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border border-rule border-t-ink rounded-full animate-spin" />
        <p className="font-body text-slate-academic text-sm">
          Analysing cryptocurrency data…
        </p>
      </div>
    </div>
  );
}

export function CryptoDetailError({ message }: { message: string }) {
  return (
    <div className="border border-rule bg-negative-bg p-6 mb-10">
      <div className="label-caps text-negative mb-2">Error</div>
      <p className="font-body text-ink">{message}</p>
    </div>
  );
}