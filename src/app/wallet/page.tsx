"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Wallet } from "lucide-react";

export default function WalletInputPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = address.trim().toLowerCase();
    if (!/^0x[a-f0-9]{40}$/i.test(trimmed)) {
      setError("Enter a valid 0x address (42 characters)");
      return;
    }
    router.push(`/wallet/${trimmed}`);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/15">
            <Wallet className="h-6 w-6 text-brand" />
          </div>
          <h1 className="text-2xl font-bold">Wallet Analysis</h1>
          <p className="text-sm text-fg-muted">
            Enter a Polymarket wallet address to see trading stats and get an
            AI-powered analysis report.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint" />
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError("");
              }}
              placeholder="0x..."
              className="w-full rounded-lg border border-border-base bg-bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-fg-faint focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-negative">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dim"
          >
            Analyze Wallet
          </button>
        </form>

        <p className="text-center text-xs text-fg-faint">
          Polymarket wallet addresses only. Powered by Surf API.
        </p>
      </div>
    </div>
  );
}
