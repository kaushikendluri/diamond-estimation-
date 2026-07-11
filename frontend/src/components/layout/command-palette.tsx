"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/lib/nav-config";
import { Upload, Sparkles } from "lucide-react";
import { useHistoryStore } from "@/store/history-store";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const results = useHistoryStore((s) => s.results).slice(0, 5);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const go = (href: string) => {
    router.push(href);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Quick navigation" description="Jump to any page or recent detection">
      <CommandInput placeholder="Search pages, recent uploads, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go("/detection")}>
            <Upload /> Upload new image
          </CommandItem>
          <CommandItem onSelect={() => go("/analytics")}>
            <Sparkles /> View analytics
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Pages">
          {NAV_ITEMS.map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)}>
              <item.icon /> {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        {results.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent detections">
              {results.map((r) => (
                <CommandItem key={r.id} onSelect={() => go("/history")}>
                  <Sparkles /> {r.fileName} — {r.totalDiamonds} diamonds
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
