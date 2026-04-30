const DEFAULT_BASE_URL = "https://api.asksurf.ai/gateway/v1";

export interface SurfMeta {
  cached: boolean;
  credits_used: number;
  empty_reason?: string;
  has_more?: boolean;
  limit: number;
  offset: number;
  total?: number;
}

export interface LeaderboardEntry {
  address: string;
  pnl: number;
  volume: number;
  trade_count: number;
  positions: number;
  positions_won: number;
  positions_lost: number;
  positions_open: number;
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  meta: SurfMeta;
}

export interface LeaderboardParams {
  sort?: "pnl" | "volume" | "trade_count";
  limit?: number;
  offset?: number;
}

export interface SmartMoneyParams {
  view?: "positioning" | "trades";
  market?: string;
  from?: number;       // Unix seconds (inclusive lower bound)
  to?: number;         // Unix seconds (inclusive upper bound)
  limit?: number;
  offset?: number;
}

export interface SmartMoneyTradeEntry {
  taker_address?: string;
  address?: string;
  block_time: string;
  amount_usd: number;
  shares: number;
  price: number;
  outcome_label: string;
  condition_id: string;
  question?: string;
  market_slug?: string;
  event_slug?: string;
  category?: string;
  wallet_age_days?: number;
}

export interface SmartMoneyResponse {
  data: SmartMoneyTradeEntry[];
  meta: SurfMeta;
}

export interface PositionEntry {
  avg_price: number;
  cash_pnl: number;
  condition_id: string;
  cur_price: number;
  current_value: number;
  outcome_label: string;
  question: string;
  realized_pnl: number;
  redeemable: boolean;
  size: number;
}

export interface PositionsResponse {
  data: PositionEntry[];
  meta: SurfMeta;
}

export interface TradesParams {
  address?: string;
  condition_id?: string;
  outcome?: "Yes" | "No";
  type?: "trade" | "redemption" | "all";
  min_amount?: number;
  sort?: "newest" | "oldest" | "largest";
  limit?: number;
  offset?: number;
  start_time?: string;
  end_time?: string;
}

export interface TradeEntry {
  address: string;
  amount_usd: number;
  block_time: string;
  condition_id: string;
  outcome_label: string;
  price: number;
  shares: number;
  type: string;
  question?: string;
}

export interface TradesResponse {
  data: TradeEntry[];
  meta: SurfMeta;
}

export interface MarketsParams {
  market_slug?: string;
  event_slug?: string;
  status?: "open" | "closed";
  limit?: number;
  offset?: number;
}

export interface MarketOutcome {
  id: string;
  label: string;
}

export interface MarketEntry {
  condition_id: string;
  market_slug: string;
  title: string;
  status: string;
  volume_total: number;
  volume_1_week: number;
  volume_1_month: number;
  volume_1_year: number;
  event_slug?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  image?: string;
  polymarket_link?: string;
  tags?: string[];
  start_time?: number;
  end_time?: number;
  close_time?: number;
  completed_time?: number;
  game_start_time?: number;
  negative_risk_id?: string;
  resolution_source?: string;
  winning_side?: string;
  side_a: MarketOutcome;
  side_b: MarketOutcome;
}

export interface MarketsResponse {
  data: MarketEntry[];
  meta: SurfMeta;
}

export interface PricesParams {
  condition_id: string;
  interval?: "latest" | "1h" | "1d";
  start_time?: string;
  end_time?: string;
  limit?: number;
}

export interface PriceEntry {
  condition_id: string;
  outcome_label: string;
  price: number;
  timestamp: string;
}

export interface PricesResponse {
  data: PriceEntry[];
  meta: SurfMeta;
}

export interface SearchPredictionMarketParams {
  platform?: "polymarket" | "kalshi";
  category?: string;
  status?: "active" | "closed" | "finalized";
  q?: string;
  smart_money_direction?: "BULLISH" | "BEARISH" | "NEUTRAL";
  condition_id?: string;
  market_ticker?: string;
  limit?: number;
  offset?: number;
}

export interface SearchPredictionMarketEntry {
  category: string;
  condition_id?: string;
  days_to_resolution?: number;
  latest_price?: number;
  market_link?: string;
  market_ticker?: string;
  matched_counterpart?: string;
  open_interest_usd: number;
  platform: string;
  question: string;
  smart_money_direction?: string;
  status: string;
  subcategory?: string;
  trade_count_7d: number;
  volume_1d: number;
  volume_30d: number;
  volume_7d: number;
}

