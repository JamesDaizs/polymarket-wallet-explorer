import { ArrowUpRight, ExternalLink, TrendingUp } from "lucide-react";
import { cn, formatCurrency, formatPercent, formatTimeAgo, formatAddress, formatPnl } from "@/lib/format";
import { formatNumber } from "@/lib/format";
import type { Signal, SignalStrength } from "@/lib/types";
import { getSignalStrength } from "@/lib/types";

const strengthColors: Record<SignalStrength, string> = {
  HIGH: "bg-positive/15 text-positive border-positive/30",
  MED: "bg-warning/15 text-warning border-warning/30",
  LOW: "bg-fg-muted/15 text-fg-muted border-fg-muted/30",
};

export function SignalCard({ signal }: { signal: Signal }) {
  const strength = getSignalStrength(signal.win_rate, signal.total_pnl);
  const entryPrice = signal.price;
  const currentPrice = signal.current_price;
  const gainLoss = currentPrice && entryPrice ? ((currentPrice - entryPrice) / entryPrice) : 0;
  const polymarketLink = signal.event_slug
    ? `https://polymarket.com/event/${signal.event_slug}`
    : `https://polymarket.com`;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-card p-4 transition-colors hover:border-border-base">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium leading-snug line-clamp-2">
            {signal.question}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-fg-muted">
            <span>{formatTimeAgo(signal.block_time)}</span>
            <span className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
              strengthColors[strength]
            )}>
              {strength}
            </span>
            <span className="rounded-full bg-bg-elevated px-2 py-0.5">
              {signal.whale_tier}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={cn(
            "text-sm font-bold",
            signal.outcome_label === "Yes" ? "text-positive" : "text-negative"
          )}>
            {signal.outcome_label} @ {Math.round(entryPrice * 100)}%
          </span>
          {currentPrice > 0 && (
            <span className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              gainLoss >= 0 ? "text-positive" : "text-negative"
            )}>
              <ArrowUpRight className={cn("h-3 w-3", gainLoss < 0 && "rotate-90")} />
              {formatPercent(Math.abs(gainLoss))}
            </span>
          )}
        </div>
      </div>

      <div className="mb-3 rounded-lg bg-background/50 p-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-xs text-brand">
            {formatAddress(signal.wallet_address)}
          </span>
          <span className="text-xs text-fg-muted">
            bought {formatCurrency(signal.amount_usd, false)} worth
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-fg-faint">Win Rate</span>
            <div className="font-medium">{formatPercent(signal.win_rate)}</div>
          </div>
          <div>
            <span className="text-fg-faint">ROI</span>
            <div className="font-medium">{formatPercent(signal.roi / 100)}</div>
          </div>
          <div>
            <span className="text-fg-faint">Bets</span>
            <div className="font-medium">{formatNumber(signal.bets)}</div>
          </div>
          <div>
            <span className="text-fg-faint">PnL</span>
            <div className={cn("font-medium", signal.total_pnl >= 0 ? "text-positive" : "text-negative")}>
              {formatPnl(signal.total_pnl)}
            </div>
          </div>
        </div>
      </div>

      <a
        href={polymarketLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 rounded-lg border border-border-subtle py-1.5 text-xs text-fg-muted transition-colors hover:border-brand hover:text-brand"
      >
        <TrendingUp className="h-3 w-3" />
        Trade on Polymarket <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
