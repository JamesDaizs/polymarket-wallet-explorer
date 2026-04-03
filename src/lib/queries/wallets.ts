import { queryClickHouse } from "../clickhouse";
import type { Wallet, WalletFilters, WalletSummary } from "../types";

interface WalletRow {
  address: string;
  win_rate: string;
  total_pnl: string;
  roi: string;
  total_usd_volume: string;
  avg_trade: string;
  total_trades: string;
  last_active: string;
  markets_traded: string;
}

interface SummaryRow {
  total_wallets: string;
  profitable_wallets: string;
  avg_win_rate: string;
  high_wr_wallets: string;
  total_volume: string;
  total_trades: string;
  top_pnl: string;
  avg_roi: string;
}

function buildWhereClause(f: WalletFilters): string {
  const conditions: string[] = [];

  if (f.volumeMin !== undefined) conditions.push(`total_usd_volume >= ${f.volumeMin}`);
  if (f.volumeMax !== undefined) conditions.push(`total_usd_volume <= ${f.volumeMax}`);
  if (f.pnlMin !== undefined) conditions.push(`total_pnl >= ${f.pnlMin}`);
  if (f.pnlMax !== undefined) conditions.push(`total_pnl <= ${f.pnlMax}`);
  if (f.roiMin !== undefined) conditions.push(`roi >= ${f.roiMin / 100}`);
  if (f.roiMax !== undefined) conditions.push(`roi <= ${f.roiMax / 100}`);
  if (f.winRateMin !== undefined) conditions.push(`win_rate >= ${f.winRateMin / 100}`);
  if (f.winRateMax !== undefined) conditions.push(`win_rate <= ${f.winRateMax / 100}`);
  if (f.tradesMin !== undefined) conditions.push(`total_trades >= ${f.tradesMin}`);
  if (f.tradesMax !== undefined) conditions.push(`total_trades <= ${f.tradesMax}`);
  if (f.marketsMin !== undefined) conditions.push(`markets_traded >= ${f.marketsMin}`);
  if (f.marketsMax !== undefined) conditions.push(`markets_traded <= ${f.marketsMax}`);

  return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
}

const VALID_SORT_COLS = new Set([
  "total_pnl", "win_rate", "roi", "total_usd_volume",
  "total_trades", "markets_traded", "avg_trade", "last_active",
]);

