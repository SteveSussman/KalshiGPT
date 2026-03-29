export type RawMarket = {
  ticker: string;
  event_ticker: string;
  title?: string;
  subtitle?: string;
  yes_sub_title?: string;
  no_sub_title?: string;
  status?: string;
  close_time?: string;
  last_price_dollars?: string;
  yes_bid_dollars?: string;
  yes_ask_dollars?: string;
  no_bid_dollars?: string;
  no_ask_dollars?: string;
  yes_bid_size_fp?: string;
  yes_ask_size_fp?: string;
  no_bid_size_fp?: string;
  no_ask_size_fp?: string;
  volume_fp?: string;
  volume_24h_fp?: string;
  open_interest_fp?: string;
  liquidity_dollars?: string;
  notional_value_dollars?: string;
  rules_primary?: string;
  rules_secondary?: string;
};

export type ScannerFilters = {
  minEdgePct: number;
  minLiquidity: number;
  minVolume24h: number;
  maxCloseHours: number;
  search: string;
};

export type OpportunityType = "crossed-book" | "wide-spread";

export type Opportunity = {
  id: string;
  type: OpportunityType;
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
};
