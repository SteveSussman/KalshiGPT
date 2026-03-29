import { NextRequest, NextResponse } from "next/server";
import { scanMarkets } from "@/lib/scanner";
import { ScannerFilters } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function numberParam(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const filters: ScannerFilters = {
    minEdgePct: numberParam(searchParams.get("minEdgePct"), 0.1),
    minLiquidity: numberParam(searchParams.get("minLiquidity"), 0),
    minVolume24h: numberParam(searchParams.get("minVolume24h"), 0),
    maxCloseHours: numberParam(searchParams.get("maxCloseHours"), 720),
    search: searchParams.get("search") || ""
  };

  try {
    const data = await scanMarkets(filters);

    return NextResponse.json({
      ok: true,
      ...data,
      filters,
      notes: [
        "This version focuses on public market data and crossed-book style opportunities.",
        "It does not place trades and does not estimate Kalshi fees.",
        "Treat this as a ranked watchlist, not a guarantee of executable arbitrage."
      ]
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scanner error";

    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status: 500 }
    );
  }
}
