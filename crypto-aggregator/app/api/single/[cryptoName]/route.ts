import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.COINMARKETCAP_API_KEY || '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: { cryptoName: string } }
) {
  try {
    // Await params in Next.js 15+
    const { cryptoName } = await params;
    const searchName = cryptoName.toLowerCase();
    
    console.log('Fetching crypto:', searchName);

    // 1️⃣ Fetch all listings
    const listingsResponse = await fetch(
      `${BASE_URL}/cryptocurrency/listings/latest?limit=5000`,
      {
        headers: { 'X-CMC_PRO_API_KEY': API_KEY },
        next: { revalidate: 60 } // Cache for 60 seconds
      }
    );

    if (!listingsResponse.ok) {
      throw new Error(`Listings API failed: ${listingsResponse.status}`);
    }

    const listingsData = await listingsResponse.json();
    
    if (!listingsData?.data) {
      throw new Error('No data from CoinMarketCap');
    }

    // Find the cryptocurrency
    const crypto = listingsData.data.find(
      (coin: any) =>
        coin.name?.toLowerCase() === searchName ||
        coin.symbol?.toLowerCase() === searchName
    );

    if (!crypto) {
      return NextResponse.json(
        { error: `Cryptocurrency "${cryptoName}" not found` },
        { status: 404 }
      );
    }

    // 2️⃣ Fetch quote and info in parallel
    const [quoteRes, infoRes] = await Promise.all([
      fetch(
        `${BASE_URL}/cryptocurrency/quotes/latest?id=${crypto.id}&convert=USD`,
        { headers: { 'X-CMC_PRO_API_KEY': API_KEY } }
      ),
      fetch(
        `${BASE_URL}/cryptocurrency/info?id=${crypto.id}`,
        { headers: { 'X-CMC_PRO_API_KEY': API_KEY } }
      )
    ]);

    if (!quoteRes.ok || !infoRes.ok) {
      throw new Error('Failed to fetch quote or info');
    }

    const quoteData = await quoteRes.json();
    const infoData = await infoRes.json();

    // 3️⃣ Fetch ZAR exchange rate
    let usdToZar = null;
    try {
      const zarRes = await fetch('https://api.frankfurter.app/latest?from=USD&to=ZAR');
      const zarData = await zarRes.json();
      usdToZar = zarData?.rates?.ZAR ?? null;
    } catch (err) {
      console.warn('Could not fetch ZAR rate:', err);
    }

    // Combine the data
    const coinData = {
      ...quoteData.data[crypto.id],
      ...infoData.data[crypto.id]
    };

    return NextResponse.json({
      coin: coinData,
      usdToZar
    });

  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to fetch crypto data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}