"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SummaryStats } from "@/components/summary-stats";
import { WalletTable } from "@/components/wallet-table";
import { Pagination } from "@/components/pagination";
import type { Wallet, WalletFilters, WalletSummary } from "@/lib/types";

const DEFAULT_FILTERS: WalletFilters = {
  timeWindow: "all",
  sortBy: "total_pnl",
  sortDir: "desc",
  page: 1,
  pageSize: 25,
};

interface Props {
  initialWallets: Wallet[];
  initialSummary: WalletSummary;
}

export function WalletFilterClient({ initialWallets, initialSummary }: Props) {
  const [wallets, setWallets] = useState(initialWallets);
  const [summary, setSummary] = useState(initialSummary);
  const [filters, setFilters] = useState<WalletFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);

  const fetchWallets = useCallback(async (f: WalletFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("timeWindow", f.timeWindow);
      params.set("sortBy", f.sortBy);
      params.set("sortDir", f.sortDir);
      params.set("page", String(f.page));
      params.set("pageSize", String(f.pageSize));
      if (f.volumeMin !== undefined) params.set("volumeMin", String(f.volumeMin));
      if (f.volumeMax !== undefined) params.set("volumeMax", String(f.volumeMax));
      if (f.pnlMin !== undefined) params.set("pnlMin", String(f.pnlMin));
      if (f.pnlMax !== undefined) params.set("pnlMax", String(f.pnlMax));
      if (f.roiMin !== undefined) params.set("roiMin", String(f.roiMin));
      if (f.roiMax !== undefined) params.set("roiMax", String(f.roiMax));
      if (f.winRateMin !== undefined) params.set("winRateMin", String(f.winRateMin));
      if (f.winRateMax !== undefined) params.set("winRateMax", String(f.winRateMax));
      if (f.tradesMin !== undefined) params.set("tradesMin", String(f.tradesMin));
      if (f.tradesMax !== undefined) params.set("tradesMax", String(f.tradesMax));
      if (f.marketsMin !== undefined) params.set("marketsMin", String(f.marketsMin));
      if (f.marketsMax !== undefined) params.set("marketsMax", String(f.marketsMax));

      const res = await fetch(`/api/wallets?${params}`);
      const data = await res.json();
      setWallets(data.wallets);
      setSummary(data.summary);
    } catch (err) {
      console.error("Failed to fetch wallets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApply = useCallback((f: WalletFilters) => {
    const updated = { ...f, page: 1 };
    setFilters(updated);
    fetchWallets(updated);
  }, [fetchWallets]);

  const handleClear = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    fetchWallets(DEFAULT_FILTERS);
  }, [fetchWallets]);

  const handleSort = useCallback((col: string) => {
    setFilters((prev) => {
      const updated = {
        ...prev,
        sortBy: col,
        sortDir: prev.sortBy === col && prev.sortDir === "desc" ? "asc" as const : "desc" as const,
        page: 1,
      };
      fetchWallets(updated);
      return updated;
    });
  }, [fetchWallets]);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => {
      const updated = { ...prev, page };
      fetchWallets(updated);
      return updated;
    });
  }, [fetchWallets]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold">Wallet Filter</h1>
        <p className="text-sm text-fg-muted">
          Filter and sort 2.5M+ wallets by PnL, volume, win rate, ROI, and more
        </p>
      </div>

      <div className="mb-6">
        <SummaryStats summary={summary} />
      </div>

      <div className="flex gap-6">
        <aside className="w-64 shrink-0">
          <div className="sticky top-20 rounded-xl border border-border-subtle bg-bg-card p-4">
            <h2 className="mb-4 text-sm font-semibold">Filters</h2>
            <FilterSidebar
              filters={filters}
              onApply={handleApply}
              onClear={handleClear}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {loading && (
            <div className="mb-4 flex items-center gap-2 text-sm text-fg-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          )}

          <WalletTable
            wallets={wallets}
            sortBy={filters.sortBy}
            sortDir={filters.sortDir}
            onSort={handleSort}
            pageOffset={(filters.page - 1) * filters.pageSize}
          />

          <Pagination
            page={filters.page}
            hasMore={wallets.length >= filters.pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
