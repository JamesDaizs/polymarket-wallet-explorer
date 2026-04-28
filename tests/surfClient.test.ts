import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SurfClient } from "../src/lib/surfClient";

describe("SurfClient", () => {
  const ORIG_KEY = process.env.SURF_API_KEY;

  beforeEach(() => {
    process.env.SURF_API_KEY = "test-key";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env.SURF_API_KEY = ORIG_KEY;
  });

  it("throws if SURF_API_KEY is missing", () => {
    delete process.env.SURF_API_KEY;
    expect(() => new SurfClient()).toThrow(/SURF_API_KEY/);
  });

  it("getLeaderboard hits the right URL with bearer auth", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          { address: "0xabc", pnl: 100, volume: 1000, trade_count: 10, positions: 5, positions_won: 3, positions_lost: 2, positions_open: 0 },
        ],
        meta: { cached: false, credits_used: 1, limit: 50, offset: 0 },
      }),
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new SurfClient();
    const res = await client.getLeaderboard({ sort: "pnl", limit: 50 });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/prediction-market/polymarket/leaderboard");
    expect(url).toContain("sort=pnl");
    expect(url).toContain("limit=50");
    expect(init.headers.Authorization).toBe("Bearer test-key");
    expect(res.data[0].address).toBe("0xabc");
  });
});
