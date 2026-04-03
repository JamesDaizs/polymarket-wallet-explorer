"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, User, Wallet } from "lucide-react";
import { cn } from "@/lib/format";

const links = [
  { href: "/", label: "Home", icon: BarChart3 },
  { href: "/signals", label: "Signals", icon: Activity },
  { href: "/wallet-filter", label: "Wallet Filter", icon: Wallet },
  { href: "/wallet", label: "Wallet", icon: User },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border-base bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span>PM Insider</span>
          </Link>

          <nav className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand/15 text-brand"
                      : "text-fg-muted hover:text-foreground hover:bg-bg-card"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
