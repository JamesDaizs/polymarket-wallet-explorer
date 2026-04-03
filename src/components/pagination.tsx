"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/format";

interface PaginationProps {
  page: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, hasMore, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          page <= 1
            ? "cursor-not-allowed text-fg-faint"
            : "text-fg-muted hover:bg-bg-card hover:text-foreground"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <span className="px-3 text-sm text-fg-muted">Page {page}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasMore}
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          !hasMore
            ? "cursor-not-allowed text-fg-faint"
            : "text-fg-muted hover:bg-bg-card hover:text-foreground"
        )}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
