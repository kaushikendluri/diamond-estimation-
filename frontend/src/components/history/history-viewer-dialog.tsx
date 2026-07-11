"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DetectionProvider } from "@/components/detection/detection-context";
import { OriginalImagePane } from "@/components/detection/original-image-pane";
import { ImageViewer } from "@/components/detection/image-viewer";
import { SummaryCards } from "@/components/detection/summary-cards";
import { DiamondTable } from "@/components/detection/diamond-table";
import { DiamondDetailPanel } from "@/components/detection/diamond-detail-panel";
import { DetectionResult } from "@/types/diamond";
import { formatDate } from "@/lib/format";

export function HistoryViewerDialog({
  result,
  onOpenChange,
}: {
  result: DetectionResult | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(result)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[oklch(0.145_0_0_/_98%)] sm:max-w-6xl">
        {result && (
          <>
            <DialogHeader>
              <DialogTitle>{result.fileName}</DialogTitle>
              <DialogDescription>Uploaded {formatDate(result.createdAt)}</DialogDescription>
            </DialogHeader>
            <DetectionProvider result={result}>
              <div className="space-y-6">
                <div className="grid gap-5 lg:grid-cols-2">
                  <OriginalImagePane />
                  <ImageViewer />
                </div>
                <SummaryCards />
                <DiamondTable />
                <DiamondDetailPanel />
              </div>
            </DetectionProvider>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
