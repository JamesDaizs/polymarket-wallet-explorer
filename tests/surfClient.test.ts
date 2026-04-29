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

  it("throws on first request if SURF_API_KEY is missing", async () => {
    delete process.env.SURF_API_KEY;
    const client = new SurfClient();
    await expect(client.getLeaderboard()).rejects.toThrow(/SURF_API_KEY/);
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

  it("getPositions sends address and parses positions", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            avg_price: 0.4,
            cash_pnl: 5,
            condition_id: "0xfeed",
            cur_price: 0.5,
            current_value: 50,
            outcome_label: "Yes",
            question: "Will X happen?",
            realized_pnl: 0,
            redeemable: false,
            size: 100,
          },
        ],
        meta: { cached: false, credits_used: 1, limit: 50, offset: 0 },
      }),
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new SurfClient();
    const res = await client.getPositions({ address: "0xabc" });
    expect(fetchMock.mock.calls[0][0]).toContain("address=0xabc");
    expect(res.data[0].condition_id).toBe("0xfeed");
  });

  it("retries 5xx and eventually succeeds", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}), text: async () => "down" })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [], meta: { cached: false, credits_used: 0, limit: 50, offset: 0 } }),
        text: async () => "",
      });
    vi.stubGlobal("fetch", fetchMock);

    const client = new SurfClient();
    const res = await client.getLeaderboard();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res.data).toEqual([]);
  });

  it("throws on 4xx with body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
      text: async () => "unauthorized",
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new SurfClient();
    await expect(client.getLeaderboard()).rejects.toThrow(/401.*unauthorized/);
  });
});
