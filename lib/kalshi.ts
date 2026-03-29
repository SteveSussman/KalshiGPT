const BASE_URL =
  process.env.KALSHI_BASE_URL || "https://api.elections.kalshi.com/trade-api/v2";

export async function fetchMarkets() {
  const res = await fetch(`${BASE_URL}/markets?limit=100`);
  const data = await res.json();
  return data.markets || [];
}

export function parseDollars(value?: string): number {
  return value ? Number(value) : 0;
}

export function parseCount(value?: string): number {
  return value ? Number(value) : 0;
}
