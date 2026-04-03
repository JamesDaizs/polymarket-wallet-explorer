"use client";

import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";
import { cn, formatCurrency, formatPercent, formatAddress, formatNumber, formatPnl } from "@/lib/format";
import type { Wallet } from "@/lib/types";

interface WalletTableProps {
  wallets: Wallet[];
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (col: string) => void;
  pageOffset: number;
}

const columns = [
  { key: "#", label: "#", sortable: false },
  { key: "address", label: "Wallet", sortable: false },
  { key: "win_rate", label: "Win Rate", sortable: true },
  { key: "total_pnl", label: "PnL (Closed)", sortable: true },
  { key: "roi", label: "ROI", sortable: true },
  { key: "total_usd_volume", label: "Buy Volume", sortable: true },
  { key: "avg_trade", label: "Avg Trade", sortable: true },
  { key: "total_trades", label: "Trades", sortable: true },
  { key: "last_active", label: "Last Active", sortable: true },
  { key: "markets_traded", label: "Markets", sortable: true },
];

export function WalletTable({ wallets, sortBy, sortDir, onSort, pageOffset }: WalletTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle bg-bg-card">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-fg-faint",
                  col.sortable && "cursor-pointer hover:text-fg-muted"
                )}
                onClick={() => col.sortable && onSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    sortDir === "desc"
                      ? <ArrowDown className="h-3 w-3" />
                      : <ArrowUp className="h-3 w-3" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {wallets.map((w, i) => (
            <tr
              key={w.address}
              className="border-b border-border-subtle transition-colors hover:bg-bg-card"
            >
              <td className="px-3 py-2.5 text-xs text-fg-faint">
                {pageOffset + i + 1}
              </td>
              <td className="px-3 py-2.5">
                <a
                  href={`https://polymarket.com/profile/${w.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-brand hover:underline"
                >
                  {formatAddress(w.address)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </td>
              <td className="px-3 py-2.5">
                <WinRateBar rate={w.win_rate} />
              </td>
              <td className={cn(
                "px-3 py-2.5 font-medium",
                w.total_pnl >= 0 ? "text-positive" : "text-negative"
              )}>
                {formatPnl(w.total_pnl)}
              </td>
              <td className={cn(
                "px-3 py-2.5",
                w.roi >= 0 ? "text-positive" : "text-negative"
              )}>
                {formatPercent(w.roi)}
              </td>
              <td className="px-3 py-2.5 text-fg-subtle">
                {formatCurrency(w.total_usd_volume)}
              </td>
              <td className="px-3 py-2.5 text-fg-subtle">
                {formatCurrency(w.avg_trade)}
              </td>
              <td className="px-3 py-2.5 text-fg-subtle">
                {formatNumber(w.total_trades)}
              </td>
              <td className="px-3 py-2.5 text-xs text-fg-muted">
                {w.last_active}
              </td>
              <td className="px-3 py-2.5 text-fg-subtle">
                {formatNumber(w.markets_traded)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {wallets.length === 0 && (
        <div className="py-12 text-center text-fg-muted">
          No wallets match the current filters
        </div>
      )}
    </div>
  );
}

function WinRateBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-bg-elevated">
        <div
          className={cn(
            "h-full rounded-full",
            pct >= 60 ? "bg-positive" : pct >= 45 ? "bg-warning" : "bg-negative"
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium">{pct}%</span>
    </div>
  );
}
