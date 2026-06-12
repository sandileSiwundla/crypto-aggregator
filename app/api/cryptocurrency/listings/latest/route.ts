import { NextRequest, NextResponse } from 'next/server';

interface CoinListing {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  quote: {
    USD: {
      price: number;
      market_cap: number;
      volume_24h: number;
      percent_change_24h: number;
    };
  };
}

interface CoinWithLogo extends CoinListing {
  logo: string;
}

interface ListingsResponse {
  data?: CoinListing[];
  status?: {
    error_code?: number;
    error_message?: string;
  };
}

const API_KEY = process.env.COINMARKETCAP_API_KEY || '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '100';
    const start = searchParams.get('start') || '1';
    
    const response = await fetch(
      `${BASE_URL}/cryptocurrency/listings/latest?limit=${limit}&start=${start}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': API_KEY,
        },
        next: { revalidate: 3600 },
      }
    );
    
    const data: ListingsResponse = await response.json();
    
    if (data.data) {
      const coinsWithLogos: CoinWithLogo[] = data.data.map((coin: CoinListing) => ({
        ...coin,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
      }));
      
      return NextResponse.json({ data: coinsWithLogos });
    }
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cryptocurrency listings';
    console.error('Listings API error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrency listings' },
      { status: 500 }
    );
  }
}