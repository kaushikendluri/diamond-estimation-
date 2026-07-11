"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settings-store";

export function useThemeSync() {
  const theme = useSettingsStore((s) => s.settings.theme);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => root.classList.toggle("dark", dark);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const listener = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
    apply(theme === "dark");
  }, [theme]);
}

export function useThemeToggle() {
  const theme = useSettingsStore((s) => s.settings.theme);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const toggle = () => updateSettings({ theme: theme === "dark" ? "light" : "dark" });
  return { theme, toggle };
}
