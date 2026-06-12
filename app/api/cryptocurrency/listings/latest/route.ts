import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.COINMARKETCAP_API_KEY || '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '10';
    const start = searchParams.get('start') || '1';
    
    const response = await fetch(
      `${BASE_URL}/cryptocurrency/listings/latest?limit=${limit}&start=${start}`,
      {
        headers: { 'X-CMC_PRO_API_KEY': API_KEY },
        next: { revalidate: 60 } // Cache for 60 seconds
      }
    );
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      data: data.data,
      status: data.status
    });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    console.error('Listings API error:', message);
    return NextResponse.json(
      { error: message, data: [] },
      { status: 500 }
    );
  }
}