import { NextRequest, NextResponse } from 'next/server';

interface CoinMarketCapCoin {
  id: number;
  name: string;
  symbol: string;
  slug?: string;
  quote?: {
    USD: {
      price: number;
      market_cap: number;
      percent_change_24h: number;
    };
  };
}

interface CoinMarketCapListingsResponse {
  data?: CoinMarketCapCoin[];
  status?: {
    error_code?: number;
    error_message?: string;
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
    
    const listingsResponse = await fetch(
      `${BASE_URL}/cryptocurrency/listings/latest?limit=5000`,
      { headers: { 'X-CMC_PRO_API_KEY': API_KEY } }
    );
    
    const listingsData: CoinMarketCapListingsResponse = await listingsResponse.json();
    
    const crypto = listingsData.data?.find(
      (coin: CoinMarketCapCoin) => 
        coin.name?.toLowerCase() === cryptoName.toLowerCase() ||
        coin.symbol?.toLowerCase() === cryptoName.toLowerCase()
    );
    
    if (!crypto) {
      return NextResponse.json(
        { error: 'Cryptocurrency not found', quotes: [] },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      quotes: [],
      message: 'Historical data requires a premium CoinMarketCap plan. Using chart with sample data.',
      coinId: crypto.id,
      coinName: crypto.name
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Historical API error:', errorMessage);
    return NextResponse.json(
      { quotes: [], error: errorMessage },
      { status: 500 }
    );
  }
}