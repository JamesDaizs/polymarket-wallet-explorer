/**
 * Surf CLI integration for polymarket-wallets
 * Replaces ClickHouse queries with Surf CLI commands
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface SurfResponse<T> {
  data: T[];
  meta: {
    cached: boolean;
    credits_used: number;
    limit: number;
    offset: number;
    total?: number;
  };
}

/**
 * Execute a surf CLI command and return parsed JSON response
 */
async function runSurfCommand<T>(command: string[]): Promise<SurfResponse<T> | null> {
  try {
    const { stdout, stderr } = await execAsync(`surf ${command.join(" ")}`);

    if (stderr) {
      console.warn(`Surf CLI warning: ${stderr}`);
    }

    return JSON.parse(stdout);
  } catch (error) {
    console.error(`Surf CLI error:`, error);
    return null;
  }
}

/**
 * Get active prediction markets using surf CLI
 */
export async function getActiveMarketsViaSurf(
  category?: string,
  limit = 100,
  offset = 0
): Promise<any[]> {
  try {
    // Use search-prediction-market command
    const response = await runSurfCommand<any>([
      "search-prediction-market",
      "--limit", limit.toString()
    ]);

    if (!response || !response.data) {
      return [];
    }

    let markets = response.data;

    // Filter by category if specified
    if (category && category !== "All") {
      markets = markets.filter((market: any) =>
        market.category?.toLowerCase().includes(category.toLowerCase()) ||
        market.subcategory?.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Apply pagination manually since surf CLI doesn't support offset on search
    const startIndex = offset;
    const endIndex = startIndex + limit;

    return markets.slice(startIndex, endIndex);
  } catch (error) {
    console.error("Error fetching markets via Surf:", error);
    return [];
  }
}

/**
 * Get market categories from surf data
 */
export async function getCategoriesViaSurf(): Promise<string[]> {
  try {
    const response = await runSurfCommand<any>([
      "search-prediction-market",
      "--limit", "100"
    ]);

    if (!response || !response.data) {
      return ["All"];
    }

    const categories = new Set<string>();
    response.data.forEach((market: any) => {
      if (market.category) {
        categories.add(market.category);
      }
      if (market.subcategory) {
        categories.add(market.subcategory);
      }
    });

    return ["All", ...Array.from(categories).sort()];
  } catch (error) {
    console.error("Error fetching categories via Surf:", error);
    return ["All"];
  }
}

/**
 * Get polymarket markets by market slug
 */
export async function getPolymarketMarket(marketSlug: string): Promise<any | null> {
  try {
    const response = await runSurfCommand<any>([
      "polymarket-markets",
      "--market-slug", marketSlug,
      "--limit", "1"
    ]);

    return response?.data?.[0] || null;
  } catch (error) {
    console.error(`Error fetching market ${marketSlug} via Surf:`, error);
    return null;
  }
}

/**
 * Get market prices for a condition ID
 */
export async function getMarketPrices(conditionId: string, limit = 100): Promise<any[]> {
  try {
    const response = await runSurfCommand<any>([
      "polymarket-prices",
      "--condition-id", conditionId,
      "--limit", limit.toString()
    ]);

    return response?.data || [];
  } catch (error) {
    console.error(`Error fetching prices for ${conditionId} via Surf:`, error);
    return [];
  }
}

/**
 * Get market trades for a condition ID
 */
export async function getMarketTrades(conditionId: string, limit = 100): Promise<any[]> {
  try {
    const response = await runSurfCommand<any>([
      "polymarket-trades",
      "--condition-id", conditionId,
      "--limit", limit.toString()
    ]);

    return response?.data || [];
  } catch (error) {
    console.error(`Error fetching trades for ${conditionId} via Surf:`, error);
    return [];
  }
}

/**
 * Get wallet positions on Polymarket
 */
export async function getWalletPositions(walletAddress: string): Promise<any[]> {
  try {
    const response = await runSurfCommand<any>([
      "polymarket-positions",
      "--wallet-address", walletAddress
    ]);

    return response?.data || [];
  } catch (error) {
    console.error(`Error fetching positions for ${walletAddress} via Surf:`, error);
    return [];
  }
}

/**
 * Search markets by text query
 */
export async function searchMarketsViaSurf(query: string, limit = 20): Promise<any[]> {
  try {
    const response = await runSurfCommand<any>([
      "search-prediction-market",
      "--limit", limit.toString()
    ]);

    if (!response || !response.data) {
      return [];
    }

    // Filter by query text (since search-prediction-market doesn't support text search)
    const queryLower = query.toLowerCase();
    return response.data.filter((market: any) =>
      market.question?.toLowerCase().includes(queryLower) ||
      market.category?.toLowerCase().includes(queryLower) ||
      market.subcategory?.toLowerCase().includes(queryLower)
    ).slice(0, limit);
  } catch (error) {
    console.error(`Error searching markets for "${query}" via Surf:`, error);
    return [];
  }
}

/**
 * Get prediction market analytics
 */
export async function getMarketAnalytics(): Promise<any> {
  try {
    const response = await runSurfCommand<any>([
      "prediction-market-analytics"
    ]);

    return response?.data || null;
  } catch (error) {
    console.error("Error fetching market analytics via Surf:", error);
    return null;
  }
}

/**
 * Get cross-platform market matches
 */
export async function getCrossPlatformMatches(limit = 50): Promise<any[]> {
  try {
    const response = await runSurfCommand<any>([
      "matching-market-pairs",
      "--limit", limit.toString()
    ]);

    return response?.data || [];
  } catch (error) {
    console.error("Error fetching cross-platform matches via Surf:", error);
    return [];
  }
}

/**
 * Transform surf market data to match the existing Market interface
 */
export function transformSurfMarketData(surfMarket: any): any {
  return {
    condition_id: surfMarket.condition_id || "",
    question: surfMarket.question || "",
    category: surfMarket.category || "",
    image: surfMarket.image || "",
    icon: surfMarket.icon || "",
    event_slug: extractEventSlugFromLink(surfMarket.market_link),
    market_slug: extractMarketSlugFromLink(surfMarket.market_link),
    market_end_date: "", // Not available in surf data
    volume_total: surfMarket.volume_30d || 0,
    volume_1wk: surfMarket.volume_7d || 0,
    polymarket_link: surfMarket.market_link || "",
    tags: JSON.stringify([surfMarket.subcategory || ""]),
    yes_price: surfMarket.latest_price || 0.5,
    no_price: 1 - (surfMarket.latest_price || 0.5),
    last_trade_time: new Date().toISOString(), // Approximate
  };
}

/**
 * Extract event slug from polymarket link
 */
function extractEventSlugFromLink(link: string): string {
  if (!link) return "";

  const match = link.match(/\/event\/([^/?]+)/);
  return match ? match[1] : "";
}

/**
 * Extract market slug from polymarket link
 */
function extractMarketSlugFromLink(link: string): string {
  if (!link) return "";

  // For market slug, we'll use the last part of the URL
  const match = link.match(/\/([^/?]+)\/?$/);
  return match ? match[1] : "";
}