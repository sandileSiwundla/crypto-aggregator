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

export function formatNumber(num: number): string {
  if (num === 0) return "0";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export function formatSupply(supply: number): string {
  if (supply >= 1e9) return (supply / 1e9).toFixed(2) + "B";
  if (supply >= 1e6) return (supply / 1e6).toFixed(2) + "M";
  if (supply >= 1e3) return (supply / 1e3).toFixed(2) + "K";
  return supply.toLocaleString();
}

export function formatChange(change?: number | null): string {
  if (change == null) return "N/A";
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

export function getChangeClass(change?: number | null): "positive" | "negative" | "" {
  if (change == null) return "";
  return change >= 0 ? "positive" : "negative";
}

export function calculateVolumeRatio(token: Token): string {
  const marketCap = token.quote?.USD?.market_cap ?? 0;
  const volume = token.quote?.USD?.volume_24h ?? 0;
  if (marketCap === 0) return "0.00";
  return ((volume / marketCap) * 100).toFixed(2);
}