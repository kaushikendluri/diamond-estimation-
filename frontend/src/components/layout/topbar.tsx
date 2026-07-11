"use client";

import { useState } from "react";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar-content";
import { ThemeToggle } from "./theme-toggle";
import { NotificationsMenu } from "./notifications-menu";
import { UserMenu } from "./user-menu";
import { CommandPalette } from "./command-palette";

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-[oklch(0.145_0_0_/_80%)] px-4 backdrop-blur-xl lg:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <SheetContent side="left" className="w-64 border-white/10 bg-[oklch(0.145_0_0)] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <button
        onClick={() => setPaletteOpen(true)}
        className="glass flex w-full max-w-sm items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search pages, uploads, actions...</span>
        <span className="sm:hidden">Search...</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] sm:flex">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <NotificationsMenu />
        <ThemeToggle />
        <div className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
        <UserMenu />
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
