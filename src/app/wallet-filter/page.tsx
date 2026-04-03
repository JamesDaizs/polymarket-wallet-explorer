import { getWallets } from "@/lib/queries/wallets";
import { WalletFilterClient } from "./wallet-filter-client";

export const dynamic = "force-static";
export const revalidate = 300;

export default async function WalletFilterPage() {
  const { wallets, summary } = await getWallets({
    timeWindow: "all",
    sortBy: "total_pnl",
    sortDir: "desc",
    page: 1,
    pageSize: 25,
  });

  return (
    <WalletFilterClient initialWallets={wallets} initialSummary={summary} />
  );
}
