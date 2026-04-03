import { NextRequest, NextResponse } from "next/server";
import { getWallets } from "@/lib/queries/wallets";
import type { WalletFilters } from "@/lib/types";

function getNum(params: URLSearchParams, key: string): number | undefined {
  const val = params.get(key);
  if (val === null || val === "") return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const filters: WalletFilters = {
    timeWindow: (sp.get("timeWindow") || "all") as WalletFilters["timeWindow"],
    sortBy: sp.get("sortBy") || "total_pnl",
    sortDir: (sp.get("sortDir") || "desc") as "asc" | "desc",
    page: Math.max(1, parseInt(sp.get("page") || "1")),
    pageSize: Math.min(100, Math.max(1, parseInt(sp.get("pageSize") || "25"))),
    volumeMin: getNum(sp, "volumeMin"),
    volumeMax: getNum(sp, "volumeMax"),
    pnlMin: getNum(sp, "pnlMin"),
    pnlMax: getNum(sp, "pnlMax"),
    roiMin: getNum(sp, "roiMin"),
    roiMax: getNum(sp, "roiMax"),
    winRateMin: getNum(sp, "winRateMin"),
    winRateMax: getNum(sp, "winRateMax"),
    tradesMin: getNum(sp, "tradesMin"),
    tradesMax: getNum(sp, "tradesMax"),
    marketsMin: getNum(sp, "marketsMin"),
    marketsMax: getNum(sp, "marketsMax"),
  };

  const result = await getWallets(filters);
  return NextResponse.json(result);
}
