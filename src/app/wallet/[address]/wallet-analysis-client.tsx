"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import { WalletStatsGrid } from "@/components/wallet-stats-grid";
import { AIChat } from "@/components/ai-chat";
import { formatCurrency, formatAddress } from "@/lib/format";
import type { WalletProfile, WalletTrade } from "@/lib/types";

interface Props {
  profile: WalletProfile;
  trades: WalletTrade[];
}

export function WalletAnalysisClient({ profile, trades }: Props) {
  const [copied, setCopied] = useState(false);

  function copyAddress() {
    navigator.clipboard.writeText(profile.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/wallet"
              className="text-fg-faint transition-colors hover:text-fg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-bold">
              {formatAddress(profile.address)}
            </h1>
            <button
              onClick={copyAddress}
              className="text-fg-faint transition-colors hover:text-fg-muted"
              title="Copy address"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-positive" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-fg-faint">
            <span>{profile.positions_count} markets</span>
            <span>Last active {profile.last_trade_date}</span>
          </div>
        </div>
        <a
          href={`https://polymarket.com/portfolio/${profile.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-md border border-border-base px-2.5 py-1.5 text-xs text-fg-muted transition-colors hover:border-border-subtle hover:text-fg-subtle"
        >
          Polymarket
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Stats Grid */}
      <WalletStatsGrid profile={profile} />

      {/* Recent Trades Table */}
      {trades.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border-base bg-bg-card">
          <div className="border-b border-border-subtle px-5 py-3.5">
            <h3 className="text-sm font-medium text-fg-subtle">
              Recent Trades ({trades.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left text-xs text-fg-faint">
                  <th className="px-4 py-2.5 font-medium">Time</th>
                  <th className="px-4 py-2.5 font-medium">Market</th>
                  <th className="px-4 py-2.5 font-medium">Side</th>
                  <th className="px-4 py-2.5 font-medium text-right">Price</th>
                  <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Category</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-subtle/50 transition-colors hover:bg-bg-card-hover"
                  >
                    <td className="whitespace-nowrap px-4 py-2 text-xs text-fg-faint">
                      {t.block_time}
                    </td>
                    <td className="max-w-[280px] truncate px-4 py-2 text-fg-subtle">
                      {t.question}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                          t.outcome_label?.toLowerCase() === "yes"
                            ? "bg-positive/10 text-positive"
                            : "bg-negative/10 text-negative"
                        }`}
                      >
                        {t.outcome_label || "\u2014"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums text-fg-subtle">
                      {t.price.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums text-fg-subtle">
                      {formatCurrency(t.amount_usd)}
                    </td>
                    <td className="px-4 py-2 text-xs text-fg-faint">
                      {t.category || "\u2014"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Chat */}
      <AIChat profile={profile} trades={trades} />
    </div>
  );
}
