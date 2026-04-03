import { NextRequest, NextResponse } from "next/server";
import { getSignals } from "@/lib/queries/signals";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const days = Math.min(parseInt(searchParams.get("days") || "7"), 30);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  const signals = await getSignals(days, limit, offset);
  return NextResponse.json(signals);
}
