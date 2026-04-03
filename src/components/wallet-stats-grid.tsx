import {
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  Layers,
  ShoppingCart,
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercent, formatPnl } from "@/lib/format";
import type { WalletProfile } from "@/lib/types";

interface Props {
  profile: WalletProfile;
}

export function WalletStatsGrid({ profile }: Props) {
  const stats = [
    {
      label: "Total PnL",
      value: formatPnl(profile.total_pnl),
      color: profile.total_pnl >= 0 ? "text-positive" : "text-negative",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      label: "Win Rate",
      value: formatPercent(profile.win_rate),
      color: profile.win_rate >= 0.5 ? "text-positive" : "text-negative",
      icon: <Target className="h-4 w-4" />,
    },
    {
      label: "ROI",
      value: formatPercent(profile.roi),
      color: profile.roi >= 0 ? "text-positive" : "text-negative",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: "Volume",
      value: formatCurrency(profile.total_usd_volume),
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Trades",
      value: formatNumber(profile.total_trades),
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      label: "Markets",
      value: formatNumber(profile.positions_count),
      icon: <Layers className="h-4 w-4" />,
    },
    {
      label: "Avg Trade",
      value: formatCurrency(profile.avg_trade_size_usd),
      icon: <DollarSign className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="animate-fade-in rounded-xl border border-border-base bg-bg-card p-3.5 transition-colors hover:bg-bg-card-hover"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-fg-faint">{s.icon}</span>
            <span className="text-xs text-fg-muted">{s.label}</span>
          </div>
          <div
            className={`mt-1.5 text-lg font-semibold tabular-nums ${s.color || "text-foreground"}`}
          >
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
