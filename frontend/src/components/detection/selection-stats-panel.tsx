"use client";

import { motion } from "framer-motion";
import { Gem, Ruler, Square, MapPin, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectionRect } from "./detection-context";
import { normalizeRect } from "@/lib/selection";

export function SelectionStatsPanel({
  rect,
  count,
  avgWidth,
  avgHeight,
  totalArea,
  onClear,
  onDownload,
}: {
  rect: SelectionRect;
  count: number;
  avgWidth: number;
  avgHeight: number;
  totalArea: number;
  onClear: () => void;
  onDownload: () => void;
}) {
  const n = normalizeRect(rect);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong mx-4 mb-4 mt-3 flex flex-col gap-4 rounded-2xl p-4 sm:mx-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
        <Stat icon={Gem} label="Diamonds in region" value={`${count}`} />
        <Stat icon={Ruler} label="Avg. width × height" value={`${avgWidth.toFixed(1)} × ${avgHeight.toFixed(1)}px`} />
        <Stat icon={Square} label="Total area" value={`${totalArea.toFixed(0)} px²`} />
        <Stat
          icon={MapPin}
          label="Region coordinates"
          value={`(${Math.round(n.x1)}, ${Math.round(n.y1)}) → (${Math.round(n.x2)}, ${Math.round(n.y2)})`}
        />
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" variant="outline" className="glass gap-1.5 border-white/15" onClick={onDownload}>
          <Download className="h-3.5 w-3.5" /> Download region
        </Button>
        <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={onClear}>
          <X className="h-3.5 w-3.5" /> Clear
        </Button>
      </div>
    </motion.div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gem;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="mt-0.5 font-medium tabular-nums">{value}</p>
    </div>
  );
}
