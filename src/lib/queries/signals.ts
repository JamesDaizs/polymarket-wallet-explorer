import { queryClickHouse } from "../clickhouse";
import type { Signal } from "../types";

interface SignalRow {
  block_time: string;
  question: string;
  outcome_label: string;
  price: string;
  amount_usd: string;
  shares: string;
  whale_tier: string;
  condition_id: string;
  market_slug: string;
  event_slug: string;
  category: string;
  wallet_address: string;
  win_rate: string;
  total_pnl: string;
  bets: string;
  roi: string;
  current_price: string;
}

export async function getSignals(
  days = 7,
  limit = 100,
  offset = 0
): Promise<Signal[]> {
  const sql = `
    SELECT
      toString(wt.block_time) AS block_time,
      wt.question,
      wt.outcome_label,
      wt.price,
      wt.amount_usd,
      wt.shares,
      wt.whale_tier,
      wt.condition_id,
      coalesce(wt.market_slug, '') AS market_slug,
      coalesce(wt.event_slug, '') AS event_slug,
      coalesce(wt.category, '') AS category,
      wt.taker_address AS wallet_address,
      wp.win_rate,
      wp.total_pnl,
      wp.total_trades AS bets,
      if(wp.total_usd_volume > 0, wp.total_pnl / wp.total_usd_volume * 100, 0) AS roi,
      coalesce(p.last_price, 0) AS current_price
    FROM polymarket_polygon.whale_trades_enriched wt
    JOIN polymarket_polygon.wallet_profiles wp
      ON wt.taker_address = wp.address
    LEFT JOIN polymarket_realtime.prices_latest_store p
      ON wt.condition_id = p.condition_id AND wt.outcome_label = p.outcome_label
    WHERE wt.block_date >= today() - ${days}
      AND wp.total_pnl > 1000
      AND wp.win_rate > 0.5
    ORDER BY wt.block_time DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const rows = await queryClickHouse<SignalRow>(sql);
  return rows.map(parseSignalRow);
}

function parseSignalRow(r: SignalRow): Signal {
  return {
    block_time: r.block_time,
    question: r.question,
    outcome_label: r.outcome_label,
    price: parseFloat(r.price) || 0,
    amount_usd: parseFloat(r.amount_usd) || 0,
    shares: parseFloat(r.shares) || 0,
    whale_tier: r.whale_tier,
    condition_id: r.condition_id,
    market_slug: r.market_slug,
    event_slug: r.event_slug,
    category: r.category,
    wallet_address: r.wallet_address,
    win_rate: parseFloat(r.win_rate) || 0,
    total_pnl: parseFloat(r.total_pnl) || 0,
    bets: parseInt(r.bets) || 0,
    roi: parseFloat(r.roi) || 0,
    current_price: parseFloat(r.current_price) || 0,
  };
}
