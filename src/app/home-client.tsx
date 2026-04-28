"use client";

import { useState, useCallback } from "react";
import { MarketCard } from "@/components/market-card";
import { CategoryTabs } from "@/components/category-tabs";
import { Loader2 } from "lucide-react";
import type { Market } from "@/lib/types";

interface HomeClientProps {
  initialMarkets: Market[];
  categories: string[];
}

export function HomeClient({ initialMarkets, categories }: HomeClientProps) {
  const [markets, setMarkets] = useState(initialMarkets);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(60);
  const [hasMore, setHasMore] = useState(initialMarkets.length >= 60);

  const handleCategoryChange = useCallback(async (cat: string) => {
    setCategory(cat);
    setLoading(true);
    setOffset(60);
    try {
      const params = new URLSearchParams({ limit: "60" });
      if (cat !== "All") params.set("category", cat);
      const res = await fetch(`/api/markets?${params}`);
      const data = await res.json();
      setMarkets(data.data);
      setHasMore(data.data.length >= 60);
    } catch (err) {
      console.error("Failed to fetch markets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "60",
        offset: String(offset),
      });
      if (category !== "All") params.set("category", category);
      const res = await fetch(`/api/markets?${params}`);
      const data = await res.json();
      setMarkets((prev) => [...prev, ...data.data]);
      setOffset((prev) => prev + 60);
      setHasMore(data.data.length >= 60);
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoading(false);
    }
  }, [category, offset]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold">Live Markets</h1>
        <p className="text-sm text-fg-muted">
          Active Polymarket markets ranked by weekly volume
        </p>
      </div>

      <div className="mb-6">
        <CategoryTabs
          categories={categories}
          active={category}
          onChange={handleCategoryChange}
        />
      </div>

      {loading && markets.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-fg-muted" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {markets.map((m) => (
              <MarketCard key={m.condition_id} market={m} />
            ))}
          </div>

          {markets.length === 0 && (
            <div className="py-20 text-center text-fg-muted">
              No markets found for this category
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
        </>
      )}
    </div>
  );
}
