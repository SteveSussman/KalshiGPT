import { RawMarket } from "./types";

const BASE_URL =
  process.env.KALSHI_BASE_URL || "https://api.elections.kalshi.com/trade-api/v2";

type MarketsResponse = {
  markets: RawMarket[];
  cursor?: string;
};

async function getJson<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 15 }
  });

  if (!response.ok) {
    throw new Error(`Kalshi request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function fetchOpenMarkets(limitPages = 5, pageSize = 100): Promise<RawMarket[]> {
  const all: RawMarket[] = [];
  let cursor = "";
  let pages = 0;

  while (pages < limitPages) {
    const params = new URLSearchParams({
      limit: String(pageSize),
      status: "open",
      mve_filter: "exclude"
    });

    if (cursor) {
      params.set("cursor", cursor);
    }

    const data = await getJson<MarketsResponse>(`/markets?${params.toString()}`);
    all.push(...(data.markets || []));
    cursor = data.cursor || "";
    pages += 1;

    if (!cursor) {
      break;
    }
  }

  return all;
}

export function parseDollars(value?: string): number {
  if (!value) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function parseCount(value?: string): number {
  if (!value) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
