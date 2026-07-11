"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, ImageIcon, X, ScanLine, RotateCcw, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import { getImageDimensions } from "@/lib/image-utils";
import { toast } from "sonner";

const ACCEPTED_TYPES = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};
const MAX_SIZE = 20 * 1024 * 1024;

interface PreviewMeta {
  file: File;
  url: string;
  width: number;
  height: number;
  uploadedAt: Date;
}

export function UploadArea({
  onAnalyze,
  disabled,
}: {
  onAnalyze: (file: File) => void;
  disabled?: boolean;
}) {
  const [preview, setPreview] = useState<PreviewMeta | null>(null);

  const handleFile = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    try {
      const { width, height } = await getImageDimensions(url);
      setPreview({ file, url, width, height, uploadedAt: new Date() });
    } catch {
      toast.error("Could not read that image file.");
      URL.revokeObjectURL(url);
    }
  }, []);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const reason = rejections[0].errors[0]?.code;
        if (reason === "file-too-large") toast.error("Image must be under 20MB.");
        else if (reason === "file-invalid-type")
          toast.error("Only PNG, JPG, JPEG and WEBP images are supported.");
        else toast.error("That file couldn't be uploaded.");
        return;
      }
      if (accepted[0]) handleFile(accepted[0]);
    },
    [handleFile]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    noClick: true,
    disabled,
  });

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/")
      );
      const file = item?.getAsFile();
      if (file) handleFile(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile, disabled]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const reset = () => setPreview(null);

  return (
    <div>
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div
            {...getRootProps()}
            className={`glass relative flex min-h-[22rem] cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-10 text-center transition-colors ${
              isDragActive
                ? "border-[var(--brand-cyan)] bg-[var(--brand-cyan)]/5"
                : "border-white/15 hover:border-white/25"
            }`}
            onClick={open}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className="glass-strong glow-cyan flex h-16 w-16 items-center justify-center rounded-2xl"
            >
              <UploadCloud className="h-7 w-7 text-[var(--brand-cyan)]" />
            </motion.div>
            <div>
              <p className="text-lg font-medium">
                {isDragActive ? "Drop your image here" : "Drag & drop a jewelry image"}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                or click to browse — you can also paste an image with{" "}
                <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[11px]">
                  Ctrl/⌘+V
                </kbd>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5" />
              PNG, JPG, JPEG, WEBP — up to 20MB
            </div>
            <Button
              variant="outline"
              className="glass mt-2 gap-2 border-white/15"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              <Clipboard className="h-4 w-4" /> Browse files
            </Button>
          </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="glass overflow-hidden rounded-3xl"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-black/40">
              <img
                src={preview.url}
                alt={preview.file.name}
                className="h-full w-full object-contain"
              />
              <button
                onClick={reset}
                disabled={disabled}
                className="glass-strong absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground disabled:opacity-40"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-4">
                <Meta label="Filename" value={preview.file.name} />
                <Meta label="Resolution" value={`${preview.width} × ${preview.height}`} />
                <Meta label="Size" value={formatBytes(preview.file.size)} />
                <Meta
                  label="Uploaded"
                  value={preview.uploadedAt.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              </div>

              <div className="flex shrink-0 gap-2">
                <Button variant="outline" className="glass gap-2 border-white/15" onClick={reset} disabled={disabled}>
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
                <Button
                  className="gap-2 rounded-xl bg-gradient-to-r from-[var(--brand-cyan)] to-[var(--brand-violet)] text-black hover:opacity-90"
                  onClick={() => onAnalyze(preview.file)}
                  disabled={disabled}
                >
                  <ScanLine className="h-4 w-4" /> Analyze Image
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  );
}
