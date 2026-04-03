"use client";

import { useState } from "react";
import { cn } from "@/lib/format";
import type { WalletFilters } from "@/lib/types";

interface FilterSidebarProps {
  filters: WalletFilters;
  onApply: (filters: WalletFilters) => void;
  onClear: () => void;
}

const timeWindows = [
  { value: "7d", label: "7D" },
  { value: "14d", label: "14D" },
  { value: "30d", label: "30D" },
  { value: "all", label: "All" },
] as const;

const volumePresets = [
  { label: ">10K", value: 10000 },
  { label: ">50K", value: 50000 },
  { label: ">100K", value: 100000 },
  { label: ">200K", value: 200000 },
];

export function FilterSidebar({ filters, onApply, onClear }: FilterSidebarProps) {
  const [local, setLocal] = useState<WalletFilters>(filters);

  const update = (partial: Partial<WalletFilters>) => {
    setLocal((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-fg-faint">
          Time Window
        </label>
        <div className="flex gap-1">
          {timeWindows.map((tw) => (
            <button
              key={tw.value}
              onClick={() => update({ timeWindow: tw.value })}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors",
                local.timeWindow === tw.value
                  ? "bg-brand text-white"
                  : "bg-bg-card text-fg-muted hover:bg-bg-elevated"
              )}
            >
              {tw.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-fg-faint">
          Volume
        </label>
        <div className="flex flex-wrap gap-1 mb-2">
          {volumePresets.map((p) => (
            <button
              key={p.value}
              onClick={() => update({ volumeMin: p.value, volumeMax: undefined })}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                local.volumeMin === p.value
                  ? "bg-brand text-white"
                  : "bg-bg-card text-fg-muted hover:bg-bg-elevated"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={local.volumeMin ?? ""}
            onChange={(e) => update({ volumeMin: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-border-subtle bg-bg-card px-2.5 py-1.5 text-xs text-foreground placeholder:text-fg-faint focus:border-brand focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={local.volumeMax ?? ""}
            onChange={(e) => update({ volumeMax: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-border-subtle bg-bg-card px-2.5 py-1.5 text-xs text-foreground placeholder:text-fg-faint focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <FilterRange label="PnL ($)" min={local.pnlMin} max={local.pnlMax}
        onMinChange={(v) => update({ pnlMin: v })} onMaxChange={(v) => update({ pnlMax: v })} />

      <FilterRange label="ROI (%)" min={local.roiMin} max={local.roiMax}
        onMinChange={(v) => update({ roiMin: v })} onMaxChange={(v) => update({ roiMax: v })} />

      <FilterRange label="Win Rate (%)" min={local.winRateMin} max={local.winRateMax}
        onMinChange={(v) => update({ winRateMin: v })} onMaxChange={(v) => update({ winRateMax: v })} />

      <FilterRange label="Trades" min={local.tradesMin} max={local.tradesMax}
        onMinChange={(v) => update({ tradesMin: v })} onMaxChange={(v) => update({ tradesMax: v })} />

      <FilterRange label="Markets" min={local.marketsMin} max={local.marketsMax}
        onMinChange={(v) => update({ marketsMin: v })} onMaxChange={(v) => update({ marketsMax: v })} />

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onApply(local)}
          className="flex-1 rounded-lg bg-brand py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dim"
        >
          Apply
        </button>
        <button
          onClick={onClear}
          className="flex-1 rounded-lg border border-border-subtle py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-bg-card"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function FilterRange({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
}: {
  label: string;
  min?: number;
  max?: number;
  onMinChange: (v: number | undefined) => void;
  onMaxChange: (v: number | undefined) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-fg-faint">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min"
          value={min ?? ""}
          onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : undefined)}
          className="w-full rounded-lg border border-border-subtle bg-bg-card px-2.5 py-1.5 text-xs text-foreground placeholder:text-fg-faint focus:border-brand focus:outline-none"
        />
        <input
          type="number"
          placeholder="Max"
          value={max ?? ""}
          onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : undefined)}
          className="w-full rounded-lg border border-border-subtle bg-bg-card px-2.5 py-1.5 text-xs text-foreground placeholder:text-fg-faint focus:border-brand focus:outline-none"
        />
      </div>
    </div>
  );
}
