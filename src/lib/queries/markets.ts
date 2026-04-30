import { SurfClient } from "@/lib/surfClient";
import type { Market } from "../types";

const client = new SurfClient();

const KNOWN_CATEGORIES = [
  "All",
  "Politics",
  "Sports",
  "Crypto",
  "Economy",
  "Pop Culture",
  "Science",
  "Tech",
  "Climate",
];

export async function getCategories(): Promise<string[]> {
  return KNOWN_CATEGORIES;
}

export async function getActiveMarkets(
  category?: string,
  limit = 100,
  offset = 0
): Promise<Market[]> {
  const cappedLimit = Math.min(limit, 100);
  const params: {
    platform: "polymarket";
    status: "open";
    limit: number;
    offset: number;
    category?: string;
  } = {
    platform: "polymarket",
    status: "open",
    limit: cappedLimit,
    offset,
  };
  if (category && category !== "All") {
    params.category = category;
  }

  const { data } = await client.searchPredictionMarket(params);

  return data.map((m): Market => {
    const yes = m.latest_price ?? 0;
    return {
      condition_id: m.condition_id ?? "",
      question: m.question ?? "",
      category: m.category ?? "",
      image: "",
      icon: "",
      event_slug: "",
      market_slug: "",
      market_end_date:
        m.days_to_resolution !== undefined ? `${m.days_to_resolution}d` : "",
      volume_total: m.volume_30d ?? 0,
      volume_1wk: m.volume_7d ?? 0,
      polymarket_link: m.market_link ?? "",
      tags: "[]",
      yes_price: yes,
      no_price: yes > 0 ? 1 - yes : 0,
      last_trade_time: "",
    };
  });
}
