"use client";

import { useEffect, useMemo, useState } from "react";

type ApiResponse = {
  ok: boolean;
  scannedMarkets?: number;
  totalMatches?: number;
  crossedMatches?: number;
  averageCrossedEdgePct?: number;
  generatedAt?: string;
  filters?: {
    minEdgePct: number;
    minLiquidity: number;
    minVolume24h: number;
    maxCloseHours: number;
    search: string;
  };
  notes?: string[];
  opportunities?: Array<{
    id: string;
    type: "crossed-book" | "wide-spread";
    marketTicker: string;
    eventTicker: string;
    title: string;
    summary: string;
    status: string;
    closeTime?: string;
    yesBid: number;
    yesAsk: number;
    noBid: number;
    noAsk: number;
    liquidity: number;
    volume24h: number;
    crossedEdgePct: number;
    grossReturnPct: number;
    score: number;
    capacityContracts: number;
    confidence: "high" | "medium" | "low";
    url: string;
  }>;
  error?: string;
};

const DEFAULTS = {
  minEdgePct: "0.10",
  minLiquidity: "0",
  minVolume24h: "0",
  maxCloseHours: "720",
  search: ""
};

function confidenceClass(value: "high" | "medium" | "low") {
  if (value === "high") return "good";
  if (value === "medium") return "warn";
  return "muted";
}

