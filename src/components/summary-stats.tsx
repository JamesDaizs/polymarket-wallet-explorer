import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { WalletSummary } from "@/lib/types";

export function SummaryStats({ summary }: { summary: WalletSummary }) {
  const stats = [
    { label: "Total Wallets", value: formatNumber(summary.total_wallets) },
    { label: "Profitable", value: formatNumber(summary.profitable_wallets) },
    { label: "Avg Win Rate", value: formatPercent(summary.avg_win_rate) },
    { label: ">=70% WR", value: formatNumber(summary.high_wr_wallets) },
    { label: "Total Volume", value: formatCurrency(summary.total_volume) },
    { label: "Total Trades", value: formatNumber(summary.total_trades) },
    { label: "Top PnL", value: formatCurrency(summary.top_pnl) },
    { label: "Avg ROI", value: formatPercent(summary.avg_roi) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-lg border border-border-subtle bg-bg-card p-3 text-center"
        >
          <div className="text-[10px] uppercase tracking-wide text-fg-faint">
            {s.label}
          </div>
          <div className="mt-1 text-sm font-semibold">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
