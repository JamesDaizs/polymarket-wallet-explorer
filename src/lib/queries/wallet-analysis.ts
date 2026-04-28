import { SurfClient } from "@/lib/surfClient";
import type { WalletProfile, WalletTrade } from "../types";

const client = new SurfClient();

function classifyWhaleTier(amount_usd: number): string {
  if (amount_usd >= 100_000) return "whale";
  if (amount_usd >= 10_000) return "large";
  if (amount_usd >= 1_000) return "medium";
  return "small";
}

export async function getWalletProfile(
  address: string
): Promise<WalletProfile | null> {
  const [positionsRes, tradesRes, leaderboardRes] = await Promise.all([
    client.getPositions({ address, limit: 500 }),
    client.getTrades({ address, limit: 1000, sort: "newest" }),
    client
      .getLeaderboard({ sort: "pnl", limit: 1000 })
      .catch(() => ({
        data: [] as Array<{
          address: string;
          positions: number;
          positions_won: number;
        }>,
      })),
  ]);

  if (positionsRes.data.length === 0 && tradesRes.data.length === 0) {
    return null;
  }

  const total_pnl = positionsRes.data.reduce(
    (s, p) => s + (p.realized_pnl ?? 0),
    0
  );
  const total_usd_volume = tradesRes.data.reduce(
    (s, t) => s + (t.amount_usd ?? 0),
    0
  );
  const total_trades = tradesRes.data.length;
  const positions_count = positionsRes.data.length;

  const lbEntry = leaderboardRes.data.find(
    (e) => e.address.toLowerCase() === address.toLowerCase()
  );
  const win_rate =
    lbEntry && lbEntry.positions > 0
      ? lbEntry.positions_won / lbEntry.positions
      : 0;

  const roi = total_usd_volume > 0 ? total_pnl / total_usd_volume : 0;
  const avg_trade_size_usd =
    total_trades > 0 ? total_usd_volume / total_trades : 0;
  const last_trade_date =
    tradesRes.data.length > 0 ? tradesRes.data[0].block_time : "";

  return {
    address,
    total_pnl,
    total_usd_volume,
    total_trades,
    positions_count,
    win_rate,
    roi,
    avg_trade_size_usd,
    last_trade_date,
  };
}

export async function getRecentTrades(
  address: string,
  limit = 20
): Promise<WalletTrade[]> {
  const { data } = await client.getTrades({ address, limit, sort: "newest" });
  return data.map((t) => ({
    block_time: t.block_time,
    question: t.question ?? "",
    outcome_label: t.outcome_label,
    price: t.price,
    amount_usd: t.amount_usd,
    shares: t.shares,
    whale_tier: classifyWhaleTier(t.amount_usd),
    condition_id: t.condition_id,
    category: "",
    event_slug: "",
  }));
}
