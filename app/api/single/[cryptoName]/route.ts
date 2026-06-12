import { NextRequest, NextResponse } from 'next/server';

interface CoinQuoteUSD {
  price: number;
  percent_change_1h?: number;
  percent_change_24h?: number;
  percent_change_7d?: number;
  percent_change_30d?: number;
  market_cap: number;
  fully_diluted_market_cap?: number;
  volume_24h: number;
}

interface Coin {
  id: number;
  name: string;
  symbol: string;
  cmc_rank: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  platform: {
    name: string;
  } | null;
  quote: {
    USD: CoinQuoteUSD;
  };
}

interface CoinMarketCapResponse {
  data?: Record<string, Coin>;
  status?: {
    error_code?: number;
    error_message?: string;
  };
}

interface ExchangeRateResponse {
  rates: {
    ZAR: number;
  };
}

const API_KEY = process.env.COINMARKETCAP_API_KEY || '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cryptoName: string }> }
) {
  try {
    const { cryptoName } = await params;
    
    const response = await fetch(
      `${BASE_URL}/cryptocurrency/quotes/latest?slug=${cryptoName.toLowerCase()}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': API_KEY,
        },
        next: { revalidate: 60 },
      }
    );
    
    const data: CoinMarketCapResponse = await response.json();
    
    if (!data.data) {
      return NextResponse.json(
        { error: 'Cryptocurrency not found' },
        { status: 404 }
      );
    }
    
    const coinId = Object.keys(data.data)[0];
    const coin = data.data[coinId];
    
    let usdToZar: number | null = null;
    try {
      const zarResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const zarData: ExchangeRateResponse = await zarResponse.json();
      usdToZar = zarData.rates.ZAR;
    } catch (error) {
      console.error('Failed to fetch ZAR rate:', error);
    }
    
    return NextResponse.json({
      coin: {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
        cmc_rank: coin.cmc_rank,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply,
        platform: coin.platform,
        quote: coin.quote,
      },
      usdToZar,
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cryptocurrency data';
    console.error('API error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}