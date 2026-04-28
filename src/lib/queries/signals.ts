import { SurfClient, type SmartMoneyTradeEntry } from "@/lib/surfClient";
import type { Signal } from "../types";
import { classifyWhaleTier } from "@/lib/whale";

const client = new SurfClient();

export async function getSignals(
  days = 7,
  limit = 100,
  offset = 0
): Promise<Signal[]> {
  const from = days > 0 ? Math.floor(Date.now() / 1000) - days * 86_400 : undefined;

  const [smartMoneyRes, leaderboardRes] = await Promise.all([
    client.getSmartMoney({ view: "trades", limit, offset, from }),
    client
      .getLeaderboard({ sort: "pnl", limit: 1000 })
      .catch(() => ({
        data: [] as Array<{
          address: string;
          pnl: number;
          volume: number;
          trade_count: number;
          positions: number;
          positions_won: number;
        }>,
        meta: { cached: false, credits_used: 0, limit: 0, offset: 0 },
      })),
  ]);

  const trades = smartMoneyRes.data;
  if (trades.length === 0) return [];

  // Build leaderboard map keyed by lowercased address (Task 5 convention).
  const lbMap = new Map<
    string,
    {
      pnl: number;
      volume: number;
      trade_count: number;
      positions: number;
      positions_won: number;
    }
  >();
  for (const e of leaderboardRes.data) {
    lbMap.set(e.address.toLowerCase(), {
      pnl: e.pnl,
      volume: e.volume,
      trade_count: e.trade_count,
      positions: e.positions,
      positions_won: e.positions_won,
    });
  }

  // Parallel-fetch latest prices for unique condition_ids only (avoid duplicate fetches).
  const uniqueConditionIds = Array.from(
    new Set(trades.map((t) => t.condition_id))
  );
  const priceResults = await Promise.all(
    uniqueConditionIds.map((cid) =>
      client
        .getPrices({ condition_id: cid, interval: "latest" })
        .then((res) => ({ cid, prices: res.data }))
        .catch(() => ({
          cid,
          prices: [] as Array<{ outcome_label: string; price: number }>,
        }))
    )
  );

  // Build prices map: condition_id → Yes price (0 if missing or not found).
  const priceMap = new Map<string, number>();
  for (const { cid, prices } of priceResults) {
    const yes = prices.find((p) => p.outcome_label === "Yes")?.price ?? 0;
    priceMap.set(cid, yes);
  }

  // Compose Signal rows by joining trades with leaderboard stats and prices.
  return trades.map((t: SmartMoneyTradeEntry): Signal => {
    const wallet_address = (t.taker_address ?? t.address ?? "").toLowerCase();
    const stats = lbMap.get(wallet_address);
    const win_rate =
      stats && stats.positions > 0
        ? stats.positions_won / stats.positions
        : 0;
    const total_pnl = stats?.pnl ?? 0;
    const bets = stats?.trade_count ?? 0;
    // roi is stored as percent (e.g. 50 for 50%), so multiply the pnl/volume fraction by 100.
    const roi =
      stats && stats.volume > 0 ? (stats.pnl / stats.volume) * 100 : 0;

    return {
      block_time: t.block_time,
      question: t.question ?? "",
      outcome_label: t.outcome_label,
      price: t.price,
      amount_usd: t.amount_usd,
      shares: t.shares,
      whale_tier: classifyWhaleTier(t.amount_usd),
      condition_id: t.condition_id,
      market_slug: t.market_slug ?? "",
      event_slug: t.event_slug ?? "",
      category: t.category ?? "",
      wallet_address,
      win_rate,
      total_pnl,
      bets,
      roi,
      current_price: priceMap.get(t.condition_id) ?? 0,
    };
  });
}
