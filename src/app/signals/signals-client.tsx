"use client";

import { useState, useCallback } from "react";
import { SignalCard } from "@/components/signal-card";
import { Loader2 } from "lucide-react";
import type { Signal } from "@/lib/types";

interface SignalsClientProps {
  initialSignals: Signal[];
}

export function SignalsClient({ initialSignals }: SignalsClientProps) {
  const [signals, setSignals] = useState(initialSignals);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(50);
  const [hasMore, setHasMore] = useState(initialSignals.length >= 50);

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: String(offset),
      });
      const res = await fetch(`/api/signals?${params}`);
      const data = await res.json();
      setSignals((prev) => [...prev, ...data]);
      setOffset((prev) => prev + 50);
      setHasMore(data.length >= 50);
    } catch (err) {
      console.error("Failed to load more signals:", err);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold">Smart Money Signals</h1>
        <p className="text-sm text-fg-muted">
          Recent trades by profitable wallets with signal strength indicators
        </p>
      </div>

      <div className="space-y-4">
        {signals.map((s, i) => (
          <SignalCard key={`${s.wallet_address}-${s.block_time}-${i}`} signal={s} />
        ))}
      </div>

      {signals.length === 0 && (
        <div className="py-20 text-center text-fg-muted">
          No signals found in the last 7 days
        </div>
      )}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-bg-card px-6 py-2.5 text-sm font-medium text-fg-subtle transition-colors hover:bg-bg-elevated hover:text-foreground disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
