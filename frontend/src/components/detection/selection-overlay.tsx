"use client";

import { SelectionRect } from "./detection-context";

type Handle = "tl" | "tr" | "bl" | "br";

export function SelectionOverlay({
  rect,
  imageWidth,
  imageHeight,
  onMoveStart,
  onResizeStart,
}: {
  rect: SelectionRect;
  imageWidth: number;
  imageHeight: number;
  onMoveStart: (e: React.PointerEvent) => void;
  onResizeStart: (handle: Handle, e: React.PointerEvent) => void;
}) {
  const left = (rect.x1 / imageWidth) * 100;
  const top = (rect.y1 / imageHeight) * 100;
  const width = ((rect.x2 - rect.x1) / imageWidth) * 100;
  const height = ((rect.y2 - rect.y1) / imageHeight) * 100;

  const handles: { key: Handle; className: string }[] = [
    { key: "tl", className: "-left-1.5 -top-1.5 cursor-nwse-resize" },
    { key: "tr", className: "-right-1.5 -top-1.5 cursor-nesw-resize" },
    { key: "bl", className: "-left-1.5 -bottom-1.5 cursor-nesw-resize" },
    { key: "br", className: "-right-1.5 -bottom-1.5 cursor-nwse-resize" },
  ];

  return (
    <div
      className="absolute z-30 border-2 border-dashed border-[var(--brand-pink)] bg-[var(--brand-pink)]/10"
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
      onPointerDown={onMoveStart}
    >
      {handles.map((h) => (
        <span
          key={h.key}
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeStart(h.key, e);
          }}
          className={`absolute h-3 w-3 rounded-full border-2 border-[var(--brand-pink)] bg-white ${h.className}`}
        />
      ))}
    </div>
  );
}

export type { Handle };
