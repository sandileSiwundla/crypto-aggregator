export interface CryptoQuote {
  price: number;
  volume_24h: number;
  market_cap: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
}

export interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  quote: {
    USD: CryptoQuote;
  };
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  logo?: string;
  description?: string;
}

export interface CryptoInfo {
  id: number;
  name: string;
  symbol: string;
  category: string;
  description: string;
  logo: string;
  urls: {
    website: string[];
    technical_doc: string[];
    twitter: string[];
    reddit: string[];
    source_code: string[];
  };
}

export interface TokenData {
  coin: CryptoData & Partial<CryptoInfo>;
  usdToZar: number | null;
}

export interface CompareData {
  token1: TokenData;
  token2: TokenData;
}

export interface HistoricalData {
  quotes: Array<{
    timestamp: string;
    price: number;
    volume: number;
    market_cap: number;
  }>;
  message?: string;
}