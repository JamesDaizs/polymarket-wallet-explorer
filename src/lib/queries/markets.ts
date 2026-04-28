import { SurfClient } from "../surfClient";
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
  const { data: markets } = await client.getMarkets({ limit, offset });

  // Parallel fetch latest prices per market
  const priceResults = await Promise.all(
    markets.map((m) =>
      client
        .getPrices({ condition_id: m.condition_id, interval: "latest" })
        .catch(() => ({ data: [] as Array<{ outcome_label: string; price: number }> }))
    )
  );

  const out: Market[] = markets.map((m, i) => {
    const prices = priceResults[i].data;
    const yes = prices.find((p) => p.outcome_label === "Yes")?.price ?? 0;
    const no = prices.find((p) => p.outcome_label === "No")?.price ?? 0;
    return {
      condition_id: m.condition_id,
      question: m.title ?? "",
      category: m.category ?? "",
      image: m.image ?? "",
      icon: m.image ?? "",
      event_slug: m.event_slug ?? "",
      market_slug: m.market_slug,
      market_end_date: m.end_time ? String(m.end_time) : "",
      volume_total: m.volume_total ?? 0,
      volume_1wk: m.volume_1_week ?? 0,
      polymarket_link: m.polymarket_link ?? (m.market_slug
        ? `https://polymarket.com/event/${m.market_slug}`
        : ""),
      tags: JSON.stringify(m.tags ?? []),
      yes_price: yes,
      no_price: no,
      last_trade_time: "",
    };
  });

  if (category && category !== "All") {
    return out.filter(
      (m) =>
        m.category.toLowerCase() === category.toLowerCase() ||
        m.tags.toLowerCase().includes(category.toLowerCase())
    );
  }
  return out;
}