export async function getWallets(filters: WalletFilters): Promise<{
  wallets: Wallet[];
  summary: WalletSummary;
}> {
  const sortCol = VALID_SORT_COLS.has(filters.sortBy) ? filters.sortBy : "total_pnl";
  const sortDir = filters.sortDir === "asc" ? "ASC" : "DESC";
  const offset = (filters.page - 1) * filters.pageSize;

  if (filters.timeWindow === "all") {
    // wallet_profiles columns: address, total_pnl, total_usd_volume, total_trades,
    // positions_count, win_rate, avg_trade_size_usd, last_trade_date
    const whereClause = buildWhereClause(filters);

    const dataSql = `
      SELECT
        address,
        coalesce(win_rate, 0) AS win_rate,
        total_pnl,
        if(total_usd_volume > 0, total_pnl / total_usd_volume, 0) AS roi,
        total_usd_volume,
        coalesce(avg_trade_size_usd, 0) AS avg_trade,
        total_trades,
        toString(last_trade_date) AS last_active,
        positions_count AS markets_traded
      FROM polymarket_polygon.wallet_profiles
      ${whereClause}
      ORDER BY ${sortCol} ${sortDir}
      LIMIT ${filters.pageSize} OFFSET ${offset}
    `;

    const summarySql = `
      SELECT
        count() AS total_wallets,
        countIf(total_pnl > 0) AS profitable_wallets,
        avg(coalesce(win_rate, 0)) AS avg_win_rate,
        countIf(coalesce(win_rate, 0) >= 0.6) AS high_wr_wallets,
        sum(total_usd_volume) AS total_volume,
        sum(total_trades) AS total_trades,
        max(total_pnl) AS top_pnl,
        avg(if(total_usd_volume > 0, total_pnl / total_usd_volume, 0)) AS avg_roi
      FROM polymarket_polygon.wallet_profiles
      ${whereClause}
    `;

    const [walletRows, summaryRows] = await Promise.all([
      queryClickHouse<WalletRow>(dataSql),
      queryClickHouse<SummaryRow>(summarySql),
    ]);

    return {
      wallets: walletRows.map(parseWalletRow),
      summary: parseSummaryRow(summaryRows[0]),
    };
  }

  // Time-windowed query using user_daily_agg
  // user_daily_agg columns: account, token_id, block_date, volume, trades
  const days = filters.timeWindow === "7d" ? 7 : filters.timeWindow === "14d" ? 14 : 30;
  const whereClause = buildWhereClause(filters);

  const dataSql = `
    WITH windowed AS (
      SELECT
        account AS address,
        sum(volume) AS total_usd_volume,
        sum(trades) AS total_trades
      FROM polymarket_polygon.user_daily_agg
      WHERE block_date >= today() - ${days}
      GROUP BY account
      HAVING total_usd_volume > 0
    )
    SELECT
      w.address,
      coalesce(wp.win_rate, 0) AS win_rate,
      wp.total_pnl,
      if(w.total_usd_volume > 0, wp.total_pnl / w.total_usd_volume, 0) AS roi,
      w.total_usd_volume,
      if(w.total_trades > 0, w.total_usd_volume / w.total_trades, 0) AS avg_trade,
      w.total_trades,
      toString(wp.last_trade_date) AS last_active,
      wp.positions_count AS markets_traded
    FROM windowed w
    JOIN polymarket_polygon.wallet_profiles wp ON w.address = wp.address
    ${whereClause}
    ORDER BY ${sortCol} ${sortDir}
    LIMIT ${filters.pageSize} OFFSET ${offset}
  `;

  const summarySql = `
    WITH windowed AS (
      SELECT
        account AS address,
        sum(volume) AS total_usd_volume,
        sum(trades) AS total_trades
      FROM polymarket_polygon.user_daily_agg
      WHERE block_date >= today() - ${days}
      GROUP BY account
      HAVING total_usd_volume > 0
    )
    SELECT
      count() AS total_wallets,
      countIf(wp.total_pnl > 0) AS profitable_wallets,
      avg(coalesce(wp.win_rate, 0)) AS avg_win_rate,
      countIf(coalesce(wp.win_rate, 0) >= 0.6) AS high_wr_wallets,
      sum(w.total_usd_volume) AS total_volume,
      sum(w.total_trades) AS total_trades,
      max(wp.total_pnl) AS top_pnl,
      avg(if(w.total_usd_volume > 0, wp.total_pnl / w.total_usd_volume, 0)) AS avg_roi
    FROM windowed w
    JOIN polymarket_polygon.wallet_profiles wp ON w.address = wp.address
    ${whereClause}
  `;

  const [walletRows, summaryRows] = await Promise.all([
    queryClickHouse<WalletRow>(dataSql),
    queryClickHouse<SummaryRow>(summarySql),
  ]);

  return {
    wallets: walletRows.map(parseWalletRow),
    summary: parseSummaryRow(summaryRows[0]),
  };
}

function parseWalletRow(r: WalletRow): Wallet {
  return {
    address: r.address,
    win_rate: parseFloat(r.win_rate) || 0,
    total_pnl: parseFloat(r.total_pnl) || 0,
    roi: parseFloat(r.roi) || 0,
    total_usd_volume: parseFloat(r.total_usd_volume) || 0,
    avg_trade: parseFloat(r.avg_trade) || 0,
    total_trades: parseInt(r.total_trades) || 0,
    last_active: r.last_active,
    markets_traded: parseInt(r.markets_traded) || 0,
  };
}

function parseSummaryRow(r?: SummaryRow): WalletSummary {
  if (!r) {
    return {
      total_wallets: 0, profitable_wallets: 0, avg_win_rate: 0,
      high_wr_wallets: 0, total_volume: 0, total_trades: 0,
      top_pnl: 0, avg_roi: 0,
    };
  }
  return {
    total_wallets: parseInt(r.total_wallets) || 0,
    profitable_wallets: parseInt(r.profitable_wallets) || 0,
    avg_win_rate: parseFloat(r.avg_win_rate) || 0,
    high_wr_wallets: parseInt(r.high_wr_wallets) || 0,
    total_volume: parseFloat(r.total_volume) || 0,
    total_trades: parseInt(r.total_trades) || 0,
    top_pnl: parseFloat(r.top_pnl) || 0,
    avg_roi: parseFloat(r.avg_roi) || 0,
  };
}
