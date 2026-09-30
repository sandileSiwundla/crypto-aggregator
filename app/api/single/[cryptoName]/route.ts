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

interface Alternative {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number | null;
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

async function cmc<T>(path: string, revalidate: number | false): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-CMC_PRO_API_KEY': API_KEY as string, Accept: 'application/json' },
    ...(revalidate === false ? { cache: 'no-store' as const } : { next: { revalidate } }),
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

const rankOf = (r: number | null | undefined) => r ?? 1e9;

/* ---------- ranked coin list, cached in memory ----------
 * The full /map list is bigger than Next's 2 MB fetch-cache limit, so it is
 * cached in module memory instead (refreshed every 24h).
 */
const MAP_TTL_MS = 24 * 60 * 60 * 1000;
let mapCache: { at: number; list: MapEntry[] } | null = null;

async function getMap(): Promise<MapEntry[]> {
  if (mapCache && Date.now() - mapCache.at < MAP_TTL_MS) return mapCache.list;
  const list = await cmc<MapEntry[]>(
    '/v1/cryptocurrency/map?listing_status=active&limit=5000&sort=cmc_rank',
    false
  );
  mapCache = { at: Date.now(), list };
  return list;
}

/**
 * Resolve user input to a CMC coin id.
 *
 * Priority (lowest cmc_rank wins inside a tier):
 *   1. exact slug or exact name   ("bitcoin", "Falcon Finance")
 *   2. exact symbol               ("BTC", "FF")
 *   3. partial name
 *
 * Names beat tickers on purpose: another coin can use "BITCOIN" as its symbol.
 */
function resolveFromMap(input: string, list: MapEntry[]): { id: number; alternatives: Alternative[] } | null {
  const q = input.trim().toLowerCase();
  const qSlug = slugify(input);
  const qSym = input.trim().toUpperCase();
  const byRank = (a: MapEntry, b: MapEntry) => rankOf(a.rank) - rankOf(b.rank);

  const identity = list.filter((c) => c.slug === qSlug || c.name.toLowerCase() === q).sort(byRank);
  const symbol = list.filter((c) => c.symbol.toUpperCase() === qSym).sort(byRank);
  const partial = q.length >= 3 ? list.filter((c) => c.name.toLowerCase().includes(q)).sort(byRank) : [];

  const ordered = [...identity, ...symbol, ...partial];
  const seen = new Set<number>();
  const unique = ordered.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
  if (unique.length === 0) return null;

  const [best, ...rest] = unique;
  return {
    id: best.id,
    alternatives: rest.slice(0, 5).map((c) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      slug: c.slug,
      cmc_rank: c.rank,
    })),
  };
}

/** Pull the coin candidates out of a v2 quotes response (object or array per key). */
function extractCoins(quotes: Record<string, Coin | Coin[]>): Coin[] {
  const out: Coin[] = [];
  for (const v of Object.values(quotes)) {
    if (Array.isArray(v)) out.push(...v);
    else if (v) out.push(v);
  }
  return out;
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
    const input = decodeURIComponent(cryptoName).trim();
    const forced = request.nextUrl.searchParams.get('by');

    let coin: Coin | undefined;
    let alternatives: Alternative[] = [];

    const fetchQuotes = (l: Lookup) =>
      cmc<Record<string, Coin | Coin[]>>(
        `/v2/cryptocurrency/quotes/latest?${l.param}=${encodeURIComponent(l.value)}&convert=USD`,
        60
      );

    if (forced === 'id' || forced === 'symbol' || forced === 'slug') {
      // Explicit override: no guessing.
      const value = forced === 'symbol' ? input.toUpperCase() : input.toLowerCase();
      const found = extractCoins(await fetchQuotes({ param: forced, value })).sort(
        (a, b) => rankOf(a.cmc_rank) - rankOf(b.cmc_rank)
      );
      coin = found[0];
      alternatives = found.slice(1).map((c) => ({
        id: c.id, name: c.name, symbol: c.symbol, slug: c.slug, cmc_rank: c.cmc_rank,
      }));
    } else if (/^\d+$/.test(input)) {
      coin = extractCoins(await fetchQuotes({ param: 'id', value: input }))[0];
    } else {
      let resolvedId: number | null = null;
      try {
        const hit = resolveFromMap(input, await getMap());
        if (hit) {
          resolvedId = hit.id;
          alternatives = hit.alternatives;
        }
      } catch (e) {
        console.error('CMC map lookup failed, falling back to slug then symbol:', e);
      }

      if (resolvedId !== null) {
        coin = extractCoins(await fetchQuotes({ param: 'id', value: String(resolvedId) }))[0];
      } else {
        // Fallback: slug first (identity), then symbol.
        const attempts: Lookup[] = [
          { param: 'slug', value: slugify(input) },
          { param: 'symbol', value: input.toUpperCase() },
        ];
        for (const attempt of attempts) {
          try {
            const found = extractCoins(await fetchQuotes(attempt)).sort(
              (a, b) => rankOf(a.cmc_rank) - rankOf(b.cmc_rank)
            );
            if (found.length > 0) {
              coin = found[0];
              alternatives = found.slice(1).map((c) => ({
                id: c.id, name: c.name, symbol: c.symbol, slug: c.slug, cmc_rank: c.cmc_rank,
              }));
              break;
            }
          } catch (e) {
            if (!(e instanceof CmcError) || e.httpStatus >= 500 || e.httpStatus === 429) throw e;
          }
        }
      }
    }

    if (!coin) {
      return NextResponse.json({ error: 'Cryptocurrency not found' }, { status: 404 });
    }

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
        { status: notFound ? 404 : error.httpStatus === 429 ? 429 : 502 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch cryptocurrency data';
    console.error('API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}