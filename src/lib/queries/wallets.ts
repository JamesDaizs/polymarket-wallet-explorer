import { SurfClient, type LeaderboardEntry } from "@/lib/surfClient";
import type { Wallet, WalletFilters, WalletSummary } from "../types";

const client = new SurfClient();

const SORT_TO_API: Record<string, "pnl" | "volume" | "trade_count"> = {
  total_pnl: "pnl",
  total_usd_volume: "volume",
  total_trades: "trade_count",
};

function mapLeaderboardToWallet(e: LeaderboardEntry): Wallet {
  const win_rate = e.positions > 0 ? e.positions_won / e.positions : 0;
  const roi = e.volume > 0 ? e.pnl / e.volume : 0;
  const avg_trade = e.trade_count > 0 ? e.volume / e.trade_count : 0;
  return {
    address: e.address,
    total_pnl: e.pnl,
    total_usd_volume: e.volume,
    total_trades: e.trade_count,
    win_rate,
    roi,
    avg_trade,
    markets_traded: e.positions,
    last_active: "",
  };
}

function applyFilters(wallets: Wallet[], f: WalletFilters): Wallet[] {
  // f.timeWindow is intentionally not honored — the public Surf leaderboard endpoint is all-time only.
  return wallets.filter((w) => {
    if (f.volumeMin !== undefined && w.total_usd_volume < f.volumeMin) return false;
    if (f.volumeMax !== undefined && w.total_usd_volume > f.volumeMax) return false;
    if (f.pnlMin !== undefined && w.total_pnl < f.pnlMin) return false;
    if (f.pnlMax !== undefined && w.total_pnl > f.pnlMax) return false;
    if (f.roiMin !== undefined && w.roi * 100 < f.roiMin) return false;
    if (f.roiMax !== undefined && w.roi * 100 > f.roiMax) return false;
    if (f.winRateMin !== undefined && w.win_rate * 100 < f.winRateMin) return false;
    if (f.winRateMax !== undefined && w.win_rate * 100 > f.winRateMax) return false;
    if (f.tradesMin !== undefined && w.total_trades < f.tradesMin) return false;
    if (f.tradesMax !== undefined && w.total_trades > f.tradesMax) return false;
    if (f.marketsMin !== undefined && w.markets_traded < f.marketsMin) return false;
    if (f.marketsMax !== undefined && w.markets_traded > f.marketsMax) return false;
    return true;
  });
}

function computeSummary(wallets: Wallet[]): WalletSummary {
  if (wallets.length === 0) {
    return {
      total_wallets: 0,
      profitable_wallets: 0,
      avg_win_rate: 0,
      high_wr_wallets: 0,
      total_volume: 0,
      total_trades: 0,
      top_pnl: 0,
      avg_roi: 0,
    };
  }
  const total_wallets = wallets.length;
  const profitable_wallets = wallets.filter((w) => w.total_pnl > 0).length;
  const avg_win_rate = wallets.reduce((s, w) => s + w.win_rate, 0) / total_wallets;
  const high_wr_wallets = wallets.filter((w) => w.win_rate >= 0.7).length;
  const total_volume = wallets.reduce((s, w) => s + w.total_usd_volume, 0);
  const total_trades = wallets.reduce((s, w) => s + w.total_trades, 0);
  const top_pnl = Math.max(...wallets.map((w) => w.total_pnl));
  const avg_roi = wallets.reduce((s, w) => s + w.roi, 0) / total_wallets;
  return {
    total_wallets,
    profitable_wallets,
    avg_win_rate,
    high_wr_wallets,
    total_volume,
    total_trades,
    top_pnl,
    avg_roi,
  };
}

export async function getWallets(
  f: WalletFilters
): Promise<{ wallets: Wallet[]; summary: WalletSummary; total: number }> {
  const apiSort = SORT_TO_API[f.sortBy] ?? "pnl";
  const { data } = await client.getLeaderboard({ sort: apiSort, limit: 500, offset: 0 });

  const all = data.map(mapLeaderboardToWallet);
  const filtered = applyFilters(all, f);

  const sortKey = f.sortBy as keyof Wallet;
  if (f.sortDir === "asc") {
    filtered.sort((a, b) => Number(a[sortKey]) - Number(b[sortKey]));
  } else {
    filtered.sort((a, b) => Number(b[sortKey]) - Number(a[sortKey]));
  }

  const summary = computeSummary(filtered);
  const total = filtered.length;
  const start = (f.page - 1) * f.pageSize;
  const wallets = filtered.slice(start, start + f.pageSize);

  return { wallets, summary, total };
}
