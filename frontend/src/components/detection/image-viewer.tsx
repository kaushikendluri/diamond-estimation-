"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  MousePointerSquareDashed,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDetection, SelectionRect } from "./detection-context";
import { BoundingBox } from "./bounding-box";
import { SelectionOverlay, type Handle } from "./selection-overlay";
import { SelectionStatsPanel } from "./selection-stats-panel";
import { diamondsInRect, selectionStats, normalizeRect } from "@/lib/selection";
import { exportDiamondsCsv } from "@/lib/export";
import { toast } from "sonner";

type DragMode = "draw" | "move" | "resize-tl" | "resize-tr" | "resize-bl" | "resize-br" | null;

export function ImageViewer() {
  const {
    result,
    selectedId,
    setSelectedId,
    hoveredId,
    setHoveredId,
    selectionMode,
    setSelectionMode,
    selectionRect,
    setSelectionRect,
    zoomRequest,
    setDetailOpen,
  } = useDetection();

  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const dragState = useRef<{
    mode: DragMode;
    originRect: SelectionRect | null;
    originPointer: { x: number; y: number } | null;
  }>({ mode: null, originRect: null, originPointer: null });

  const { imageWidth, imageHeight, diamonds } = result;

  useEffect(() => {
    if (!zoomRequest) return;
    const el = document.getElementById(`diamond-box-${zoomRequest.diamondId}`);
    if (el && transformRef.current) {
      transformRef.current.zoomToElement(el, 3.2, 500, "easeOut");
    }
  }, [zoomRequest]);

  const pointToImageCoords = useCallback(
    (clientX: number, clientY: number) => {
      const rect = surfaceRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const px = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
      return { x: px * imageWidth, y: py * imageHeight };
    },
    [imageWidth, imageHeight]
  );

  const onSurfacePointerDown = (e: React.PointerEvent) => {
    if (!selectionMode) return;
    if ((e.target as HTMLElement).closest("[data-selection-handle]")) return;
    const { x, y } = pointToImageCoords(e.clientX, e.clientY);
    dragState.current = { mode: "draw", originRect: { x1: x, y1: y, x2: x, y2: y }, originPointer: { x, y } };
    setSelectionRect({ x1: x, y1: y, x2: x, y2: y });
  };

  const onMoveStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!selectionRect) return;
    const { x, y } = pointToImageCoords(e.clientX, e.clientY);
    dragState.current = { mode: "move", originRect: { ...selectionRect }, originPointer: { x, y } };
  };

  const onResizeStart = (handle: Handle, e: React.PointerEvent) => {
    e.stopPropagation();
    if (!selectionRect) return;
    const { x, y } = pointToImageCoords(e.clientX, e.clientY);
    const modeMap: Record<Handle, DragMode> = {
      tl: "resize-tl",
      tr: "resize-tr",
      bl: "resize-bl",
      br: "resize-br",
    };
    dragState.current = { mode: modeMap[handle], originRect: { ...selectionRect }, originPointer: { x, y } };
  };

  useEffect(() => {
    let rafId: number | null = null;
    let pendingEvent: PointerEvent | null = null;

    const applyMove = (e: PointerEvent) => {
      const { mode, originRect, originPointer } = dragState.current;
      if (!mode || !originRect || !originPointer) return;
      const { x, y } = pointToImageCoords(e.clientX, e.clientY);
      const dx = x - originPointer.x;
      const dy = y - originPointer.y;

      if (mode === "draw") {
        setSelectionRect({ x1: originRect.x1, y1: originRect.y1, x2: x, y2: y });
      } else if (mode === "move") {
        const w = originRect.x2 - originRect.x1;
        const h = originRect.y2 - originRect.y1;
        let nx1 = originRect.x1 + dx;
        let ny1 = originRect.y1 + dy;
        nx1 = Math.min(Math.max(0, nx1), imageWidth - w);
        ny1 = Math.min(Math.max(0, ny1), imageHeight - h);
        setSelectionRect({ x1: nx1, y1: ny1, x2: nx1 + w, y2: ny1 + h });
      } else {
        const r = { ...originRect };
        if (mode === "resize-tl") { r.x1 = originRect.x1 + dx; r.y1 = originRect.y1 + dy; }
        if (mode === "resize-tr") { r.x2 = originRect.x2 + dx; r.y1 = originRect.y1 + dy; }
        if (mode === "resize-bl") { r.x1 = originRect.x1 + dx; r.y2 = originRect.y2 + dy; }
        if (mode === "resize-br") { r.x2 = originRect.x2 + dx; r.y2 = originRect.y2 + dy; }
        setSelectionRect(r);
      }
    };

    // Pointermove can fire far faster than React can usefully re-render
    // ~150 bounding boxes; batching to one update per animation frame is
    // what keeps dragging a selection box from feeling laggy.
    const onPointerMove = (e: PointerEvent) => {
      if (!dragState.current.mode) return;
      pendingEvent = e;
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (pendingEvent) applyMove(pendingEvent);
      });
    };
    const onPointerUp = () => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (dragState.current.mode && selectionRect) {
        setSelectionRect(normalizeRect(selectionRect));
      }
      dragState.current = { mode: null, originRect: null, originPointer: null };
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageWidth, imageHeight, selectionRect]);

  // The rectangle itself (SelectionOverlay) tracks the pointer every frame
  // for a smooth drag feel, but recomputing which of ~200 diamonds fall
  // inside it — and re-rendering all of their `dimmed` state — is too
  // expensive to do every frame. Debouncing that heavier recompute keeps
  // the box itself smooth while it settles a beat after the pointer stops.
  const [regionRect, setRegionRect] = useState<SelectionRect | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setRegionRect(selectionRect), 80);
    return () => clearTimeout(t);
  }, [selectionRect]);

  const selectedInRegion = useMemo(
    () => (regionRect ? diamondsInRect(diamonds, regionRect) : []),
    [diamonds, regionRect]
  );
  const stats = selectionStats(selectedInRegion);
  const hasRealRect =
    regionRect && Math.abs(regionRect.x2 - regionRect.x1) > 4 && Math.abs(regionRect.y2 - regionRect.y1) > 4;

  return (
    <div
      className={cn(
        "glass flex flex-col overflow-hidden rounded-3xl",
        fullscreen && "fixed inset-4 z-50 sm:inset-8"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Processed Image</p>
          <p className="text-xs text-muted-foreground">
            {diamonds.length} diamonds detected · click a box or table row to inspect
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant={selectionMode ? "default" : "outline"}
            className={cn(
              "gap-1.5",
              selectionMode
                ? "bg-gradient-to-r from-[var(--brand-cyan)] to-[var(--brand-violet)] text-black hover:opacity-90"
                : "glass border-white/15"
            )}
            onClick={() => setSelectionMode(!selectionMode)}
          >
            <MousePointerSquareDashed className="h-3.5 w-3.5" />
            Selection Mode
          </Button>
          <TransformControls transformRef={transformRef} />
          <Button
            size="sm"
            variant="outline"
            className="glass border-white/15"
            onClick={() => setFullscreen((f) => !f)}
          >
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <div className={cn("relative flex-1 bg-black/30", fullscreen ? "h-full" : "aspect-[4/3] sm:aspect-video")}>
        <TransformWrapper
          ref={transformRef}
          minScale={0.5}
          maxScale={8}
          initialScale={1}
          panning={{ disabled: selectionMode }}
          doubleClick={{ disabled: true }}
          wheel={{ step: 0.15 }}
        >
          <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
            <div
              ref={surfaceRef}
              onPointerDown={onSurfacePointerDown}
              className={cn("relative", selectionMode && "cursor-crosshair")}
              style={{ aspectRatio: `${imageWidth} / ${imageHeight}`, width: "min(100%, 100%)", maxHeight: "100%" }}
            >
              <img
                src={result.processedImageUrl}
                alt={result.fileName}
                className="pointer-events-none absolute inset-0 h-full w-full select-none rounded-lg object-fill"
                draggable={false}
              />

              <div className={cn(selectionMode && "pointer-events-none")}>
                {diamonds.map((d) => (
                  <BoundingBox
                    key={d.id}
                    diamond={d}
                    imageWidth={imageWidth}
                    imageHeight={imageHeight}
                    active={selectedId === d.id}
                    hovered={!selectionMode && hoveredId === d.id}
                    dimmed={Boolean(hasRealRect) && !selectedInRegion.includes(d)}
                    onSelect={(id) => {
                      setSelectedId(id);
                      setDetailOpen(true);
                    }}
                    onHoverChange={setHoveredId}
                  />
                ))}
              </div>

              {selectionMode && selectionRect && (
                <div data-selection-handle>
                  <SelectionOverlay
                    rect={selectionRect}
                    imageWidth={imageWidth}
                    imageHeight={imageHeight}
                    onMoveStart={onMoveStart}
                    onResizeStart={onResizeStart}
                  />
                </div>
              )}
            </div>
          </TransformComponent>
        </TransformWrapper>

        {selectionMode && !selectionRect && (
          <div className="glass-strong pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground">
            <Info className="mr-1.5 inline h-3 w-3" /> Click and drag on the image to select a region
          </div>
        )}
      </div>

      {selectionMode && hasRealRect && regionRect && (
        <SelectionStatsPanel
          rect={regionRect}
          count={stats.count}
          avgWidth={stats.avgWidth}
          avgHeight={stats.avgHeight}
          totalArea={stats.totalArea}
          onClear={() => setSelectionRect(null)}
          onDownload={() => {
            if (selectedInRegion.length === 0) {
              toast.error("No diamonds in the selected region.");
              return;
            }
            exportDiamondsCsv(selectedInRegion, `${result.fileName}-region-report.csv`);
            toast.success(`Exported ${selectedInRegion.length} diamonds from the selected region.`);
          }}
        />
      )}
    </div>
  );
}

function TransformControls({
  transformRef,
}: {
  transformRef: React.MutableRefObject<ReactZoomPanPinchRef | null>;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="outline"
        className="glass border-white/15"
        onClick={() => transformRef.current?.zoomOut()}
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="glass border-white/15"
        onClick={() => transformRef.current?.zoomIn()}
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="glass gap-1.5 border-white/15"
        onClick={() => transformRef.current?.resetTransform()}
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset
      </Button>
    </div>
  );
}
