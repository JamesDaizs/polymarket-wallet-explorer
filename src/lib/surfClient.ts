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

export class SurfClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(opts: { apiKey?: string; baseUrl?: string } = {}) {
    const key = opts.apiKey ?? process.env.SURF_API_KEY;
    if (!key) {
      throw new Error(
        "SURF_API_KEY is required. Get a key at https://agents.asksurf.ai and set it in .env"
      );
    }
    this.apiKey = key;
    this.baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
  }

  async getLeaderboard(params: LeaderboardParams = {}): Promise<LeaderboardResponse> {
    return this.request<LeaderboardResponse>(
      "/prediction-market/polymarket/leaderboard",
      params as Record<string, string | number>
    );
  }

  private async request<T>(
    path: string,
    params: Record<string, string | number | undefined> = {}
  ): Promise<T> {
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
