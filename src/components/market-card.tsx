import { ExternalLink } from "lucide-react";
import { formatCurrency, formatTimeAgo } from "@/lib/format";
import type { Market } from "@/lib/types";

export function MarketCard({ market }: { market: Market }) {
  const yesPercent = Math.round(market.yes_price * 100);
  const noPercent = Math.round(market.no_price * 100);
  const daysUntilEnd = market.market_end_date
    ? Math.max(0, Math.ceil((new Date(market.market_end_date).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="group flex flex-col rounded-xl border border-border-subtle bg-bg-card p-4 transition-colors hover:border-border-base hover:bg-bg-card-hover">
      <div className="mb-3 flex items-start gap-3">
        {market.image ? (
          <img
            src={market.image}
            alt=""
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-elevated text-fg-muted text-xs">
            PM
          </div>
        )}
        <h3 className="flex-1 text-sm font-medium leading-snug line-clamp-2">
          {market.question}
        </h3>
      </div>

      <div className="mb-3 flex gap-2">
        <div className="flex-1 rounded-lg bg-positive/10 px-3 py-2 text-center">
          <div className="text-xs text-fg-muted">Yes</div>
          <div className="text-lg font-bold text-positive">{yesPercent}%</div>
        </div>
        <div className="flex-1 rounded-lg bg-negative/10 px-3 py-2 text-center">
          <div className="text-xs text-fg-muted">No</div>
          <div className="text-lg font-bold text-negative">{noPercent}%</div>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
        <span>Vol: {formatCurrency(market.volume_1wk)} (7d)</span>
        {daysUntilEnd !== null && <span>{daysUntilEnd}d left</span>}
        {market.last_trade_time && (
          <span>{formatTimeAgo(market.last_trade_time)}</span>
        )}
        {market.category && (
          <span className="rounded-full bg-bg-elevated px-2 py-0.5">
            {market.category}
          </span>
        )}
      </div>

      {market.polymarket_link && (
        <a
          href={market.polymarket_link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-border-subtle py-1.5 text-xs text-fg-muted transition-colors hover:border-brand hover:text-brand"
        >
          Trade on Polymarket <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
