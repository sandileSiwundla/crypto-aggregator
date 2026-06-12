import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.COINMARKETCAP_API_KEY || '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: { cryptoName: string } }
) {
  try {
    const { cryptoName } = await params;
    
    // First, get the coin ID
    const listingsResponse = await fetch(
      `${BASE_URL}/cryptocurrency/listings/latest?limit=5000`,
      { headers: { 'X-CMC_PRO_API_KEY': API_KEY } }
    );
    
    const listingsData = await listingsResponse.json();
    const crypto = listingsData.data?.find(
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
    
    // Note: Historical data requires a paid CoinMarketCap plan
    // For free tier, we return mock data structure
    return NextResponse.json({
      quotes: [],
      message: 'Historical data requires a premium CoinMarketCap plan. Using chart with sample data.',
      coinId: crypto.id,
      coinName: crypto.name
    });
    
  } catch (error: any) {
    console.error('Historical API error:', error.message);
    return NextResponse.json(
      { quotes: [], error: error.message },
      { status: 500 }
    );
  }
}