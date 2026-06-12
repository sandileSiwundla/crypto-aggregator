const API_KEY = process.env.COINMARKETCAP_API_KEY || '953d5f26c7de4a708c07385c6bec69fa';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

export async function getUSDToZARRate(): Promise<number | null> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=ZAR');
    const data = await res.json();
    return data?.rates?.ZAR ?? null;
  } catch (err) {
    console.error('Error fetching ZAR rate:', err);
    return null;
  }
}

export async function fetchCryptoData(cryptoName: string) {
  // Fetch listings to get ID
  const listingsRes = await fetch(
    `${BASE_URL}/cryptocurrency/listings/latest?limit=5000`,
    { headers: { 'X-CMC_PRO_API_KEY': API_KEY } }
  );
  const listingsData = await listingsRes.json();
  
  const crypto = listingsData.data.find(
    (coin: any) => 
      coin.name.toLowerCase() === cryptoName.toLowerCase() ||
      coin.symbol.toLowerCase() === cryptoName.toLowerCase()
  );
  
  if (!crypto) throw new Error('Cryptocurrency not found');
  
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
  
  return {
    coin: { ...quoteData.data[crypto.id], ...infoData.data[crypto.id] },
    usdToZar
  };
}