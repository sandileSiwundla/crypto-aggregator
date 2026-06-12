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

interface HistoricalDataPoint {
  time_open: string;
  quote: {
    USD: {
      close: number;
      volume: number;
    };
  };
}

interface HistoricalResponse {
  data?: {
    quotes?: HistoricalDataPoint[];
  };
}

interface PricePoint {
  timestamp: string | number;
  quote: {
    USD: {
      price: number;
      volume?: number;
      market_cap?: number;
    };
  };
}

interface CoinGeckoResponse {
  prices: [number, number][];
}

const API_KEY = process.env.COINMARKETCAP_API_KEY || '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cryptoName: string }> }
) {
  try {
    const { cryptoName } = await params;
    
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const interval = searchParams.get('interval') || 'daily';
    
    const listingsResponse = await fetch(
      `${BASE_URL}/cryptocurrency/listings/latest?limit=5000`,
      { 
        headers: { 'X-CMC_PRO_API_KEY': API_KEY },
        next: { revalidate: 3600 }
      }
    );
    
    const listingsData: CoinMarketCapListingsResponse = await listingsResponse.json();
    
    if (!listingsData.data) {
      throw new Error('Failed to fetch cryptocurrency data');
    }
    
    const crypto = listingsData.data.find(
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
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const historicalResponse = await fetch(
      `${BASE_URL}/cryptocurrency/ohlcv/historical?` + 
      `id=${crypto.id}&` +
      `time_start=${startDate.toISOString()}&` +
      `time_end=${endDate.toISOString()}&` +
      `interval=${interval}`,
      { 
        headers: { 'X-CMC_PRO_API_KEY': API_KEY },
        next: { revalidate: 3600 }
      }
    );
    
    const historicalData: HistoricalResponse = await historicalResponse.json();
    
    let quotes: PricePoint[] = [];
    let usingMockData = false;
    
    if (historicalData.data?.quotes && historicalData.data.quotes.length > 0) {
      quotes = historicalData.data.quotes.map((quote: HistoricalDataPoint) => ({
        timestamp: quote.time_open,
        quote: {
          USD: {
            price: quote.quote.USD.close,
            volume: quote.quote.USD.volume,
            market_cap: crypto.quote?.USD?.market_cap
          }
        }
      }));
    } else {
      console.log('Falling back to CoinGecko API for historical data');
      usingMockData = true;
      
      try {
        const geckoResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/${crypto.slug || crypto.name.toLowerCase()}/market_chart?` +
          `vs_currency=usd&days=${days}&interval=${interval === 'daily' ? 'daily' : 'hourly'}`
        );
        
        if (geckoResponse.ok) {
          const geckoData: CoinGeckoResponse = await geckoResponse.json();
          quotes = geckoData.prices.map(([timestamp, price]: [number, number]) => ({
            timestamp,
            quote: {
              USD: { price }
            }
          }));
          usingMockData = false;
        } else {
          console.log('Generating mock price data');
          quotes = generateMockPriceData(days, crypto.quote?.USD?.price ?? 100);
        }
      } catch {
        quotes = generateMockPriceData(days, crypto.quote?.USD?.price ?? 100);
      }
    }
    
    return NextResponse.json({
      quotes,
      coinId: crypto.id,
      coinName: crypto.name,
      symbol: crypto.symbol,
      currentPrice: crypto.quote?.USD?.price ?? 0,
      priceChange24h: crypto.quote?.USD?.percent_change_24h ?? 0,
      usingMockData,
      dataPoints: quotes.length
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Historical API error:', errorMessage);
    
    return NextResponse.json(
      { 
        quotes: [], 
        error: errorMessage,
        usingMockData: true 
      },
      { status: 500 }
    );
  }
}

function generateMockPriceData(days: number, currentPrice: number): PricePoint[] {
  const quotes: PricePoint[] = [];
  const now = Date.now();
  let price = currentPrice;
  
  for (let i = days; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    
    const change = (Math.random() - 0.5) * 0.1;
    price = price * (1 + change);
    
    quotes.push({
      timestamp,
      quote: {
        USD: {
          price: Math.max(price, currentPrice * 0.1)
        }
      }
    });
  }
  
  return quotes;
}