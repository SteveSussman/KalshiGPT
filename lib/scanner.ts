import { fetchOpenMarkets, parseCount, parseDollars } from "./kalshi";
import { Opportunity, RawMarket, ScannerFilters } from "./types";

function normalizeTitle(m: RawMarket): string {
  return m.title || m.subtitle || m.yes_sub_title || m.ticker;
}

function hoursUntil(closeTime?: string): number {
  if (!closeTime) return Number.POSITIVE_INFINITY;
  const ms = new Date(closeTime).getTime() - Date.now();
  return ms / 36e5;
}

function confidenceFromInputs(edgePct: number, liquidity: number, volume24h: number): "high" | "medium" | "low" {
  if (edgePct >= 1.5 && liquidity >= 1000 && volume24h >= 500) return "high";
  if (edgePct >= 0.6 && liquidity >= 300) return "medium";
  return "low";
}

function scoreOpportunity({
  edgePct,
  liquidity,
  volume24h,
  spreadPenalty
}: {
  edgePct: number;
  liquidity: number;
  volume24h: number;
  spreadPenalty: number;
}): number {
  return (
    edgePct * 55 +
    Math.min(liquidity, 3000) / 80 +
    Math.min(volume24h, 3000) / 150 -
    spreadPenalty * 30
  );
}

function buildOpportunity(m: RawMarket): Opportunity | null {
  const yesBid = parseDollars(m.yes_bid_dollars);
  const yesAsk = parseDollars(m.yes_ask_dollars);
  const noBid = parseDollars(m.no_bid_dollars);
  const noAsk = parseDollars(m.no_ask_dollars);
  const liquidity = parseDollars(m.liquidity_dollars);
  const volume24h = parseCount(m.volume_24h_fp);

  const crossedEdgePct = Math.max(0, (yesBid + noBid - 1) * 100);
  const wideSpreadPenalty = Math.max(0, (yesAsk - yesBid) + (noAsk - noBid));
  const capacityContracts = Math.floor(
    Math.min(
      parseCount(m.yes_bid_size_fp) || Infinity,
      parseCount(m.no_bid_size_fp) || Infinity
    )
  );

  const type = crossedEdgePct > 0 ? "crossed-book" : "wide-spread";
  const grossReturnPct = crossedEdgePct;
  const confidence = confidenceFromInputs(crossedEdgePct, liquidity, volume24h);
  const score = scoreOpportunity({
    edgePct: crossedEdgePct,
    liquidity,
    volume24h,
    spreadPenalty: wideSpreadPenalty
  });

  const summary =
    crossedEdgePct > 0
      ? `Potential crossed book: YES bid + NO bid = ${(yesBid + noBid).toFixed(4)}`
      : `No direct crossed book. Displayed for monitoring only because the spread is wide.`;

  return {
    id: `${m.ticker}-${type}`,
    type,
    marketTicker: m.ticker,
    eventTicker: m.event_ticker,
    title: normalizeTitle(m),
    summary,
    status: m.status || "unknown",
    closeTime: m.close_time,
    yesBid,
    yesAsk,
    noBid,
    noAsk,
    liquidity,
    volume24h,
    crossedEdgePct,
    grossReturnPct,
    score,
    capacityContracts: Number.isFinite(capacityContracts) ? Math.max(0, capacityContracts) : 0,
    confidence,
    url: `https://kalshi.com/markets/${m.event_ticker?.toLowerCase()}/${m.ticker?.toLowerCase()}`
  };
}

function matchesSearch(value: string, q: string): boolean {
  if (!q) return true;
  return value.toLowerCase().includes(q.toLowerCase());
}

function passesFilters(opp: Opportunity, filters: ScannerFilters): boolean {
  if (opp.crossedEdgePct < filters.minEdgePct) return false;
  if (opp.liquidity < filters.minLiquidity) return false;
  if (opp.volume24h < filters.minVolume24h) return false;
  if (hoursUntil(opp.closeTime) > filters.maxCloseHours) return false;

  const haystack = [
    opp.title,
    opp.marketTicker,
    opp.eventTicker,
    opp.summary
  ].join(" ");

  return matchesSearch(haystack, filters.search);
}

export async function scanMarkets(filters: ScannerFilters) {
  const rawMarkets = await fetchOpenMarkets(6, 100);

  const opportunities = rawMarkets
    .map(buildOpportunity)
    .filter((x): x is Opportunity => Boolean(x))
    .filter((opp) => passesFilters(opp, filters))
    .sort((a, b) => b.score - a.score || b.crossedEdgePct - a.crossedEdgePct);

  const crossed = opportunities.filter((o) => o.type === "crossed-book");
  const avgEdge =
    crossed.length > 0
      ? crossed.reduce((sum, o) => sum + o.crossedEdgePct, 0) / crossed.length
      : 0;

  return {
    scannedMarkets: rawMarkets.length,
    totalMatches: opportunities.length,
    crossedMatches: crossed.length,
    averageCrossedEdgePct: avgEdge,
    generatedAt: new Date().toISOString(),
    opportunities
  };
}
