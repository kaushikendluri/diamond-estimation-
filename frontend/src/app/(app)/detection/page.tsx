"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Download, RotateCcw, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { UploadArea } from "@/components/detection/upload-area";
import { ProcessingOverlay } from "@/components/detection/processing-overlay";
import { OriginalImagePane } from "@/components/detection/original-image-pane";
import { ImageViewer } from "@/components/detection/image-viewer";
import { SummaryCards } from "@/components/detection/summary-cards";
import { DiamondTable } from "@/components/detection/diamond-table";
import { DiamondDetailPanel } from "@/components/detection/diamond-detail-panel";
import { DetectionProvider } from "@/components/detection/detection-context";
import { uploadAndDetect } from "@/services/detection-service";
import { DetectionResult, ProcessingStage } from "@/types/diamond";
import { useHistoryStore } from "@/store/history-store";
import { fileToThumbnailDataUrl } from "@/lib/image-utils";
import { exportDiamondsCsv } from "@/lib/export";

export default function DetectionPage() {
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const addResult = useHistoryStore((s) => s.addResult);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      return uploadAndDetect(file, (s, p) => {
        setStage(s);
        setProgress(p);
      });
    },
    onSuccess: async (detection, file) => {
      setResult(detection);
      try {
        const thumb = await fileToThumbnailDataUrl(file);
        addResult({ ...detection, originalImageUrl: thumb, processedImageUrl: thumb });
      } catch {
        addResult(detection);
      }
      toast.success(`Detected ${detection.totalDiamonds} diamonds in ${file.name}`);
    },
    onError: () => {
      toast.error("Detection failed. Please try again.");
    },
  });

  const handleAnalyze = (file: File) => mutation.mutate(file);

  const handleReset = () => {
    mutation.reset();
    setResult(null);
    setStage("idle");
    setProgress(0);
    setPreviewUrl(null);
    setPendingFile(null);
  };

  const isProcessing = mutation.isPending;
  const isError = mutation.isError;

  return (
    <div>
      <PageHeader
        title="Detection"
        description="Upload a jewelry photo to detect and measure every diamond."
        actions={
          result && (
            <>
              <Button
                variant="outline"
                className="glass gap-2 border-white/15"
                onClick={() => exportDiamondsCsv(result.diamonds, `${result.fileName}-full-report.csv`)}
              >
                <Download className="h-4 w-4" /> Download Results
              </Button>
              <Button variant="outline" className="glass gap-2 border-white/15" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" /> New Detection
              </Button>
            </>
          )
        }
      />

      <AnimatePresence mode="wait">
        {!result && !isProcessing && !isError && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <UploadArea onAnalyze={handleAnalyze} disabled={isProcessing} />
          </motion.div>
        )}

        {isProcessing && previewUrl && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProcessingOverlay imageUrl={previewUrl} stage={stage} progress={progress} />
          </motion.div>
        )}

        {isError && !isProcessing && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass flex flex-col items-center gap-4 rounded-3xl p-14 text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-400/15">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <p className="font-medium">Detection failed</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We couldn&apos;t process that image. Check your connection and try again.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="glass border-white/15" onClick={handleReset}>
                Choose another image
              </Button>
              <Button
                className="gap-2 bg-gradient-to-r from-[var(--brand-cyan)] to-[var(--brand-violet)] text-black hover:opacity-90"
                onClick={() => pendingFile && mutation.mutate(pendingFile)}
              >
                <Sparkles className="h-4 w-4" /> Retry
              </Button>
            </div>
          </motion.div>
        )}

        {result && !isProcessing && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <DetectionProvider result={result}>
              <div className="grid gap-5 lg:grid-cols-2">
                <OriginalImagePane />
                <ImageViewer />
              </div>
              <SummaryCards />
              <DiamondTable />
              <DiamondDetailPanel />
            </DetectionProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
