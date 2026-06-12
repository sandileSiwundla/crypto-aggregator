
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.COINMARKETCAP_API_KEY || '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: { cryptoName: string } }
) {
  try {
    const { cryptoName } = await params;
    
    // Get query parameters for date range
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const interval = searchParams.get('interval') || 'daily'; // daily, hourly
    
    // Step 1: Get cryptocurrency ID and metadata
    const listingsResponse = await fetch(
      `${BASE_URL}/cryptocurrency/listings/latest?limit=5000`,
      { 
        headers: { 'X-CMC_PRO_API_KEY': API_KEY },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );
    
    const listingsData = await listingsResponse.json();
    
    if (!listingsData.data) {
      throw new Error('Failed to fetch cryptocurrency data');
    }
    
    const crypto = listingsData.data.find(
      (coin: any) => 
        coin.name?.toLowerCase() === cryptoName.toLowerCase() ||
        coin.symbol?.toLowerCase() === cryptoName.toLowerCase()
    );
    
    if (!crypto) {
      return NextResponse.json(
        { error: 'Cryptocurrency not found', quotes: [] },
        { status: 404 }
      );
    }
    
    // Step 2: Fetch historical OHLCV data
    // Calculate start date based on days parameter
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
    
    const historicalData = await historicalResponse.json();
    
    // Check if historical data is available
    let quotes = [];
    let usingMockData = false;
    
    if (historicalData.data?.quotes && historicalData.data.quotes.length > 0) {
      // Transform historical data to match PricePoint interface
      quotes = historicalData.data.quotes.map((quote: any) => ({
        timestamp: quote.time_open,
        quote: {
          USD: {
            price: quote.quote.USD.close, // Use closing price
            volume: quote.quote.USD.volume,
            market_cap: crypto.quote.USD.market_cap
          }
        }
      }));
    } else {
      // Fallback to CoinGecko API (free, no API key required)
      console.log('Falling back to CoinGecko API for historical data');
      usingMockData = true;
      
      const geckoResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/${crypto.slug || crypto.name.toLowerCase()}/market_chart?` +
        `vs_currency=usd&days=${days}&interval=${interval === 'daily' ? 'daily' : 'hourly'}`
      );
      
      if (geckoResponse.ok) {
        const geckoData = await geckoResponse.json();
        quotes = geckoData.prices.map(([timestamp, price]: [number, number]) => ({
          timestamp,
          quote: {
            USD: { price }
          }
        }));
        usingMockData = false;
      } else {
        // Generate realistic mock data if both APIs fail
        console.log('Generating mock price data');
        quotes = generateMockPriceData(days, crypto.quote.USD.price);
      }
    }
    
    return NextResponse.json({
      quotes,
      coinId: crypto.id,
      coinName: crypto.name,
      symbol: crypto.symbol,
      currentPrice: crypto.quote.USD.price,
      priceChange24h: crypto.quote.USD.percent_change_24h,
      usingMockData,
      dataPoints: quotes.length
    });
    
  } catch (error: any) {
    console.error('Historical API error:', error.message);
    
    // Return empty quotes array on error
    return NextResponse.json(
      { 
        quotes: [], 
        error: error.message,
        usingMockData: true 
      },
      { status: 500 }
    );
  }
}

// Generate realistic mock price data for fallback
function generateMockPriceData(days: number, currentPrice: number): any[] {
  const quotes = [];
  const now = Date.now();
  let price = currentPrice;
  
  for (let i = days; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    
    // Simulate realistic price movements (max 5% change per day)
    const change = (Math.random() - 0.5) * 0.1;
    price = price * (1 + change);
    
    quotes.push({
      timestamp,
      quote: {
        USD: {
          price: Math.max(price, currentPrice * 0.1) // Never go below 10% of current price
        }
      }
    });
  }
  
  return quotes;
}