"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeToggle } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggle } = useThemeToggle();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="relative rounded-xl text-muted-foreground hover:text-foreground"
      aria-label="Toggle dark mode"
    >
      <Sun
        className={`h-4.5 w-4.5 transition-all ${theme === "dark" ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
      />
      <Moon
        className={`absolute h-4.5 w-4.5 transition-all ${theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"}`}
      />
    </Button>
  );
}
