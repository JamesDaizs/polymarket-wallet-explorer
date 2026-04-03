"use client";

import { cn } from "@/lib/format";

interface CategoryTabsProps {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}

export function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            active === cat
              ? "bg-brand text-white"
              : "bg-bg-card text-fg-muted hover:bg-bg-elevated hover:text-foreground"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
