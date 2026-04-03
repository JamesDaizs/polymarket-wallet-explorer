import { NextRequest, NextResponse } from "next/server";
import { getActiveMarkets } from "@/lib/queries/markets";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "60"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  const markets = await getActiveMarkets(category, limit, offset);
  return NextResponse.json(markets);
}
