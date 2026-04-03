import { queryClickHouse, escapeString } from "../clickhouse";
import type { WalletProfile, WalletTrade } from "../types";

interface ProfileRow {
  address: string;
  total_pnl: string;
  total_usd_volume: string;
  total_trades: string;
  positions_count: string;
  win_rate: string;
  roi: string;
  avg_trade_size_usd: string;
  last_trade_date: string;
}

interface TradeRow {
  block_time: string;
  question: string;
  outcome_label: string;
  price: string;
  amount_usd: string;
  shares: string;
  whale_tier: string;
  condition_id: string;
  category: string;
  event_slug: string;
}

export async function getWalletProfile(
  address: string
): Promise<WalletProfile | null> {
  const safe = escapeString(address).toLowerCase();
  const sql = `
    SELECT
      address,
      total_pnl,
      total_usd_volume,
      total_trades,
      positions_count,
      coalesce(win_rate, 0) AS win_rate,
      if(total_usd_volume > 0, total_pnl / total_usd_volume, 0) AS roi,
      coalesce(avg_trade_size_usd, 0) AS avg_trade_size_usd,
      toString(last_trade_date) AS last_trade_date
    FROM polymarket_polygon.wallet_profiles
    WHERE lower(address) = '${safe}'
    LIMIT 1
  `;

  const rows = await queryClickHouse<ProfileRow>(sql);
  if (rows.length === 0) return null;
  return parseProfileRow(rows[0]);
}

export async function getRecentTrades(
  address: string,
  limit = 20
): Promise<WalletTrade[]> {
  const safe = escapeString(address).toLowerCase();
  const sql = `
    SELECT
      toString(block_time) AS block_time,
      question,
      outcome_label,
      price,
      amount_usd,
      shares,
      whale_tier,
      condition_id,
      coalesce(category, '') AS category,
      coalesce(event_slug, '') AS event_slug
    FROM polymarket_polygon.whale_trades_enriched
    WHERE lower(taker_address) = '${safe}'
    ORDER BY block_time DESC
    LIMIT ${limit}
  `;

  const rows = await queryClickHouse<TradeRow>(sql);
  return rows.map(parseTradeRow);
}

function parseProfileRow(r: ProfileRow): WalletProfile {
  return {
    address: r.address,
    total_pnl: parseFloat(r.total_pnl) || 0,
    total_usd_volume: parseFloat(r.total_usd_volume) || 0,
    total_trades: parseInt(r.total_trades) || 0,
    positions_count: parseInt(r.positions_count) || 0,
    win_rate: parseFloat(r.win_rate) || 0,
    roi: parseFloat(r.roi) || 0,
    avg_trade_size_usd: parseFloat(r.avg_trade_size_usd) || 0,
    last_trade_date: r.last_trade_date,
  };
}

function parseTradeRow(r: TradeRow): WalletTrade {
  return {
    block_time: r.block_time,
    question: r.question || "Unknown Market",
    outcome_label: r.outcome_label || "",
    price: parseFloat(r.price) || 0,
    amount_usd: parseFloat(r.amount_usd) || 0,
    shares: parseFloat(r.shares) || 0,
    whale_tier: r.whale_tier || "",
    condition_id: r.condition_id || "",
    category: r.category,
    event_slug: r.event_slug,
  };
}
