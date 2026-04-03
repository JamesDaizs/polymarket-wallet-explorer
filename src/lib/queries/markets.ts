import { queryClickHouse } from "../clickhouse";
import type { Market } from "../types";

interface MarketRow {
  condition_id: string;
  question: string;
  category: string;
  image: string;
  icon: string;
  event_slug: string;
  market_slug: string;
  market_end_date: string;
  volume_total: string;
  volume_1wk: string;
  polymarket_link: string;
  tags: string;
  yes_price: string;
  no_price: string;
  last_trade_time: string;
}

export async function getActiveMarkets(
  category?: string,
  limit = 100,
  offset = 0
): Promise<Market[]> {
  const categoryFilter = category && category !== "All"
    ? `AND (md.tags ILIKE '%${category}%' OR md.category ILIKE '%${category}%')`
    : "";

  const sql = `
    SELECT
      md.condition_id,
      md.question,
      coalesce(md.category, '') AS category,
      coalesce(md.image, '') AS image,
      coalesce(md.icon, '') AS icon,
      coalesce(md.event_slug, '') AS event_slug,
      coalesce(md.market_slug, '') AS market_slug,
      coalesce(toString(md.market_end_date), '') AS market_end_date,
      coalesce(md.volume_total, 0) AS volume_total,
      coalesce(md.volume_1wk, 0) AS volume_1wk,
      coalesce(md.polymarket_link, '') AS polymarket_link,
      coalesce(md.tags, '[]') AS tags,
      maxIf(p.last_price, p.outcome_label = 'Yes') AS yes_price,
      maxIf(p.last_price, p.outcome_label = 'No') AS no_price,
      max(p.last_trade_time) AS last_trade_time
    FROM polymarket_polygon.market_details md
    JOIN polymarket_realtime.prices_latest_store p
      ON md.condition_id = p.condition_id
    WHERE md.active = 1 AND md.closed = 0
      ${categoryFilter}
    GROUP BY md.condition_id, md.question, md.category, md.image, md.icon,
      md.event_slug, md.market_slug, md.market_end_date, md.volume_total,
      md.volume_1wk, md.polymarket_link, md.tags
    ORDER BY md.volume_1wk DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const rows = await queryClickHouse<MarketRow>(sql);
  return rows.map(parseMarketRow);
}

export async function getCategories(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT category
    FROM polymarket_polygon.market_details
    WHERE active = 1 AND closed = 0 AND category != ''
    ORDER BY category
  `;
  const rows = await queryClickHouse<{ category: string }>(sql);
  return ["All", ...rows.map((r) => r.category)];
}

function parseMarketRow(r: MarketRow): Market {
  return {
    condition_id: r.condition_id,
    question: r.question,
    category: r.category,
    image: r.image,
    icon: r.icon,
    event_slug: r.event_slug,
    market_slug: r.market_slug,
    market_end_date: r.market_end_date,
    volume_total: parseFloat(String(r.volume_total)) || 0,
    volume_1wk: parseFloat(String(r.volume_1wk)) || 0,
    polymarket_link: r.polymarket_link,
    tags: r.tags,
    yes_price: parseFloat(String(r.yes_price)) || 0,
    no_price: parseFloat(String(r.no_price)) || 0,
    last_trade_time: r.last_trade_time,
  };
}
