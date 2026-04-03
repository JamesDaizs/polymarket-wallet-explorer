// ─── HOME page ──────────────────────────────────────────────
export interface Market {
  condition_id: string;
  question: string;
  category: string;
  image: string;
  icon: string;
  event_slug: string;
  market_slug: string;
  market_end_date: string;
  volume_total: number;
  volume_1wk: number;
  polymarket_link: string;
  tags: string;
  yes_price: number;
  no_price: number;
  last_trade_time: string;
}

// ─── SIGNALS page ───────────────────────────────────────────
export interface Signal {
  block_time: string;
  question: string;
  outcome_label: string;
  price: number;
  amount_usd: number;
  shares: number;
  whale_tier: string;
  condition_id: string;
  market_slug: string;
  event_slug: string;
  category: string;
  wallet_address: string;
  win_rate: number;
  total_pnl: number;
  bets: number;
  roi: number;
  current_price: number;
}

export type SignalStrength = "HIGH" | "MED" | "LOW";

export function getSignalStrength(
  winRate: number,
  pnl: number
): SignalStrength {
  if (winRate >= 0.75 && pnl > 50000) return "HIGH";
  if (winRate >= 0.6 && pnl > 10000) return "MED";
  return "LOW";
}

// ─── WALLET FILTER page ─────────────────────────────────────
export interface Wallet {
  address: string;
  win_rate: number;
  total_pnl: number;
  roi: number;
  total_usd_volume: number;
  avg_trade: number;
  total_trades: number;
  last_active: string;
  markets_traded: number;
}

export interface WalletFilters {
  timeWindow: "7d" | "14d" | "30d" | "all";
  volumeMin?: number;
  volumeMax?: number;
  pnlMin?: number;
  pnlMax?: number;
  roiMin?: number;
  roiMax?: number;
  winRateMin?: number;
  winRateMax?: number;
  tradesMin?: number;
  tradesMax?: number;
  marketsMin?: number;
  marketsMax?: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface WalletSummary {
  total_wallets: number;
  profitable_wallets: number;
  avg_win_rate: number;
  high_wr_wallets: number;
  total_volume: number;
  total_trades: number;
  top_pnl: number;
  avg_roi: number;
}

// ─── WALLET ANALYSIS page ──────────────────────────────────
export interface WalletProfile {
  address: string;
  total_pnl: number;
  total_usd_volume: number;
  total_trades: number;
  positions_count: number;
  win_rate: number;
  roi: number;
  avg_trade_size_usd: number;
  last_trade_date: string;
}

export interface WalletTrade {
  block_time: string;
  question: string;
  outcome_label: string;
  price: number;
  amount_usd: number;
  shares: number;
  whale_tier: string;
  condition_id: string;
  category: string;
  event_slug: string;
}
