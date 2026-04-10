import { NextRequest, NextResponse } from "next/server";

// Dynamic import based on environment
const USE_SURF_API = process.env.SURF_API_KEY && process.env.USE_SURF_API === "true";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "60"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    let markets;

    if (USE_SURF_API) {
      // Use Surf CLI API
      const { getActiveMarkets } = await import("@/lib/queries/markets-surf");
      markets = await getActiveMarkets(category, limit, offset);
    } else {
      // Use legacy ClickHouse
      const { getActiveMarkets } = await import("@/lib/queries/markets");
      markets = await getActiveMarkets(category, limit, offset);
    }

    // Add metadata about data source
    return NextResponse.json({
      data: markets,
      meta: {
        source: USE_SURF_API ? "surf-cli" : "clickhouse",
        count: markets.length,
        limit,
        offset,
        category: category || "all"
      }
    });
  } catch (error) {
    console.error("Markets API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch markets", source: USE_SURF_API ? "surf-cli" : "clickhouse" },
      { status: 500 }
    );
  }
}