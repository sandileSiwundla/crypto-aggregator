import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.COINMARKETCAP_API_KEY;
const BASE_URL = 'https://pro-api.coinmarketcap.com';

interface CoinQuoteUSD {
  price: number;
  volume_24h: number;
  volume_change_24h?: number;
  percent_change_1h?: number;
  percent_change_24h?: number;
  percent_change_7d?: number;
  percent_change_30d?: number;
  percent_change_60d?: number;
  percent_change_90d?: number;
  market_cap: number;
  market_cap_dominance?: number;
  fully_diluted_market_cap?: number;
}

interface Coin {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number | null;
  num_market_pairs?: number;
  date_added?: string;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  infinite_supply?: boolean;
  platform: { name: string } | null;
  quote: { USD: CoinQuoteUSD };
}

interface CoinInfo {
  id: number;
  description?: string;
  logo?: string;
  tags?: string[];
  urls?: {
    website?: string[];
    technical_doc?: string[];
    source_code?: string[];
  };
}

interface MapEntry {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  rank: number | null;
}

interface CmcEnvelope<T> {
  data?: T;
  status?: { error_code?: number; error_message?: string | null };
}

interface ExchangeRateResponse {
  rates: { ZAR: number };
}

type LookupParam = 'id' | 'symbol' | 'slug';
interface Lookup {
  param: LookupParam;
  value: string;
}

class CmcError extends Error {
  constructor(message: string, public httpStatus: number) {
    super(message);
  }
}

async function cmc<T>(path: string, revalidate: number): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-CMC_PRO_API_KEY': API_KEY as string, Accept: 'application/json' },
    next: { revalidate },
  });
  const json: CmcEnvelope<T> = await res.json();
  const code = json.status?.error_code ?? 0;
  if (!res.ok || code !== 0 || json.data === undefined) {
    throw new CmcError(json.status?.error_message || `CoinMarketCap error (${res.status})`, res.status);
  }
  return json.data;
}

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/**
 * Decide how to look the coin up.
 *  - digits                      -> CMC id
 *  - has spaces (a name)         -> resolve via cached /map list, else slug guess
 *  - short, no hyphen            -> symbol
 *  - anything else               -> slug
 * `?by=id|symbol|slug` overrides the guess.
 */
async function resolveLookup(raw: string, forced: string | null): Promise<Lookup> {
  const input = raw.trim();

  if (forced === 'id' || forced === 'symbol' || forced === 'slug') {
    return { param: forced, value: forced === 'symbol' ? input.toUpperCase() : input.toLowerCase() };
  }
  if (/^\d+$/.test(input)) return { param: 'id', value: input };

  const hasSpace = /\s/.test(input);
  if (!hasSpace && input.length <= 10 && !input.includes('-')) {
    return { param: 'symbol', value: input.toUpperCase() };
  }
  if (!hasSpace) return { param: 'slug', value: input.toLowerCase() };

  // Name with spaces: /map has no name filter, so pull the ranked list once
  // and cache it for 24h.
  try {
    const list = await cmc<MapEntry[]>(
      '/v1/cryptocurrency/map?listing_status=active&limit=5000&sort=cmc_rank&aux=platform',
      86400
    );
    const q = input.toLowerCase();
    const byRank = (a: MapEntry, b: MapEntry) => (a.rank ?? 1e9) - (b.rank ?? 1e9);
    const exact = list.filter((c) => c.name.toLowerCase() === q).sort(byRank)[0];
    const partial = list.filter((c) => c.name.toLowerCase().includes(q)).sort(byRank)[0];
    const hit = exact ?? partial;
    if (hit) return { param: 'id', value: String(hit.id) };
  } catch (e) {
    console.error('CMC map lookup failed, falling back to slug:', e);
  }
  return { param: 'slug', value: slugify(input) };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cryptoName: string }> }
) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'COINMARKETCAP_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const { cryptoName } = await params;
    const decoded = decodeURIComponent(cryptoName);
    const lookup = await resolveLookup(decoded, request.nextUrl.searchParams.get('by'));

    // v2 returns every coin sharing a symbol (v1 silently returned one).
    const quotes = await cmc<Record<string, Coin | Coin[]>>(
      `/v2/cryptocurrency/quotes/latest?${lookup.param}=${encodeURIComponent(lookup.value)}&convert=USD`,
      60
    );

    const first = Object.values(quotes)[0];
    const candidates = (Array.isArray(first) ? first : [first]).filter(Boolean);
    if (candidates.length === 0) {
      return NextResponse.json({ error: 'Cryptocurrency not found' }, { status: 404 });
    }
    candidates.sort((a, b) => (a.cmc_rank ?? 1e9) - (b.cmc_rank ?? 1e9));
    const coin = candidates[0];

    const alternatives = candidates.slice(1).map((c) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      slug: c.slug,
      cmc_rank: c.cmc_rank,
    }));

    // Info is nice-to-have; never fail the request because of it.
    let info: CoinInfo | undefined;
    try {
      const infoData = await cmc<Record<string, CoinInfo>>(
        `/v2/cryptocurrency/info?id=${coin.id}`,
        3600
      );
      info = infoData[String(coin.id)];
    } catch (error) {
      console.error('Failed to fetch CMC info:', error);
    }

    let usdToZar: number | null = null;
    try {
      const zarRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        next: { revalidate: 3600 },
      });
      const zarData: ExchangeRateResponse = await zarRes.json();
      usdToZar = zarData.rates.ZAR;
    } catch (error) {
      console.error('Failed to fetch ZAR rate:', error);
    }

    return NextResponse.json({
      coin: {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        slug: coin.slug,
        logo: info?.logo || `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
        cmc_rank: coin.cmc_rank,
        num_market_pairs: coin.num_market_pairs,
        date_added: coin.date_added,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply,
        infinite_supply: coin.infinite_supply,
        platform: coin.platform,
        quote: coin.quote,
        description: info?.description,
        tags: info?.tags,
        urls: info?.urls,
      },
      alternatives,
      usdToZar,
    });
  } catch (error: unknown) {
    if (error instanceof CmcError) {
      const notFound = /invalid value|not found|no .* found/i.test(error.message);
      return NextResponse.json(
        { error: notFound ? 'Cryptocurrency not found' : error.message },
        { status: notFound ? 404 : 502 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch cryptocurrency data';
    console.error('API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}