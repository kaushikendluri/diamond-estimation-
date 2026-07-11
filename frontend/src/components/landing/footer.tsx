import Link from "next/link";
import { Gem } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--brand-cyan)] to-[var(--brand-violet)]">
            <Gem className="h-3.5 w-3.5 text-black" />
          </div>
          <span className="text-sm font-medium">Lumina AI</span>
        </Link>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Lumina AI. Built for jewelry manufacturers &amp; grading labs.
        </p>
      </div>
    </footer>
  );
}
