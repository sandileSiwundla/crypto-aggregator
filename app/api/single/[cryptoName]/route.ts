import { NextResponse } from 'next/server';

const API_KEY = process.env.COINMARKETCAP_API_KEY || '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

async function getUSDToZARRate() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=ZAR');
    const data = await res.json();
    return data?.rates?.ZAR ?? null;
  } catch (err) {
    console.error('Error fetching ZAR rate:', err.message);
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    const cryptoName = (await params).cryptoName.toLowerCase();

    // Fetch listings
    const listingsRes = await fetch(
      `${BASE_URL}/cryptocurrency/listings/latest?limit=5000`,
      { headers: { 'X-CMC_PRO_API_KEY': API_KEY } }
    );
    const listingsData = await listingsRes.json();

    const crypto = listingsData.data.find(
      coin => coin.name.toLowerCase() === cryptoName || 
              coin.symbol.toLowerCase() === cryptoName
    );

    if (!crypto) {
      return NextResponse.json({ error: 'Cryptocurrency not found' }, { status: 404 });
    }

    // Fetch quote and info in parallel
    const [quoteRes, infoRes, usdToZar] = await Promise.all([
      fetch(`${BASE_URL}/cryptocurrency/quotes/latest?id=${crypto.id}&convert=USD`, {
        headers: { 'X-CMC_PRO_API_KEY': API_KEY }
      }),
      fetch(`${BASE_URL}/cryptocurrency/info?id=${crypto.id}`, {
        headers: { 'X-CMC_PRO_API_KEY': API_KEY }
      }),
      getUSDToZARRate()
    ]);

    const quoteData = await quoteRes.json();
    const infoData = await infoRes.json();

    const coinData = {
      ...quoteData.data[crypto.id],
      ...infoData.data[crypto.id]
    };

    return NextResponse.json({
      coin: coinData,
      usdToZar
    });
  } catch (err) {
    console.error('Error fetching crypto data:', err.message);
    return NextResponse.json(
      { error: 'Failed to fetch crypto data', details: err.message },
      { status: 500 }
    );
  }
}