export default function HomePage() {
  const [minEdgePct, setMinEdgePct] = useState(DEFAULTS.minEdgePct);
  const [minLiquidity, setMinLiquidity] = useState(DEFAULTS.minLiquidity);
  const [minVolume24h, setMinVolume24h] = useState(DEFAULTS.minVolume24h);
  const [maxCloseHours, setMaxCloseHours] = useState(DEFAULTS.maxCloseHours);
  const [search, setSearch] = useState(DEFAULTS.search);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      minEdgePct,
      minLiquidity,
      minVolume24h,
      maxCloseHours,
      search
    });
    return params.toString();
  }, [minEdgePct, minLiquidity, minVolume24h, maxCloseHours, search]);

  async function fetchData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/opportunities?${queryString}`, { cache: "no-store" });
      const json = (await response.json()) as ApiResponse;
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [queryString]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, queryString]);

  return (
    <main className="page">
      <div className="container">
        <section className="hero">
          <div className="pill">Kalshi Scanner v1 • crossed books first</div>
          <h1>Live watchlist for potential Kalshi mispricings</h1>
          <p>
            This starter build pulls public market data and ranks open markets for possible crossed-book opportunities
            using a simple, transparent formula. It is deliberately conservative in scope: no trading, no auth, no
            scraping, and no black-box magic.
          </p>
        </section>

        <section className="card">
          <div className="grid filters">
            <div className="field">
              <label className="label">Minimum crossed edge %</label>
              <input className="input" value={minEdgePct} onChange={(e) => setMinEdgePct(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Minimum liquidity ($)</label>
              <input className="input" value={minLiquidity} onChange={(e) => setMinLiquidity(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Minimum 24h volume</label>
              <input className="input" value={minVolume24h} onChange={(e) => setMinVolume24h(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Max hours until close</label>
              <input className="input" value={maxCloseHours} onChange={(e) => setMaxCloseHours(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Search</label>
              <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="inflation, weather, Trump..." />
            </div>
          </div>

          <div className="toolbar" style={{ marginTop: 16 }}>
            <button className="button primary" onClick={fetchData}>
              {loading ? "Refreshing..." : "Refresh now"}
            </button>
            <button className="button" onClick={() => setAutoRefresh((x) => !x)}>
              Auto-refresh: {autoRefresh ? "on" : "off"}
            </button>
            <button
              className="button"
              onClick={() => {
                setMinEdgePct(DEFAULTS.minEdgePct);
                setMinLiquidity(DEFAULTS.minLiquidity);
                setMinVolume24h(DEFAULTS.minVolume24h);
                setMaxCloseHours(DEFAULTS.maxCloseHours);
                setSearch(DEFAULTS.search);
              }}
            >
              Reset filters
            </button>
            <span className="small muted">
              Refreshes every 30s when auto-refresh is on.
            </span>
          </div>
        </section>

        <section className="grid kpi-grid">
          <div className="card">
            <div className="label">Markets scanned</div>
            <div className="kpi-value">{data?.scannedMarkets ?? "—"}</div>
          </div>
          <div className="card">
            <div className="label">Matches after filters</div>
            <div className="kpi-value">{data?.totalMatches ?? "—"}</div>
          </div>
          <div className="card">
            <div className="label">Crossed-book matches</div>
            <div className="kpi-value good">{data?.crossedMatches ?? "—"}</div>
          </div>
          <div className="card">
            <div className="label">Avg crossed edge</div>
            <div className="kpi-value warn">
              {typeof data?.averageCrossedEdgePct === "number"
                ? `${data.averageCrossedEdgePct.toFixed(2)}%`
                : "—"}
            </div>
          </div>
        </section>

        <section className="card" style={{ marginBottom: 16 }}>
          <div className="section-title">How to read this</div>
          <p className="muted" style={{ marginTop: 0 }}>
            The core signal here is whether <strong>YES bid + NO bid &gt; 1.00</strong>, which can indicate a crossed
            book worth checking. Kalshi’s order book returns bid ladders for both YES and NO, and the reciprocal
            relationship means a YES bid at price X corresponds to a NO ask at 1−X. This app uses public market data
            and displays possible opportunities to investigate manually.
          </p>
          {data?.notes?.length ? (
            <ul className="muted">
              {data.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
          <div className="small muted">
            Generated: {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : "—"}
          </div>
        </section>

        <section className="card">
          <div className="section-title">Opportunity table</div>
          {data?.error ? <p className="bad">{data.error}</p> : null}
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Confidence</th>
                  <th>Market</th>
                  <th>Event</th>
                  <th>Crossed edge</th>
                  <th>YES bid / ask</th>
                  <th>NO bid / ask</th>
                  <th>Capacity</th>
                  <th>Liquidity</th>
                  <th>24h vol</th>
                  <th>Close</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {(data?.opportunities || []).map((row) => (
                  <tr key={row.id}>
                    <td>{row.type}</td>
                    <td className={confidenceClass(row.confidence)}>{row.confidence}</td>
                    <td>
                      <div><strong>{row.title}</strong></div>
                      <div className="small muted">{row.marketTicker}</div>
                      <div className="small"><a href={row.url} target="_blank" rel="noreferrer">Open on Kalshi</a></div>
                    </td>
                    <td>{row.eventTicker}</td>
                    <td className={row.crossedEdgePct > 0 ? "good" : "muted"}>
                      {row.crossedEdgePct.toFixed(2)}%
                    </td>
                    <td>{row.yesBid.toFixed(4)} / {row.yesAsk.toFixed(4)}</td>
                    <td>{row.noBid.toFixed(4)} / {row.noAsk.toFixed(4)}</td>
                    <td>{row.capacityContracts}</td>
                    <td>{row.liquidity.toFixed(2)}</td>
                    <td>{row.volume24h.toFixed(0)}</td>
                    <td>{row.closeTime ? new Date(row.closeTime).toLocaleString() : "—"}</td>
                    <td className="small">{row.summary}</td>
                  </tr>
                ))}
                {!data?.opportunities?.length && !data?.error ? (
                  <tr>
                    <td colSpan={12} className="muted">
                      No matches for the current filter set.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card" style={{ marginTop: 16 }}>
          <div className="section-title">Next upgrades I’d make</div>
          <ol className="muted" style={{ marginTop: 0 }}>
            <li>Pull full order books per candidate market and calculate executable size by level, not just summary quotes.</li>
            <li>Add fee estimates and a true post-friction edge calculation.</li>
            <li>Detect mutually exclusive bucket sets within the same event and score underrounds/overrounds.</li>
            <li>Save watchlists and add Telegram/email alerts.</li>
            <li>Add authenticated endpoints later for position tracking and trade journaling.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
