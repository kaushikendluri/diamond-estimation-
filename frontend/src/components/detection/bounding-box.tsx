"use client";

import { memo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Diamond } from "@/types/diamond";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<Diamond["status"], string> = {
  verified: "border-emerald-400",
  pending: "border-amber-400",
  flagged: "border-rose-400",
};

interface BoundingBoxProps {
  diamond: Diamond;
  imageWidth: number;
  imageHeight: number;
  active: boolean;
  hovered: boolean;
  dimmed: boolean;
  onSelect: (id: number) => void;
  onHoverChange: (id: number | null) => void;
}

function BoundingBoxImpl({
  diamond,
  imageWidth,
  imageHeight,
  active,
  hovered,
  dimmed,
  onSelect,
  onHoverChange,
}: BoundingBoxProps) {
  const left = (diamond.bbox.x1 / imageWidth) * 100;
  const top = (diamond.bbox.y1 / imageHeight) * 100;
  const width = ((diamond.bbox.x2 - diamond.bbox.x1) / imageWidth) * 100;
  const height = ((diamond.bbox.y2 - diamond.bbox.y1) / imageHeight) * 100;
  const emphasized = active || hovered;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          id={`diamond-box-${diamond.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(diamond.id);
          }}
          onMouseEnter={() => onHoverChange(diamond.id)}
          onMouseLeave={() => onHoverChange(null)}
          className={cn(
            "absolute rounded-[3px] border transition-all duration-150",
            STATUS_COLOR[diamond.status],
            emphasized
              ? "z-20 border-2 shadow-[0_0_0_2px_rgba(0,0,0,0.4),0_0_16px_var(--brand-cyan)]"
              : "z-10 border",
            dimmed && !emphasized && "opacity-25"
          )}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${width}%`,
            height: `${height}%`,
          }}
        >
          {emphasized && (
            <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white shadow">
              #{diamond.id} · {formatPercent(diamond.confidence, 0)} · {Math.round(diamond.width)}×
              {Math.round(diamond.height)}px
            </span>
          )}
          {!emphasized && (
            <span className="absolute -top-3.5 left-0 rounded-sm bg-black/60 px-1 text-[8px] leading-tight text-white/90">
              {diamond.id}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="glass-strong text-xs">
        <p className="font-medium">Diamond #{diamond.id}</p>
        <p>Confidence: {formatPercent(diamond.confidence)}</p>
        <p>
          {Math.round(diamond.width)} × {Math.round(diamond.height)} px · {diamond.cutType}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export const BoundingBox = memo(BoundingBoxImpl);
