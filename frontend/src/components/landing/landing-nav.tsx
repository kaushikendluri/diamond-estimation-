"use client";

import Link from "next/link";
import { Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[oklch(0.145_0_0_/_65%)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--brand-cyan)] via-[var(--brand-violet)] to-[var(--brand-pink)]">
            <Gem className="h-4 w-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold">Lumina AI</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/dashboard">Sign in</Link>
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-[var(--brand-cyan)] to-[var(--brand-violet)] text-black hover:opacity-90"
            asChild
          >
            <Link href="/detection">Launch app</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
