"use client";

import { useDetection } from "./detection-context";
import { formatBytes } from "@/lib/format";

export function OriginalImagePane() {
  const { result } = useDetection();

  return (
    <div className="glass flex flex-col overflow-hidden rounded-3xl">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-sm font-medium">Original Image</p>
        <p className="text-xs text-muted-foreground">
          {result.imageWidth} × {result.imageHeight}px · {formatBytes(result.fileSizeBytes)}
        </p>
      </div>
      <div className="relative flex flex-1 items-center justify-center bg-black/30 aspect-[4/3] sm:aspect-video">
        <img
          src={result.originalImageUrl}
          alt={result.fileName}
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
