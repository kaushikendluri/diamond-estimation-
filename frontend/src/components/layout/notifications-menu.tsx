"use client";

import { Bell, Gem, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/store/history-store";
import { formatDate } from "@/lib/format";

export function NotificationsMenu() {
  const results = useHistoryStore((s) => s.results).slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          {results.length > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--brand-pink)] animate-pulse-glow" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 glass-strong">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {results.length === 0 && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No notifications yet — run a detection to see updates here.
          </div>
        )}
        {results.map((r) => (
          <div key={r.id} className="flex items-start gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-white/5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-cyan)]/15">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--brand-cyan)]" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{r.fileName}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Gem className="h-3 w-3" /> {r.totalDiamonds} diamonds detected
              </p>
              <p className="text-[11px] text-muted-foreground/70">{formatDate(r.createdAt)}</p>
            </div>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
