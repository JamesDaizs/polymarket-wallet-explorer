/**
 * Markets API using Surf CLI instead of ClickHouse
 * Drop-in replacement for markets.ts
 */

import {
  getActiveMarketsViaSurf,
  getCategoriesViaSurf,
  transformSurfMarketData,
} from "../surf-api";
import type { Market } from "../types";

export async function getActiveMarkets(
  category?: string,
  limit = 100,
  offset = 0
): Promise<Market[]> {
  try {
    const surfMarkets = await getActiveMarketsViaSurf(category, limit, offset);
    return surfMarkets.map(transformSurfMarketData);
  } catch (error) {
    console.error("Error fetching markets via Surf:", error);
    return [];
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    return await getCategoriesViaSurf();
  } catch (error) {
    console.error("Error fetching categories via Surf:", error);
    return ["All"];
  }
}