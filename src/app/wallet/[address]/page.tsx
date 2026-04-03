export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getWalletProfile, getRecentTrades } from "@/lib/queries/wallet-analysis";
import { WalletAnalysisClient } from "./wallet-analysis-client";

interface Props {
  params: Promise<{ address: string }>;
}

export default async function WalletPage({ params }: Props) {
  const { address } = await params;

  if (!/^0x[a-f0-9]{40}$/i.test(address)) {
    notFound();
  }

  const [profile, trades] = await Promise.all([
    getWalletProfile(address),
    getRecentTrades(address, 20),
  ]);

  if (!profile) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center space-y-3 px-4">
        <p className="text-lg text-fg-muted">Wallet not found</p>
        <p className="text-sm text-fg-faint">
          No profile data for{" "}
          <code className="rounded bg-bg-card px-1.5 py-0.5 text-xs">
            {address}
          </code>
        </p>
        <a href="/wallet" className="mt-2 text-sm text-brand hover:underline">
          Try another address
        </a>
      </div>
    );
  }

  return <WalletAnalysisClient profile={profile} trades={trades} />;
}