export interface SearchPredictionMarketResponse {
  data: SearchPredictionMarketEntry[];
  meta: SurfMeta;
}

export interface WalletLabelsParams {
  addresses: string[];
}

export interface WalletLabelEntry {
  address: string;
  label?: string;
  entity_type?: string;
}

export interface WalletLabelsResponse {
  data: WalletLabelEntry[];
  meta: SurfMeta;
}

export interface RankingParams {
  sort?: "volume_24h" | "volume_7d" | "open_interest" | "trade_count";
  limit?: number;
  offset?: number;
}

export interface MarketRankingEntry {
  condition_id: string;
  market_slug: string;
  question: string;
  volume_24h?: number;
  volume_7d?: number;
  open_interest?: number;
  trade_count?: number;
}

export interface RankingResponse {
  data: MarketRankingEntry[];
  meta: SurfMeta;
}

export class SurfClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(opts: { apiKey?: string; baseUrl?: string } = {}) {
    this.apiKey = opts.apiKey ?? process.env.SURF_API_KEY ?? "";
    this.baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
  }

  private requireKey(): void {
    if (!this.apiKey) {
      throw new Error(
        "SURF_API_KEY is required. Get a key at https://agents.asksurf.ai and set it in .env"
      );
    }
  }

  async getLeaderboard(params: LeaderboardParams = {}): Promise<LeaderboardResponse> {
    return this.request<LeaderboardResponse>(
      "/prediction-market/polymarket/leaderboard",
      params
    );
  }

  async getSmartMoney(params: SmartMoneyParams = {}): Promise<SmartMoneyResponse> {
    return this.request<SmartMoneyResponse>("/prediction-market/polymarket/smart-money", params);
  }

  async getPositions(params: { address: string; limit?: number; offset?: number }): Promise<PositionsResponse> {
    return this.request<PositionsResponse>("/prediction-market/polymarket/positions", params);
  }

  async getTrades(params: TradesParams): Promise<TradesResponse> {
    return this.request<TradesResponse>("/prediction-market/polymarket/trades", params);
  }

  async getMarkets(params: MarketsParams = {}): Promise<MarketsResponse> {
    return this.request<MarketsResponse>("/prediction-market/polymarket/markets", params);
  }

  async getPrices(params: PricesParams): Promise<PricesResponse> {
    return this.request<PricesResponse>("/prediction-market/polymarket/prices", params);
  }

  async getRanking(params: RankingParams = {}): Promise<RankingResponse> {
    return this.request<RankingResponse>("/prediction-market/polymarket/ranking", params);
  }

  async searchPredictionMarket(params: SearchPredictionMarketParams = {}): Promise<SearchPredictionMarketResponse> {
    return this.request<SearchPredictionMarketResponse>("/search/prediction-market", params);
  }

  // getWalletLabels is the one method that joins addresses as a comma-separated
  // query param, so it doesn't fit request<T>'s key/value model — kept inline for clarity.
  async getWalletLabels(params: WalletLabelsParams): Promise<WalletLabelsResponse> {
    this.requireKey();
    const url = new URL(this.baseUrl + "/wallet/labels/batch");
    url.searchParams.set("addresses", params.addresses.join(","));

    let lastErr: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
      });
      if (res.ok) return (await res.json()) as WalletLabelsResponse;
      if (res.status >= 400 && res.status < 500) {
        throw new Error(`Surf API ${res.status} on /wallet/labels/batch: ${await res.text()}`);
      }
      lastErr = new Error(`Surf API ${res.status} on /wallet/labels/batch`);
      await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)));
    }
    throw lastErr ?? new Error("Surf API request failed: /wallet/labels/batch");
  }

  private async request<T>(
    path: string,
    params: object = {}
  ): Promise<T> {
    this.requireKey();
    const url = new URL(this.baseUrl + path);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }

    let lastErr: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        return (await res.json()) as T;
      }
      if (res.status >= 400 && res.status < 500) {
        const body = await res.text();
        throw new Error(`Surf API ${res.status} on ${path}: ${body}`);
      }
      lastErr = new Error(`Surf API ${res.status} on ${path}`);
      await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)));
    }
    throw lastErr ?? new Error(`Surf API request failed: ${path}`);
  }
}
