"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetection } from "./detection-context";
import { cropDiamond } from "@/lib/crop-image";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<string, string> = {
  verified: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
  pending: "bg-amber-400/15 text-amber-400 border-amber-400/30",
  flagged: "bg-rose-400/15 text-rose-400 border-rose-400/30",
};

export function DiamondDetailPanel() {
  const { result, selectedId, detailOpen, setDetailOpen } = useDetection();
  const diamond = result.diamonds.find((d) => d.id === selectedId) ?? null;
  const [cropUrl, setCropUrl] = useState<string | null>(null);
  const [loadingCrop, setLoadingCrop] = useState(false);

  useEffect(() => {
    if (!diamond) return;
    let cancelled = false;
    // Kicks off an async crop render for the newly selected diamond — the
    // eslint set-state-in-effect rule flags this fetch-on-dependency-change
    // pattern, but it's the intended behavior here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingCrop(true);
    setCropUrl(null);
    cropDiamond(result.processedImageUrl, diamond.bbox)
      .then((url) => {
        if (!cancelled) setCropUrl(url);
      })
      .catch(() => {
        if (!cancelled) setCropUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingCrop(false);
      });
    return () => {
      cancelled = true;
    };
  }, [diamond, result.processedImageUrl]);

  return (
    <Sheet open={detailOpen && Boolean(diamond)} onOpenChange={setDetailOpen}>
      <SheetContent className="w-full border-white/10 bg-[oklch(0.145_0_0_/_97%)] sm:max-w-sm">
        {diamond && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                Diamond #{diamond.id}
                <Badge variant="outline" className={cn("capitalize", STATUS_BADGE[diamond.status])}>
                  {diamond.status}
                </Badge>
              </SheetTitle>
              <SheetDescription>{diamond.cutType} cut · detected region detail</SheetDescription>
            </SheetHeader>

            <div className="space-y-5 px-4 pb-6">
              <div className="glass flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-black/40">
                {loadingCrop ? (
                  <Skeleton className="h-full w-full" />
                ) : cropUrl ? (
                  <img src={cropUrl} alt={`Diamond ${diamond.id} crop`} className="h-full w-full object-contain" />
                ) : (
                  <p className="text-xs text-muted-foreground">Preview unavailable</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Detail label="Diamond Number" value={`#${diamond.id}`} />
                <Detail label="Confidence Score" value={`${(diamond.confidence * 100).toFixed(1)}%`} />
                <Detail label="Width" value={`${diamond.width.toFixed(1)} px`} />
                <Detail label="Height" value={`${diamond.height.toFixed(1)} px`} />
                <Detail label="Area" value={`${diamond.area.toFixed(0)} px²`} />
                <Detail label="Aspect Ratio" value={diamond.aspectRatio.toFixed(2)} />
                <Detail label="Coordinates" value={`(${diamond.x.toFixed(0)}, ${diamond.y.toFixed(0)})`} />
                <Detail label="Cut Type" value={diamond.cutType ?? "—"} />
              </div>

              <div>
                <p className="text-[11px] text-muted-foreground">Bounding Box Values</p>
                <p className="mt-1 rounded-lg bg-white/5 px-3 py-2 font-mono text-xs">
                  x1: {diamond.bbox.x1.toFixed(1)}, y1: {diamond.bbox.y1.toFixed(1)}, x2:{" "}
                  {diamond.bbox.x2.toFixed(1)}, y2: {diamond.bbox.y2.toFixed(1)}
                </p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
