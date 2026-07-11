"use client";

import { Gem, ArrowUpDown, Maximize, Minimize, Target, Timer, Ruler } from "lucide-react";
import { useDetection } from "./detection-context";
import { formatDuration, formatPercent } from "@/lib/format";

export function SummaryCards() {
  const { result } = useDetection();
  const { diamonds } = result;

  const avgWidth = diamonds.reduce((a, d) => a + d.width, 0) / (diamonds.length || 1);
  const avgHeight = diamonds.reduce((a, d) => a + d.height, 0) / (diamonds.length || 1);
  const largest = diamonds.reduce((max, d) => (d.area > (max?.area ?? -Infinity) ? d : max), diamonds[0]);
  const smallest = diamonds.reduce((min, d) => (d.area < (min?.area ?? Infinity) ? d : min), diamonds[0]);

  const cards = [
    { label: "Total Diamonds Detected", value: `${result.totalDiamonds}`, icon: Gem, hue: "cyan" },
    { label: "Average Width", value: `${avgWidth.toFixed(1)} px`, icon: Ruler, hue: "violet" },
    { label: "Average Height", value: `${avgHeight.toFixed(1)} px`, icon: ArrowUpDown, hue: "violet" },
    {
      label: "Largest Diamond",
      value: largest ? `#${largest.id} · ${largest.width.toFixed(0)}×${largest.height.toFixed(0)}px` : "—",
      icon: Maximize,
      hue: "pink",
    },
    {
      label: "Smallest Diamond",
      value: smallest ? `#${smallest.id} · ${smallest.width.toFixed(0)}×${smallest.height.toFixed(0)}px` : "—",
      icon: Minimize,
      hue: "pink",
    },
    { label: "Detection Accuracy", value: formatPercent(result.detectionAccuracy), icon: Target, hue: "amber" },
    { label: "Total Processing Time", value: formatDuration(result.processingTimeMs), icon: Timer, hue: "cyan" },
  ] as const;

  const HUE: Record<string, string> = {
    cyan: "from-[var(--brand-cyan)]/20 to-transparent text-[var(--brand-cyan)]",
    violet: "from-[var(--brand-violet)]/20 to-transparent text-[var(--brand-violet)]",
    pink: "from-[var(--brand-pink)]/20 to-transparent text-[var(--brand-pink)]",
    amber: "from-amber-400/20 to-transparent text-amber-400",
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {cards.map((c) => (
        <div key={c.label} className="glass rounded-2xl p-4">
          <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${HUE[c.hue]}`}>
            <c.icon className="h-4 w-4" />
          </div>
          <p className="truncate text-sm font-semibold">{c.value}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
