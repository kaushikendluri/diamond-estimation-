"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { DetectionResult } from "@/types/diamond";

export interface SelectionRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface ZoomRequest {
  diamondId: number;
  nonce: number;
}

interface DetectionContextValue {
  result: DetectionResult;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  hoveredId: number | null;
  setHoveredId: (id: number | null) => void;
  selectionMode: boolean;
  setSelectionMode: (v: boolean) => void;
  selectionRect: SelectionRect | null;
  setSelectionRect: (rect: SelectionRect | null) => void;
  zoomRequest: ZoomRequest | null;
  requestZoomTo: (diamondId: number) => void;
  detailOpen: boolean;
  setDetailOpen: (v: boolean) => void;
}

const DetectionContext = createContext<DetectionContextValue | null>(null);

export function DetectionProvider({
  result,
  children,
}: {
  result: DetectionResult;
  children: React.ReactNode;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [zoomRequest, setZoomRequest] = useState<ZoomRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const requestZoomTo = (diamondId: number) =>
    setZoomRequest((prev) => ({ diamondId, nonce: (prev?.nonce ?? 0) + 1 }));

  const value = useMemo(
    () => ({
      result,
      selectedId,
      setSelectedId,
      hoveredId,
      setHoveredId,
      selectionMode,
      setSelectionMode: (v: boolean) => {
        setSelectionMode(v);
        if (!v) setSelectionRect(null);
      },
      selectionRect,
      setSelectionRect,
      zoomRequest,
      requestZoomTo,
      detailOpen,
      setDetailOpen,
    }),
    [result, selectedId, hoveredId, selectionMode, selectionRect, zoomRequest, detailOpen]
  );

  return <DetectionContext.Provider value={value}>{children}</DetectionContext.Provider>;
}

export function useDetection() {
  const ctx = useContext(DetectionContext);
  if (!ctx) throw new Error("useDetection must be used within DetectionProvider");
  return ctx;
}
