export interface AllocationSlice {
  label: string;
  /** Percent of the supply basis (max supply, else total supply). */
  pct: number;
  /** Optional vesting / purpose note, shown in the table. */
  note?: string;
}

export interface TokenAllocation {
  slices: AllocationSlice[];
  /** Where the numbers come from. Shown on the card so readers can trace them. */
  source: string;
  sourceUrl?: string;
  asOf?: string;
}

interface AllocationEntry {
  match: (t: { symbol: string; name: string }) => boolean;
  allocation: TokenAllocation;
}

/**
 * CoinMarketCap's API has no allocation endpoint, so this is maintained by hand
 * from each project's own whitepaper / tokenomics page.
 * Match on symbol AND name: symbols collide (several coins use "FF").
 */
export const TOKEN_ALLOCATIONS: AllocationEntry[] = [
  {
    match: (t) => t.symbol.toUpperCase() === 'FF' && /falcon/i.test(t.name),
    allocation: {
      // TODO: verify every figure against Falcon Finance's official tokenomics before publishing.
      slices: [
        { label: 'Ecosystem', pct: 35 },
        { label: 'Foundation', pct: 24 },
        { label: 'Team & contributors', pct: 20 },
        { label: 'Community airdrops & launchpad', pct: 8.3 },
        { label: 'Marketing', pct: 8.2 },
        { label: 'Investors', pct: 4.5 },
      ],
      source: 'Falcon Finance tokenomics (verify before publishing)',
      sourceUrl: undefined,
      asOf: undefined,
    },
  },
];

export function findAllocation(token: { symbol: string; name: string }): TokenAllocation | null {
  return TOKEN_ALLOCATIONS.find((e) => e.match(token))?.allocation ?? null;
}