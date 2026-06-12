import { NextRequest, NextResponse } from 'next/server';
import { fetchCryptoData } from '@/lib/coinmarketcap';

export async function GET(
  request: NextRequest,
  { params }: { params: { cryptoName: string } }
) {
  try {
    const cryptoName = params.cryptoName;
    const data = await fetchCryptoData(cryptoName);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch crypto data' },
      { status: 500 }
    );
  }
}