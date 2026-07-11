"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Gem } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-cyan)] via-[var(--brand-violet)] to-[var(--brand-pink)] glow-violet">
          <Gem className="h-4.5 w-4.5 text-black" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Lumina AI</p>
          <p className="mt-1 text-[11px] leading-none text-muted-foreground">
            Diamond Intelligence
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl glass-strong glow-violet"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                className={cn(
                  "relative z-10 h-4.5 w-4.5 shrink-0",
                  active && "text-[var(--brand-cyan)]"
                )}
              />
              <span className="relative z-10 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 rounded-xl glass p-3.5">
        <p className="text-xs font-medium">Detection quota</p>
        <p className="mt-1 text-[11px] text-muted-foreground">248 / 500 images this month</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[49%] rounded-full bg-gradient-to-r from-[var(--brand-cyan)] to-[var(--brand-violet)]" />
        </div>
      </div>
    </div>
  );
}
